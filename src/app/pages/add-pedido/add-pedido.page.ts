import { Component, OnInit } from '@angular/core';
import { LoadingController, MenuController, ToastController } from '@ionic/angular';
import { Router, NavigationExtras, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Client } from 'src/app/models/client.model';
import { Product } from 'src/app/models/product.model';
import { AddPedidoService } from 'src/app/services/pedido/add-pedido.service';
import { StorageService } from 'src/app/services/storage/storage.service';

interface FormaPago {
  FPA_TIPO: string;
  FPA_DESCRIPCION: string;
}
interface Subzona {
  SZN_CODIGO: string;
  SZN_ZONA: string;
  SZN_DESCRIPCION: string;
}
interface Bodega {
  BOD_CODIGO: string;
  BOD_DESCRIPCION: string;
}

// clave de precio por producto
type PriceKey = 'IMA_PRECIO1' | 'IMA_PRECIO2' | 'IMA_PRECIO3';

@Component({
  selector: 'app-add-pedido',
  templateUrl: './add-pedido.page.html',
  styleUrls: ['./add-pedido.page.scss'],
})
export class AddPedidoPage implements OnInit {

  selectedClient: Client | undefined;
  selectedProducts: Product[] = [];

  // Totales
  IVA_PAGAR = 0;
  SUBTOTAL_PAGAR = 0;
  TOTAL_PAGAR = 0;

  // Opciones de precio
  storePrecios = [
    { TIPO: 'Prec. 1', VALOR: 'IMA_PRECIO1' as PriceKey },
    { TIPO: 'Prec. 2', VALOR: 'IMA_PRECIO2' as PriceKey },
    { TIPO: 'Prec. 3', VALOR: 'IMA_PRECIO3' as PriceKey },
  ];
  private defaultProductPrice: PriceKey = 'IMA_PRECIO1';

  // Cabecera
  obsCliente = '';
  plazoDias: number | null = null;
  fechaEntregaISO = new Date().toISOString();
  pagoContraEntrega = false;
  formaPago: string | null = 'E';
  obsPedido = '';
  subzona: string | null = null;

  // Catálogos
  formasPago: FormaPago[] = [];
  subzonas: Subzona[] = [];
  bodegas: Bodega[] = [];
  selectedBodega: string | null = null;

  // Control de bloqueo de bodega
  private lastSelectedBodega: string | null = null;
  get canChangeBodega(): boolean {
    return (this.selectedProducts?.length || 0) === 0;
  }

  // Usuario registrador (para filtrar bodegas en backend)
  usuarioRegistrador: string = '';

  // Respaldos para restaurar al desmarcar Pago contra entrega
  private prevFormaPago: string | null = null;
  private prevPlazoDias: number | null = null;

  // Endpoints
  private urlFormasPago = 'http://192.168.5.3/ferricenter/account/prog/transacciones/despachos_vendedores_nuevo_v2/datos-consultas_formapago.php';
  private urlSubzonas = 'http://192.168.5.3/ferricenter/account/datos/datos-consultas_subzonas_combo.php';
  private urlBodegas = 'http://192.168.5.3/ferricenter/account/prog/transacciones/despachos_vendedores_nuevo_v2/datos-consultas_bodegas.php';
  private urlConsultarPromocion = 'http://192.168.5.3/ferricenter/account/prog/transacciones/despachos_vendedores_nuevo_v2/consultar_promocion.php';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private menuCtrl: MenuController,
    private addPedidoService: AddPedidoService,
    private loadingController: LoadingController,
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  ionViewWillEnter() { this.menuCtrl.enable(true); }
  openMenu() { this.menuCtrl.open(); }

  async openClientSelector() {
    const navigationExtras: NavigationExtras = { state: { from: 'add-pedido' } };
    this.router.navigate(['select-client'], navigationExtras);
  }

