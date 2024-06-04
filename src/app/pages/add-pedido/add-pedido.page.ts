import { Component, OnInit } from '@angular/core';
import { LoadingController, MenuController, ToastController } from '@ionic/angular';
import { Router, NavigationExtras, NavigationEnd } from '@angular/router';
import { Client } from 'src/app/models/client.model';
import { Product } from 'src/app/models/product.model';
import { AddPedidoService } from 'src/app/services/pedido/add-pedido.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-add-pedido',
  templateUrl: './add-pedido.page.html',
  styleUrls: ['./add-pedido.page.scss'],
})
export class AddPedidoPage implements OnInit {
  selectedClient: Client | undefined;
  selectedProducts: Product[] = [];
  IVA_PAGAR: number = 0;
  SUBTOTAL_PAGAR: number = 0;
  TOTAL_PAGAR: number = 0;
  selectedPrice: string = 'IMA_PRECIO1'; 

  constructor(
    private router: Router,
    private toastController: ToastController, 
    private menuCtrl: MenuController,
    private addPedidoService: AddPedidoService,
    private loadingController: LoadingController
  ) { }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  openMenu() {
    this.menuCtrl.open();
  }

  async openClientSelector() {
    const navigationExtras: NavigationExtras = {
      state: {
        from: 'add-pedido'
      }
    };
    this.router.navigate(['select-client'], navigationExtras);
  }

  async openProductSelector() {
    const navigationExtras: NavigationExtras = {
      state: {
        from: 'add-pedido'
      }
    };
    this.router.navigate(['select-product'], navigationExtras);
  }

  // Al eliminar un producto
  removeProduct(product: Product) {
    this.selectedProducts = this.selectedProducts.filter(p => p !== product);
    this.showToast('Producto eliminado: ' + product.IMA_DESCRIPCION, 'danger');
    this.updateTotales();
  }

  // Actualizar la cantidad de un producto
  updateProductQuantity(product: Product, quantity: number) {
    const prod = this.selectedProducts.find(p => p.IMA_ARTICULO === product.IMA_ARTICULO);
    if (prod) {
      prod.CANTIDAD = quantity;
    }
    this.updateTotales();
  }

  // Actualizar el descuento de un producto
  updateProductDiscount(product: Product, discount: number) {
    if (discount > product.MAX_DESC) {
      this.showToast(`El descuento no puede ser mayor que ${product.MAX_DESC}%`, 'danger');
      return;
    }
    const prod = this.selectedProducts.find(p => p.IMA_ARTICULO === product.IMA_ARTICULO);
    if (prod) {
      prod.DESCUENTO = discount;
    }
    this.updateTotales();
  }
  
  

  getPrice(product: Product): number {
    switch (this.selectedPrice) {
      case 'IMA_PRECIO1':
        return product.IMA_PRECIO1;
      case 'IMA_PRECIO2':
        return product.IMA_PRECIO2;
      case 'IMA_PRECIO3':
        return product.IMA_PRECIO3;
      default:
        return product.IMA_PRECIO1;
    }
  }

  // Calcular el total
  updateTotales() {
    this.SUBTOTAL_PAGAR = this.selectedProducts.reduce((sum, product) => {
      const price = this.getPrice(product);
      const discount = product.DESCUENTO || 0;
      const discountedPrice = price * (1 - (discount / 100)); // Aplicar descuento
      return sum + (discountedPrice * (product.CANTIDAD || 1));
    }, 0);

    this.IVA_PAGAR = this.selectedProducts.reduce((sum, product) => {
      const price = this.getPrice(product);
      const discount = product.DESCUENTO || 0;
      const discountedPrice = price * (1 - (discount / 100)); // Aplicar descuento
      const productSubtotal = discountedPrice * (product.CANTIDAD || 1);
      const productIVA = productSubtotal * product.IMA_PROCENTAJE_IVA;
      return sum + productIVA;
    }, 0);

    this.TOTAL_PAGAR = this.SUBTOTAL_PAGAR + this.IVA_PAGAR;
  }

