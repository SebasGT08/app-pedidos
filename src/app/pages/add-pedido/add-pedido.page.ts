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
      return sum + (this.getPrice(product) * (product.CANTIDAD || 1));
    }, 0);

    this.IVA_PAGAR = this.selectedProducts.reduce((sum, product) => {
      const productSubtotal = this.getPrice(product) * (product.CANTIDAD || 1);
      const productIVA = productSubtotal * product.IMA_PROCENTAJE_IVA;
      return sum + productIVA;
    }, 0);

    this.TOTAL_PAGAR = this.SUBTOTAL_PAGAR + this.IVA_PAGAR;
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
          message: 'Pedido '+result.msg+' enviado exitosamente!',
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
          message:  'Error al procesar el pedido: '+result.msg,
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        errorToast.present();
      }
    } catch (error) {
      loading.dismiss();
      const errorToast = await this.toastController.create({
        message:  'Error al enviar el pedido.',
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