  async openProductSelector() {
    if (!this.selectedBodega) {
      this.showToast('Seleccione una bodega antes de añadir productos', 'warning');
      return;
    }
    const navigationExtras: NavigationExtras = {
      state: { from: 'add-pedido', bodega: this.selectedBodega }
    };
    this.router.navigate(['select-product'], navigationExtras);
  }

  // ===== Helpers de precio por producto =====
  getProductPrice(product: Product): PriceKey {
    return ((product as any).SELECTED_PRICE as PriceKey) || this.defaultProductPrice;
  }

  setProductPrice(product: Product, priceKey: PriceKey) {
    if (product.ES_REGALO === 'si') {
      this.showToast('No se puede cambiar el precio de un producto REGALO', 'warning');
      return;
    }
    (product as any).SELECTED_PRICE = priceKey;

    // Reset descuentos al cambiar tipo precio
    product.DESCUENTO = 0;
    (product as any).DESCUENTO_EXCP = 0;

    // Recalcular max desc y totales + promo
    this.onProductPriceChange(product);
    this.consultarPromocion(product);
  }

  // ===== Productos =====
  removeProduct(product: Product) {
    // si es base, elimina regalos asociados
    this.eliminarRegaloAsociado(product.IMA_ARTICULO);
    // si es un regalo, solo se elimina el regalo
    this.selectedProducts = this.selectedProducts.filter(p => p !== product);
    this.showToast('Producto eliminado: ' + product.IMA_DESCRIPCION, 'danger');
    this.updateTotales();
    // cuando quede en 0, canChangeBodega vuelve a true automáticamente
  }

  updateProductQuantity(product: Product, quantity: number) {
    if (product.ES_REGALO === 'si') {
      this.showToast('No se puede modificar la cantidad de un producto REGALO', 'warning');
      product.CANTIDAD = (product as any)._lastQty || 1;
      return;
    }

    const q = Number(quantity) || 0;
    const factor = Number((product as any).FACTOR_CANTIDAD) || 1;
    const existencia = Number((product as any).EXISTENCIA) || 0;

    // Múltiplos (tolerancia)
    if (!this.esMultiplo(q, factor)) {
      this.showToast(`La cantidad debe ser múltiplo de ${factor}`, 'warning');
      product.CANTIDAD = (product as any)._lastQty || factor;
      return;
    }

    // Stock
    if (existencia && q > existencia) {
      this.showToast(`La cantidad ${q} supera el stock disponible (${existencia})`, 'warning');
      product.CANTIDAD = (product as any)._lastQty || existencia;
      return;
    }

    product.CANTIDAD = q;
    (product as any)._lastQty = q;

    this.updateTotales();
    this.consultarPromocion(product);
  }

  updateProductDiscount(product: Product, discount: number) {
    const d = Number(discount) || 0;
    const descEx = Number((product as any).DESCUENTO_EXCP) || 0;

    if (descEx !== 0) {
      this.showToast(`Ya hay descuento excepcional de ${descEx}%`, 'warning');
      product.DESCUENTO = (product as any)._lastDesc || 0;
      return;
    }

    if (d > product.MAX_DESC) {
      this.showToast(`El descuento no puede ser mayor que ${product.MAX_DESC}%`, 'danger');
      product.DESCUENTO = (product as any)._lastDesc || 0;
      return;
    }

    product.DESCUENTO = d < 0 ? 0 : d;
    (product as any)._lastDesc = product.DESCUENTO;

    this.consultarPromocion(product);
    this.updateTotales();
  }

  // Descuento efectivo = max(descuento normal, excepcional)
  getEffectiveDiscount(product: Product): number {
    const dn = Number(product.DESCUENTO || 0);
    const de = Number((product as any).DESCUENTO_EXCP || 0);
    return Math.max(dn, de);
  }