  calculateMaxDiscount(product: Product): number {
    const PRE1 = product.IMA_PRECIO1;
    const PRE2 = product.IMA_PRECIO2;
    const PRE3 = product.IMA_PRECIO3;
  
    let maxDesc = 0;
  
    if (product.PROMOCION === 'no') {
      switch (this.selectedPrice) {
        case 'IMA_PRECIO1':
          maxDesc = ((PRE1 - PRE3) / PRE1) * 100;
          break;
        case 'IMA_PRECIO2':
          maxDesc = ((PRE2 - PRE3) / PRE2) * 100;
          break;
        case 'IMA_PRECIO3':
          maxDesc = 0;
          break;
        default:
          maxDesc = 0;
          break;
      }
    } else {
      maxDesc = product.MAX_DESC; // Usar el descuento máximo ya definido
    }
  
    return parseFloat(maxDesc.toFixed(4));
  }
  
  

  // Enviar pedido
  async submitOrder() {
    if (!this.selectedClient || this.selectedProducts.length === 0) {
      const toast = await this.toastController.create({
        message: 'Por favor seleccione un cliente y al menos un producto.',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
      return;
    }

    // Validar cantidad y descuento de los productos
    for (const product of this.selectedProducts) {
      if (product.CANTIDAD <= 0) {
        const toast = await this.toastController.create({
          message: `La cantidad del producto ${product.IMA_DESCRIPCION} debe ser mayor a 0.`,
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
        return;
      }

      if (product.DESCUENTO > product.MAX_DESC) {
        const toast = await this.toastController.create({
          message: `El descuento del producto ${product.IMA_DESCRIPCION} no puede ser mayor que ${product.MAX_DESC}%.`,
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
        return;
      }
    }

    this.selectedClient.SELECTED_PRICE = this.selectedPrice;

    const loading = await this.loadingController.create({
      message: 'Cargando...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      const result = await (await this.addPedidoService.addPedido(this.selectedProducts, this.selectedClient)).toPromise();

      if (result.valid == 'true') {
        loading.dismiss();
        const successToast = await this.toastController.create({
          message: 'Pedido ' + result.msg + ' enviado exitosamente!',
          duration: 8000,
          position: 'top',
          color: 'success'
        });
        successToast.present();
        this.selectedClient = undefined;
        this.selectedProducts = [];
        this.updateTotales();
        this.selectedPrice = 'IMA_PRECIO1';
      } else {
        loading.dismiss();
        const errorToast = await this.toastController.create({
          message: 'Error al procesar el pedido: ' + result.msg,
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        errorToast.present();
      }
    } catch (error) {
      loading.dismiss();
      const errorToast = await this.toastController.create({
        message: 'Error al enviar el pedido.',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      errorToast.present();
    }
  }



  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const navigation = this.router.getCurrentNavigation();
      if (navigation && navigation.extras.state) {
        if (navigation.extras.state['client']) {
          this.selectedClient = navigation.extras.state['client'];
        }
        if (navigation.extras.state['product']) {
          const product = navigation.extras.state['product'];
          product.CANTIDAD = 1;  // Inicializar cantidad a 1 por defecto
          product.DESCUENTO = 0;  // Inicializar descuento a 0 por defecto
          product.MAX_DESC = this.calculateMaxDiscount(product); // Calcular descuento máximo
          if (!this.selectedProducts.find(p => p.IMA_ARTICULO === product.IMA_ARTICULO)) {
            this.selectedProducts.push(product);
            this.showToast('Producto añadido: ' + product.IMA_DESCRIPCION);
            this.updateTotales(); 
          } else {
            this.showToast('El producto ya está añadido', 'warning');
          }
        }
      }
    });
  }

  onPriceSelectionChange(event: any) {
    if (this.selectedClient) {
      this.selectedClient.SELECTED_PRICE = this.selectedPrice;
    }

    // Recalcular los descuentos máximos para todos los productos seleccionados
    this.selectedProducts.forEach(product => {
      product.MAX_DESC = this.calculateMaxDiscount(product);
    });
    
    this.updateTotales();
  }

  async showToast(message: string, color = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    await toast.present();
  }
}
