import { Component, OnInit } from '@angular/core';
import { LoadingController, MenuController, ModalController, ToastController } from '@ionic/angular';
import { SelectClientPage } from '../select-client/select-client.page';
import { Client } from 'src/app/models/client.model';
import { SelectProductPage } from '../select-product/select-product.page';
import { Product } from 'src/app/models/product.model';
import { AddPedidoService } from 'src/app/services/pedido/add-pedido.service';

@Component({
  selector: 'app-add-pedido',
  templateUrl: './add-pedido.page.html',
  styleUrls: ['./add-pedido.page.scss'],
})
export class AddPedidoPage implements OnInit {
  selectedClient: Client | undefined;
  selectedProducts: Product[] = [];

  constructor(
    private modalController: ModalController, 
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

  // Abrir modal para seleccionar cliente
  async openClientSelector() {
    const modal = await this.modalController.create({
      component: SelectClientPage
    });
  
    await modal.present();
  
    // Obtener datos del cliente seleccionado al cerrar el modal
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.selectedClient = data.client;
    }
    console.log(this.selectedClient);
    
  }

  // Abrir modal para seleccionar productos
  async openProductSelector() {
    const modal = await this.modalController.create({
      component: SelectProductPage
    });
  
    await modal.present();
  

    // Obtener datos del producto seleccionado al cerrar el modal
    const { data } = await modal.onWillDismiss();
    if (data && data.product) {
      this.selectedProducts.push(data.product);
      this.showToast('Producto añadido: ' + data.product.IMA_DESCRIPCION);
    }

  }

  // Al eliminar un producto
  removeProduct(product: Product) {
    this.selectedProducts = this.selectedProducts.filter(p => p !== product);
    this.showToast('Producto eliminado: ' + product.IMA_DESCRIPCION, 'danger');
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

    const loading = await this.loadingController.create({
      message: 'Cargando...',
      spinner: 'circles' // Puedes elegir otros estilos de spinner
    });
    await loading.present();

    try {
      const result = await (await this.addPedidoService.addPedido(this.selectedProducts, this.selectedClient)).toPromise();

      if (result.valid == 'true') {
        loading.dismiss(); // Ocultar mensaje de carga
        const successToast = await this.toastController.create({
          message: 'Pedido '+result.msg+' enviado exitosamente!',
          duration: 8000,
          position: 'top',
          color: 'success'
        });
        successToast.present();
        // Resetear selecciones después de un envío exitoso
        this.selectedClient = undefined;
        this.selectedProducts = [];
      } else {
        loading.dismiss(); // Ocultar mensaje de carga
        const errorToast = await this.toastController.create({
          message:  'Error al procesar el pedido: '+result.msg,
          duration: 2000,
          position: 'top',
          color: 'danger'
        });
        errorToast.present();
      }
    } catch (error) {
      loading.dismiss(); // Ocultar mensaje de carga
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
    
  }

  // Método para mostrar toast
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