  getPrice(product: Product): number {
    const key = this.getProductPrice(product);
    switch (key) {
      case 'IMA_PRECIO1': return product.IMA_PRECIO1;
      case 'IMA_PRECIO2': return product.IMA_PRECIO2;
      case 'IMA_PRECIO3': return product.IMA_PRECIO3;
      default: return product.IMA_PRECIO1;
    }
  }

  updateTotales() {
    this.SUBTOTAL_PAGAR = this.selectedProducts.reduce((sum, product) => {
      const price = this.getPrice(product);
      const effDisc = this.getEffectiveDiscount(product);
      const discountedPrice = price * (1 - (effDisc / 100));
      return sum + (discountedPrice * (product.CANTIDAD || 1));
    }, 0);

    this.IVA_PAGAR = this.selectedProducts.reduce((sum, product) => {
      const price = this.getPrice(product);
      const effDisc = this.getEffectiveDiscount(product);
      const discountedPrice = price * (1 - (effDisc / 100));
      const productSubtotal = discountedPrice * (product.CANTIDAD || 1);

      let porIva = 0;
      if ((product as any).POR_IVA != null) {
        porIva = Number((product as any).POR_IVA);
      } else if ((product as any).IMA_PROCENTAJE_IVA != null) {
        porIva = Number((product as any).IMA_PROCENTAJE_IVA);
      }

      const productIVA = productSubtotal * porIva;
      return sum + productIVA;
    }, 0);

    this.TOTAL_PAGAR = this.SUBTOTAL_PAGAR + this.IVA_PAGAR;
  }

  calculateMaxDiscount(product: Product): number {
    const PRE1 = Number(product.IMA_PRECIO1) || 0;
    const PRE2 = Number(product.IMA_PRECIO2) || 0;
    const PRE3 = Number(product.IMA_PRECIO3) || 0;

    const key = this.getProductPrice(product);

    let maxDesc = 0;
    if (product.PROMOCION === 'no') {
      if (key === 'IMA_PRECIO3') maxDesc = 0;
      else if (key === 'IMA_PRECIO2' && PRE2) maxDesc = ((PRE2 - PRE3) / PRE2) * 100;
      else if (key === 'IMA_PRECIO1' && PRE1) maxDesc = ((PRE1 - PRE3) / PRE1) * 100;
    } else {
      maxDesc = Number(product.MAX_DESC) || 0;
    }

    if (!isFinite(maxDesc) || maxDesc < 0) maxDesc = 0;
    return parseFloat(maxDesc.toFixed(4));
  }

  onProductPriceChange(product: Product) {
    product.MAX_DESC = this.calculateMaxDiscount(product);

    if ((product.DESCUENTO || 0) > product.MAX_DESC) {
      product.DESCUENTO = product.MAX_DESC;
      this.showToast(`El descuento se ajustó al máximo permitido (${product.MAX_DESC}%).`, 'warning');
    }

    this.updateTotales();
  }

  // ===== Promociones / Regalos =====
  private eliminarRegaloAsociado(baseArticulo: string) {
    this.selectedProducts = this.selectedProducts.filter(p =>
      !(p.ES_REGALO === 'si' && (p as any).PROMO_BASE_ARTICULO === baseArticulo)
    );
  }

