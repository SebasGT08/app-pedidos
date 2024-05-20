import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order.model';
import { Work } from 'src/app/models/work.model';
import { StorageService } from 'src/app/services/storage/storage.service';
import { AlertController, ModalController } from '@ionic/angular';
import { ConnectivityService } from 'src/app/services/connectivity/connectivity.service';
import { WorkDetailService } from 'src/app/services/workDetail/work-detail.service';
import { SyncService } from 'src/app/services/sync/sync.service';
import { SyncPendientesService } from 'src/app/services/syncPendientes/sync-pendientes.service';
import { MenuController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ImageModalComponent } from 'src/app/image-modal/image-modal.component';



@Component({
  selector: 'app-work-details',
  templateUrl: './work-details.page.html',
  styleUrls: ['./work-details.page.scss'],
})
export class WorkDetailsPage implements OnInit {

  workDetails: Work[] = [];
  orden_actual: Order | null = null;
  hasChanges: boolean = false;

  constructor(
    private storageService: StorageService,
    public alertController: AlertController,
    private connectivityService: ConnectivityService,
    private workDetailService: WorkDetailService,
    private syncPendientesService: SyncPendientesService,
    private syncService: SyncService,
    private menuCtrl: MenuController,
    private loadingController: LoadingController,
    private router: Router,
    private modalController: ModalController
    ) { }

  async ngOnInit() {
    //console.log('ENTRA');
    //await this.syncPendientesService.checkServerAndSync();
    await this.loadWorkDetails();
  }

  async ionViewWillEnter() {
    //await this.syncPendientesService.checkServerAndSync();
    await this.loadWorkDetails();
  }

  // Mostrar el menú 
  openMenu() {
    this.menuCtrl.open();
  }

  async loadWorkDetails() {
    //console.log('Se ejecuta');
    this.orden_actual = await this.storageService.getOrderData();
    if (!this.orden_actual) {
      this.router.navigate(['/orders']);
      return;
    }
    this.workDetails = await this.storageService.getTrabajosByCodigoInterno(this.orden_actual!.TST_LLAVE) || [];
  }

  async addDetail() {
    const alert = await this.alertController.create({
      header: 'Agregar Detalle de Trabajo',
      inputs: [
        {
          name: 'descripcion',
          type: 'text',
          placeholder: 'Descripción'
        },
        {
          name: 'cantidad',
          type: 'number',
          placeholder: 'Cantidad'
        },
        {
          name: 'precio',
          type: 'number',
          placeholder: 'Precio'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Agregar',
          handler: (data) => {
            if (data.descripcion && data.cantidad && data.precio) {
              const total = this.calculateTotal(parseFloat(data.cantidad), parseFloat(data.precio));
              const newWorkDetail: Work = {
                TSTT_CODIGO_INTERNO: this.orden_actual!.TST_LLAVE,
                TSTT_DESCRIPCION: data.descripcion,
                TSTT_CANTIDAD: parseFloat(data.cantidad),
                TSTT_PRECIO: parseFloat(data.precio),
                TSTT_TOTAL: total,
              };
              this.workDetails.push(newWorkDetail);
              this.hasChanges = true;
              return true; 
            } else {
              return false;
            }
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  removeDetail(index: number) {
    this.workDetails.splice(index, 1);
    this.hasChanges = true;
    
  }

  async saveChanges() {
    this.hasChanges = false;
    const loading = await this.loadingController.create({
      message: 'Cargando...',
      spinner: 'circles' // Puedes elegir otros estilos de spinner
    });
    await loading.present();

    const isConnected = await this.connectivityService.checkServerStatus();
      if (isConnected) {


        // Tiene conexión, subir detalles de trabajo.
        const updateResponse$ = await this.workDetailService.updateWorkDetails(this.workDetails!); // Asegúrate de que 'workDetailsArray' es tu variable correcta que contiene el arreglo de detalles.
        updateResponse$.subscribe(
          async response => {
            // Manejar respuesta del servidor
            if (response.valid === 'true') {
              loading.dismiss(); // Ocultar mensaje de carga
              this.presentAlert('Éxito', 'Detalles de Trabajo Actualizados Correctamente');
              // Asegúrate de estar en un contexto asíncrono
              try {
                await this.syncService.syncTrabajos(); // Espera a que syncTrabajos complete todas sus tareas
                this.loadWorkDetails(); // Ahora se carga la información actualizada
              } catch (error) {
                loading.dismiss(); // Ocultar mensaje de carga
                console.error('Error en la sincronización o la carga de detalles:', error);
                // Manejar el error aquí, por ejemplo, mostrando una alerta al usuario
              }
              
            } else {
              console.log(response);
              loading.dismiss(); // Ocultar mensaje de carga
              this.presentAlert('Error', response.msg);
            }
          },
          error => {
            // Manejar el error de la petición
            loading.dismiss(); // Ocultar mensaje de carga
            console.error(error);
            this.presentAlert('Error', error.msg);
          }
        );

      } else {
        await this.storageService.upsertPendingWorkDetails(this.orden_actual!.TST_LLAVE,this.workDetails!);
        await this.storageService.replaceTrabajosByCodigoInterno(this.orden_actual!.TST_LLAVE,this.workDetails!);
        await this.loadWorkDetails();
        loading.dismiss(); // Ocultar mensaje de carga
        this.presentAlert('Sin Conexión', 'Los detalles de trabajo se actualizarán cuando se recupere la conexión');
      }

  }

  calculateTotal(cantidad: number, precio: number): number {
    return cantidad * precio;
  }


  async checkCameraPermission(work: Work) {
    const status = await Camera.checkPermissions();
    if (status.camera !== 'granted') {
      const permissionResult = await Camera.requestPermissions({ permissions: ['camera'] });
      if (permissionResult.camera === 'granted') {
        this.takePicture(work);
      } else {
        this.presentAlert('Error', 'Permiso de camara no concedido.');
      }
    } else {
      this.takePicture(work);
    }
  }

  async takePicture(work: Work) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
  
      if (image.base64String) {
        // Guardar la imagen en base64 en el objeto work
        work.TSTT_FOTO = image.base64String;
        this.hasChanges = true;

      }
    } catch (error) {
      console.error(error);
    }
  }


  
  async viewPicture(base64Image: string) {
    const modal = await this.modalController.create({
      component: ImageModalComponent,
      componentProps: {
        imageSrc: 'data:image/jpeg;base64,'+base64Image
      }
    });
    return await modal.present();
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
