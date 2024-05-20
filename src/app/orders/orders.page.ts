import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order/order.service';
import { Order } from '../models/order.model';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';
import { AlertController, MenuController } from '@ionic/angular';
import { SyncService } from '../services/sync/sync.service';
import { AuthService } from '../services/login/auth.service';
import { ConnectivityService } from '../services/connectivity/connectivity.service';
import { SyncPendientesService } from '../services/syncPendientes/sync-pendientes.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm: string = '';
  modoDesconectado: boolean | undefined;
  

  constructor(
    private orderService: OrderService,
    private storageService: StorageService,
    private router: Router,
    private menuCtrl: MenuController,
    private syncService: SyncService,
    private authService: AuthService,
    private connectivityService:ConnectivityService,
    private syncPendientesService: SyncPendientesService,
    private alertController: AlertController,
    private loadingController: LoadingController
    
    ) {
    }

    async toggleModoDesconectado() {
      if (this.modoDesconectado) {
        this.storageService.setModoDesconectado(true);
        this.modoDesconectado = true;
      } else {
        this.storageService.setModoDesconectado(false);
        this.modoDesconectado = false;
      }
    }

    // Desactivar el menú cuando entramos en la página
    async ionViewWillEnter() {
      await this.storageService.removeOrderData();
      await this.storageService.getModoDesconectado().then((modo) => {
        this.modoDesconectado = modo;
      });

      this.menuCtrl.enable(false);
      const isConnected = await this.connectivityService.checkServerStatus();
      
      if(isConnected){
        await this.syncPendientesService.checkServerAndSync();
        await this.syncData();
        await this.loadOrders();
      }else{
        await this.loadOrders();
        console.log('Sin internet no se puede sincronizar all data.');
      }
      
      
  }

  // Reactivar el menú cuando salimos de la página
  ionViewDidLeave() {
    this.menuCtrl.enable(true);
    
  }


  async ngOnInit() {
    //await this.syncPendientesService.checkServerAndSync();
    
    //await this.syncData();
    //await this.loadOrders();
  }

  async syncData(): Promise<void> {

        // Solo ejecuta la sincronización si hay conexión a Internet

        //Sincronizacion de trabajos
        this.syncService.syncTrabajos().then(() => {
          console.log('Trabajos sincronizados con éxito');
        }).catch(error => {
          console.error('Error al sincronizar trabajos', error);
        });

        //Sincronizacion de Equipos
        this.syncService.syncEquipos().then(() => {
          console.log('Equipos sincronizados con éxito');
        }).catch(error => {
          console.error('Error al sincronizar Equipos', error);
        });

        //Sincronizacion de Productos
        this.syncService.syncProductos().then(() => {
          console.log('Productos sincronizados con éxito');
        }).catch(error => {
          console.error('Error al sincronizar Productos', error);
        });

        //Sincronizacion de Repuestos
        this.syncService.syncRepuestos().then(() => {
          console.log('Repuestos sincronizados con éxito');
        }).catch(error => {
          console.error('Error al sincronizar Repuestos', error);
        });

        //Sincronizacion de Horarios
        this.syncService.syncHorarios().then(() => {
          console.log('Horarios sincronizados con éxito');
        }).catch(error => {
          console.error('Error al sincronizar Horarioss', error);
        });

  }



  async loadOrders() {
    this.orders = [];
    this.filteredOrders = [];
    this.searchTerm = '';
    try {
      const orders = await this.orderService.getOrdersWithFallback();
      //console.log('Llega', orders);
      this.orders = orders;
      this.filteredOrders = [...this.orders];
    } catch (error) {
      console.error('Error al cargar las órdenes:', error);
      // Manejar el error de alguna manera, por ejemplo, mostrando un mensaje al usuario
    }
  }
  

  search() {
    this.filteredOrders = this.orders.filter(order => {
      return order.TST_CODIGO_FISICO.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             order.TST_TIPO.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             order.TST_CLIENTE.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  selectOrder(order: Order) {
    this.storageService.setOrderData(order);
    //console.log(order);
    this.router.navigate(['/order-details']);
  }


  async logout() {
    let pendiente = await this.storageService.isEverythingProcessed();
    if (pendiente == true) {
      this.storageService.removeOrderData();
      this.authService.logout();
      this.router.navigateByUrl('/login');
    } else {
      this.presentAlert('Alerta', 'Existen cambios pendientes, sincronice los datos primero');
    }
    
  }

  async sincronizar(){
    const loading = await this.loadingController.create({
      message: 'Cargando...',
      spinner: 'circles' // Puedes elegir otros estilos de spinner
    });
    await loading.present();
    const isConnected = await this.connectivityService.checkServerStatus();
      await this.loadOrders();
      if(isConnected){
        await this.syncPendientesService.checkServerAndSync();
        await this.syncData();
        await this.loadOrders();
        loading.dismiss(); // Ocultar mensaje de carga
        this.presentAlert('Exito', 'Datos sincronizados con exito');
        
      }else{
        loading.dismiss(); // Ocultar mensaje de carga
        this.presentAlert('Sin Conexion', 'No se puede sicronizar sin conexion');
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