  private consultarPromocion(product: Product) {
    // Regla: si hay descuento → NO aplica regalo
    if (this.getEffectiveDiscount(product) > 0) {
      this.eliminarRegaloAsociado(product.IMA_ARTICULO);
      product.TIENE_PROMOCION = 'no';
      this.updateTotales();
      return;
    }

    if (!this.selectedBodega) return;

    const params = new HttpParams()
      .set('articulo', product.IMA_ARTICULO)
      .set('cantidad', String(product.CANTIDAD || 0))
      .set('bodega', this.selectedBodega);

    this.http.post<any>(this.urlConsultarPromocion, params).subscribe({
      next: (resp) => {
        this.eliminarRegaloAsociado(product.IMA_ARTICULO);

        if (resp && resp.success === 'true' && resp.data) {
          product.TIENE_PROMOCION = 'si';
          const promo = resp.data;

          (promo as any).PROMO_BASE_ARTICULO = product.IMA_ARTICULO;
          (promo as any).ES_REGALO = 'si';
          (promo as any).TIENE_PROMOCION = 'no';
          (promo as any).DESCUENTO = 0;
          (promo as any).DESCUENTO_EXCP = 0;
          (promo as any).MAX_DESC = 0;
          (promo as any).CANTIDAD = Number((promo as any).CANTIDAD || 1);

          if (!(promo as any).IMA_PRECIO1) (promo as any).IMA_PRECIO1 = 0;
          if (!(promo as any).IMA_PRECIO2) (promo as any).IMA_PRECIO2 = 0;
          if (!(promo as any).IMA_PRECIO3) (promo as any).IMA_PRECIO3 = 0;
          if ((promo as any).IMA_PROCENTAJE_IVA == null && (promo as any).POR_IVA != null) {
            (promo as any).IMA_PROCENTAJE_IVA = (promo as any).POR_IVA;
          }
          (promo as any).SELECTED_PRICE = 'IMA_PRECIO3'; // regalo neutral

          this.selectedProducts.push(promo as Product);
          this.showToast(`Promoción aplicada: regalo ${(promo as any).IMA_ARTICULO} x${(promo as any).CANTIDAD}`, 'success');
          this.updateTotales();
        } else {
          product.TIENE_PROMOCION = 'no';
          this.updateTotales();
        }
      },
      error: () => { /* silencioso */ }
    });
  }

  // ===== Utils =====
  private esMultiplo(valor: number, factor: number, tolerancia = 1e-8): boolean {
    if (factor === 0) return true;
    const v = Number((valor || 0).toFixed(4));
    const f = Number((factor || 1).toFixed(4));
    if (f === 0) return true;
    const coc = v / f;
    const red = Math.round(coc);
    return Math.abs(coc - red) < tolerancia;
  }

  private roundDownToMultiple(value: number, factor: number): number {
    if (factor <= 0) return Math.floor(value);
    return Math.floor(value / factor) * factor;
  }

  private hasSSTRATR10(): boolean {
    return this.selectedProducts.some(p => String(p.IMA_ARTICULO || '').toUpperCase().trim() === 'SSTRATR10');
  }

  // ===== Bodega =====
  private loadBodegas() {
    const params = new HttpParams()
      .set('query', '')
      .set('usuario', this.usuarioRegistrador || '');

    this.http.get<any>(this.urlBodegas, { params }).subscribe({
      next: (res) => {
        this.bodegas = Array.isArray(res) ? res : (res && res.data ? res.data : []);

        // Preselección: localStorage o primera bodega
        const bodStorage = localStorage.getItem('BODEGA_SELECCIONADA');
        if (bodStorage) {
          this.selectedBodega = bodStorage;
        } else if (this.bodegas.length > 0) {
          this.selectedBodega = this.bodegas[0].BOD_CODIGO;
          localStorage.setItem('BODEGA_SELECCIONADA', this.selectedBodega!);
        }

        // guardar como última válida
        this.lastSelectedBodega = this.selectedBodega;
      },
      error: () => this.showToast('No se pudo cargar Bodegas', 'warning')
    });
  }

  /** Guarda la bodega actual antes de que el usuario intente cambiar */
  rememberBodega() {
    this.lastSelectedBodega = this.selectedBodega;
  }

