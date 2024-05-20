import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Order } from 'src/app/models/order.model'; 
import { Router } from '@angular/router';
import { ConnectivityService } from 'src/app/services/connectivity/connectivity.service';
import { OrderDetailService } from 'src/app/services/orderDetail/order-detail.service';
import { AlertController } from '@ionic/angular';
import { SyncPendientesService } from 'src/app/services/syncPendientes/sync-pendientes.service';
import { MenuController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnInit {
  order: Order | null = null;
  originalOrder: Order | null = null;
  changesMade = false;

  constructor(
    private storageService: StorageService,
    private router: Router,
    private connectivityService: ConnectivityService,
    private alertController: AlertController,
    private orderDetailService: OrderDetailService,
    private syncPendientesService: SyncPendientesService,
    private menuCtrl: MenuController,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    await this.loadOrderDetails();   
  }

  async ionViewWillEnter() {
    //await this.syncPendientesService.checkServerAndSync();
    await this.loadOrderDetails();
  }

  // Mostrar el menú 
  openMenu() {
    this.menuCtrl.open();
  }

  async loadOrderDetails() {
    this.order= null;
    this.originalOrder = null;
    this.changesMade = false;

    const orderData = await this.storageService.getOrderData(); // Asume getOrderData() devuelve una promesa
    if (!orderData) {
      // No se encontró una orden, posiblemente redirigir al usuario a la página de órdenes
      this.router.navigate(['/orders']);
      return;
    }

    this.order = orderData;
    this.originalOrder = JSON.parse(JSON.stringify(this.order));
  }

  onChanges(): void {
    this.changesMade = JSON.stringify(this.order) !== JSON.stringify(this.originalOrder);
  }
  

  async  saveChanges() {
    this.changesMade = false;

    const loading = await this.loadingController.create({
      message: 'Cargando...',
      spinner: 'circles' // Puedes elegir otros estilos de spinner
    });

    await loading.present();
    
    const isConnected = await this.connectivityService.checkServerStatus();

    if (isConnected) {
      // Tiene conexión, subir datos
      const response$ = await this.orderDetailService.updateOrder(this.order!);
      response$.subscribe(
        response => {
          // Manejar respuesta del servidor
          if (response.valid == 'true') {
            // Si la subida es exitosa, asegurarse de eliminar la orden de la lista de pendientes si estaba allí
            this.storageService.removeOrderFromPending(this.order!);
            this.storageService.removeOrderData();
            this.storageService.setOrderData(this.order!);
            loading.dismiss(); // Ocultar mensaje de carga
            this.presentAlert('Exitó', 'Datos Actualizados Correctamente');
            this.originalOrder = JSON.parse(JSON.stringify(this.order));

          }else{
            loading.dismiss(); // Ocultar mensaje de carga
            console.log(response);
            this.presentAlert('Error', response.msg);
          }
        },
        error => {
          loading.dismiss(); // Ocultar mensaje de carga
          console.error(error);
          this.presentAlert('Error', error.msg);
        }
      );
    } else {
      // No tiene conexión, guardar en storage
      await this.storageService.upsertPendingOrder(this.order!);
      await this.storageService.updateOrderList(this.order!);
      await this.storageService.setOrderData(this.order!);
      loading.dismiss(); // Ocultar mensaje de carga
      this.presentAlert('Sin Conexion', 'Los datos se actualizaran cuando se recupera la conexion');
    }

  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }
  
}