  /** Maneja el intento de cambio de bodega */
  handleBodegaChange(ev: any) {
    // Si hay productos, revertimos el cambio y avisamos
    if (!this.canChangeBodega) {
      // revertir visualmente
      this.selectedBodega = this.lastSelectedBodega;
      // intentar revertir el valor del componente (por si el binding tarda)
      if (ev && ev.target) {
        try { ev.target.value = this.lastSelectedBodega; } catch (_) {}
      }
      this.showToast('No puede cambiar la bodega con productos cargados', 'warning');
      return;
    }

    // Sin productos: permitir cambio y persistir
    if (this.selectedBodega) {
      localStorage.setItem('BODEGA_SELECCIONADA', this.selectedBodega);
      this.lastSelectedBodega = this.selectedBodega;

      // Limpiar regalos y reconsultar promo para bases (si ya hubiera algo cargado)
      const baseProducts = this.selectedProducts.filter(p => p.ES_REGALO !== 'si');
      baseProducts.forEach(bp => this.eliminarRegaloAsociado(bp.IMA_ARTICULO));
      baseProducts.forEach(bp => this.consultarPromocion(bp));

      this.updateTotales();
      this.showToast('Bodega actualizada', 'success');
    }
  }

  // ===== Condiciones de pago =====
  onPagoContraEntregaChange() {
    if (this.pagoContraEntrega) {
      this.prevFormaPago = this.formaPago;
      this.prevPlazoDias = this.plazoDias;

      // Forzar CRÉDITO (CDS) y plazo 3 días
      this.formaPago = 'CDS';
      this.plazoDias = 3;

      this.showToast('Pago contra entrega activo: Crédito (CDS) y plazo 3 días', 'success');
    } else {
      this.formaPago = this.prevFormaPago != null ? this.prevFormaPago : 'E';

      if (this.prevPlazoDias != null) {
        this.plazoDias = this.prevPlazoDias;
      } else if (this.selectedClient && (this.selectedClient as any).CMA_DIAS_CREDITO != null) {
        this.plazoDias = Number((this.selectedClient as any).CMA_DIAS_CREDITO) || 0;
      } else {
        this.plazoDias = null;
      }

      this.prevFormaPago = null;
      this.prevPlazoDias = null;

      this.showToast('Pago contra entrega desactivado', 'warning');
    }
  }

  // ===== Enviar pedido =====
  async submitOrder() {
    if (!this.selectedClient || this.selectedProducts.length === 0) {
      const toast = await this.toastController.create({
        message: 'Por favor seleccione un cliente y al menos un producto.',
        duration: 2000, position: 'top', color: 'danger'
      });
      await toast.present();
      return;
    }

    if (!this.selectedBodega) {
      const toast = await this.toastController.create({
        message: 'Por favor seleccione una bodega.',
        duration: 2000, position: 'top', color: 'danger'
      });
      await toast.present();
      return;
    }

    // Validación SSTRATR10 → subzona obligatoria
    if (this.hasSSTRATR10() && (!this.subzona || this.subzona === '0')) {
      const toast = await this.toastController.create({
        message: 'Debe seleccionar la Subzona porque el pedido incluye SSTRATR10.',
        duration: 2500, position: 'top', color: 'danger'
      });
      await toast.present();
      return;
    }

    // Validaciones por producto (antes de enviar)
    for (const product of this.selectedProducts) {
      const q         = Number(product.CANTIDAD || 0);
      const ex        = Number((product as any).EXISTENCIA || 0);
      const factor    = Number((product as any).FACTOR_CANTIDAD || 1);

      if (product.ES_REGALO !== 'si' && ex <= 0) {
        const toast = await this.toastController.create({
          message: `El producto ${product.IMA_ARTICULO} no tiene stock disponible.`,
          duration: 2000, position: 'top', color: 'danger'
        });
        await toast.present();
        return;
      }

      if (product.ES_REGALO !== 'si' && q <= 0) {
        const toast = await this.toastController.create({
          message: `La cantidad del producto ${product.IMA_DESCRIPCION} debe ser mayor a 0.`,
          duration: 2000, position: 'top', color: 'danger'
        });
        await toast.present();
        return;
      }

      if (product.ES_REGALO !== 'si' && !this.esMultiplo(q, factor)) {
        const toast = await this.toastController.create({
          message: `La cantidad de ${product.IMA_ARTICULO} debe ser múltiplo de ${factor}.`,
          duration: 2000, position: 'top', color: 'danger'
        });
        await toast.present();
        return;
      }

      if (product.ES_REGALO !== 'si' && ex && q > ex) {
        const toast = await this.toastController.create({
          message: `El producto ${product.IMA_ARTICULO} no tiene stock suficiente.`,
          duration: 2000, position: 'top', color: 'danger'
        });
        await toast.present();
        return;
      }

      if ((product.DESCUENTO || 0) > product.MAX_DESC) {
        const toast = await this.toastController.create({
          message: `El descuento del producto ${product.IMA_DESCRIPCION} no puede ser mayor que ${product.MAX_DESC}%.`,
          duration: 2000, position: 'top', color: 'danger'
        });
        await toast.present();
        return;
      }

      if (!(product as any).SELECTED_PRICE) {
        (product as any).SELECTED_PRICE = this.defaultProductPrice;
      }

      if (!(product as any).IMA_DESCRIPCION) {
        (product as any).IMA_DESCRIPCION = String(product.IMA_ARTICULO || '');
      }
    }

    // Campos de cabecera
    (this.selectedClient as any).PLAZO_DIAS = this.plazoDias != null ? this.plazoDias : 0;
    (this.selectedClient as any).FECHA_ENTREGA = this.fechaEntregaISO;
    (this.selectedClient as any).PAGO_CONTRA_ENTREGA = this.pagoContraEntrega ? 'S' : 'N';
    (this.selectedClient as any).FORMA_PAGO = this.formaPago;
    (this.selectedClient as any).OBS_PEDIDO = this.obsPedido;
    (this.selectedClient as any).SUBZONA = this.subzona;
    (this.selectedClient as any).OBS_CLIENTE = this.selectedClient && (this.selectedClient as any).CMA_OBSERVACIONES ? (this.selectedClient as any).CMA_OBSERVACIONES : '';
    (this.selectedClient as any).BODEGA = this.selectedBodega;

    if (!(this.selectedClient as any).DIR_DESPACHO && (this.selectedClient as any).CMA_DIRECCION) {
      (this.selectedClient as any).DIR_DESPACHO = (this.selectedClient as any).CMA_DIRECCION;
    }

    // Asegura PROMO_BASE_ARTICULO en regalos
    for (const p of this.selectedProducts) {
      if (p.ES_REGALO === 'si') {
        if (!(p as any).PROMO_BASE_ARTICULO && (p as any).PROMO_BASE) {
          (p as any).PROMO_BASE_ARTICULO = (p as any).PROMO_BASE;
        }
      }
    }

    const loading = await this.loadingController.create({ message: 'Cargando...', spinner: 'circles' });
    await loading.present();

    try {
      const result = await (await this.addPedidoService.addPedido(this.selectedProducts, this.selectedClient)).toPromise();
      loading.dismiss();

      if (result.valid == 'true') {
        const successToast = await this.toastController.create({
          message: 'Pedido ' + result.msg + ' enviado exitosamente!',
          duration: 8000, position: 'top', color: 'success'
        });
        successToast.present();

        // Reset (conservar bodega y su bloqueo)
        this.selectedClient = undefined;
        this.selectedProducts = [];
        this.obsCliente = '';
        this.plazoDias = null;
        this.fechaEntregaISO = new Date().toISOString();
        this.pagoContraEntrega = false;
        this.formaPago = 'E';
        this.obsPedido = '';
        this.subzona = null;
        this.updateTotales();

      } else {
        const errorToast = await this.toastController.create({
          message: 'Error al procesar el pedido: ' + result.msg,
          duration: 2000, position: 'top', color: 'danger'
        });
        errorToast.present();
      }

    } catch (error) {
      loading.dismiss();
      const errorToast = await this.toastController.create({
        message: 'Error al enviar el pedido.',
        duration: 2000, position: 'top', color: 'danger'
      });
      errorToast.present();
    }
  }

  // ===== Carga catálogos =====
  private loadFormasPago() {
    this.http.get<any>(this.urlFormasPago, { params: { query: '' } })
      .subscribe({
        next: (res) => {
          this.formasPago = Array.isArray(res) ? res : (res && res.data ? res.data : []);
          if (!this.formaPago) this.formaPago = 'E';
        },
        error: () => this.showToast('No se pudo cargar Formas de Pago', 'warning')
      });
  }

  private loadSubzonas() {
    this.http.get<any>(this.urlSubzonas, { params: { query: '' } })
      .subscribe({
        next: (res) => { this.subzonas = Array.isArray(res) ? res : (res && res.data ? res.data : []); },
        error: () => this.showToast('No se pudo cargar Subzonas', 'warning')
      });
  }

  async ngOnInit() {
    const us = await this.storageService.getCurrentUser();
    this.usuarioRegistrador = us.user;

    // Cargar catálogos
    this.loadFormasPago();
    this.loadSubzonas();
    this.loadBodegas();

    // Recuperar selección desde páginas hijas
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation && navigation.extras.state) {
        if (navigation.extras.state['client']) {
          this.selectedClient = navigation.extras.state['client'];

          this.obsCliente = (this.selectedClient as any).CMA_OBSERVACIONES || '';

          if (!this.pagoContraEntrega) {
            const dias = Number((this.selectedClient as any).CMA_DIAS_CREDITO || 0);
            this.plazoDias = dias;
          }
        }
        if (navigation.extras.state['product']) {
          const product = navigation.extras.state['product'];

          (product as any).SELECTED_PRICE   = (product as any).SELECTED_PRICE || this.defaultProductPrice;
          product.DESCUENTO                 = 0;
          (product as any)._lastDesc        = 0;
          (product as any).DESCUENTO_EXCP   = (product as any).DESCUENTO_EXCP || 0;
          product.TIENE_PROMOCION           = product.TIENE_PROMOCION || 'no';
          product.ES_REGALO                 = product.ES_REGALO || 'no';
          (product as any).FACTOR_CANTIDAD  = Number((product as any).FACTOR_CANTIDAD || 1);
          (product as any).EXISTENCIA       = Number((product as any).EXISTENCIA) || 0;

          if (!(product as any).IMA_DESCRIPCION) {
            (product as any).IMA_DESCRIPCION = String(product.IMA_ARTICULO || '');
          }

          product.MAX_DESC = this.calculateMaxDiscount(product);

          const factor     = Number((product as any).FACTOR_CANTIDAD) || 1;
          const existencia = Number((product as any).EXISTENCIA) || 0;

          if (product.ES_REGALO !== 'si' && existencia <= 0) {
            this.showToast(`Sin stock: ${product.IMA_ARTICULO}`, 'danger');
            return;
          }

          let startQty = factor;
          if (product.ES_REGALO !== 'si' && existencia > 0) {
            if (startQty > existencia) {
              const ajustada = this.roundDownToMultiple(existencia, factor);
              if (ajustada <= 0) {
                this.showToast(`Stock insuficiente para cumplir el múltiplo de ${factor} en ${product.IMA_ARTICULO}`, 'danger');
                return;
              }
              startQty = ajustada;
            }
          }

          product.CANTIDAD          = startQty;
          (product as any)._lastQty = startQty;

          if (!this.selectedProducts.find(p => p.IMA_ARTICULO === product.IMA_ARTICULO && p.ES_REGALO !== 'si')) {
            this.selectedProducts.push(product);
            this.showToast('Producto añadido: ' + product.IMA_DESCRIPCION);
            this.updateTotales();
            this.consultarPromocion(product);
          } else {
            this.showToast('El producto ya está añadido', 'warning');
          }
        }
      }
    });
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({ message, duration: 2000, position: 'top', color });
    await toast.present();
  }
}
