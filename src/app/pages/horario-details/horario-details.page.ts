import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Horario } from 'src/app/models/horario.model';
import { Order } from 'src/app/models/order.model';
import { ConnectivityService } from 'src/app/services/connectivity/connectivity.service';
import { HorarioDetailService } from 'src/app/services/horarioDetail/horario-detail.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { SyncService } from 'src/app/services/sync/sync.service';
import * as moment from 'moment-timezone';
import { Geolocation } from '@capacitor/geolocation';
import { MenuController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-horario-details',
  templateUrl: './horario-details.page.html',
  styleUrls: ['./horario-details.page.scss'],
})
export class HorarioDetailsPage implements OnInit {


  horarioDetails: Horario[] = [];
  orden_actual: Order | null = null;
  horarioActual: Horario | null = null;
  trabajoIniciado: boolean = false;
  sub_Horario: Horario[] = [];

  constructor(
    private storageService: StorageService,
    public alertController: AlertController,
    private connectivityService: ConnectivityService,
    private horarioDetailService: HorarioDetailService,
    private syncService: SyncService,
    public modalController: ModalController,
    private menuCtrl: MenuController,
    private loadingController: LoadingController,
    private router: Router,

  ) { }

  async ngOnInit() {
    this.trabajoIniciado = false;
    await this.loadHorarioDetails();   
  }

  async ionViewWillEnter() {
    this.trabajoIniciado = false;
    await this.loadHorarioDetails();
  }

  // Mostrar el menú 
  openMenu() {
    this.menuCtrl.open();
  }

  async loadHorarioDetails() {
    this.horarioDetails =[];

    this.orden_actual = null;
    this.horarioActual = null;
    this.trabajoIniciado = false;

    this.orden_actual = await this.storageService.getOrderData();
    if (!this.orden_actual) {
      this.router.navigate(['/orders']);
      return;
    }
    this.horarioDetails = await this.storageService.getHorariosByCodigoInterno(this.orden_actual!.TST_LLAVE) || [];
     // Verificar si hay un horario iniciado para la orden actual
     const horarioIniciado = await this.storageService.getHorarioIniciado(this.orden_actual!.TST_LLAVE);
     if (horarioIniciado) {
       this.horarioActual = horarioIniciado;
       this.trabajoIniciado = true; // Hay un trabajo en curso, deshabilita el botón de iniciar
     }
  }

  async startWork() {
    // Verificar si ya hay un trabajo iniciado para esta orden
    const horarioIniciado = await this.storageService.getHorarioIniciado(this.orden_actual!.TST_LLAVE);
    
    if (horarioIniciado) {
      // Si hay un trabajo ya iniciado, no permitir iniciar otro.
      this.presentAlert('Error', 'Ya hay un trabajo iniciado para esta orden.');
      return;
    }
  
    // Obtener la fecha y hora actual en el formato correcto
    const fechaHoraActual = moment().tz('America/Bogota'); // Usa tu zona horaria correspondiente
    const fecha = fechaHoraActual.format('YYYY-MM-DD');
    const hora = fechaHoraActual.format('HH:mm:ss');
    
    const user = await this.storageService.getCurrentUser();
    
    // Crear un objeto horario con los datos de inicio
    const nuevoHorario: Horario = {
      TSTH_CODIGO_INTERNO: this.orden_actual!.TST_LLAVE, // Asumiendo que esto es correcto
      TSTH_USUARIO: user.user, // Supongamos que tienes una forma de obtener el nombre de usuario actual
      TSTH_NOMBRE: user.nombre, // Obtener el nombre completo del usuario de alguna parte
      TSTH_FECHA: fecha,
      TSTH_HORA_INGRESO: hora,
      TSTH_HORA_SALIDA: '', // Dejar en blanco hasta que se termine el trabajo
      TSTH_OBSERVACION: '' // Dejar en blanco hasta que se termine el trabajo
    };
  
    // Guardar el horario iniciado
    await this.storageService.setHorarioIniciado(nuevoHorario);
  
    // Actualizar la UI
    this.horarioActual = nuevoHorario;
    this.trabajoIniciado = true;
  
  }

  async endWork() {
    
    // Intentar recuperar el horario iniciado del almacenamiento
    const horarioIniciado = await this.storageService.getHorarioIniciado(this.orden_actual!.TST_LLAVE);
  
    if (!horarioIniciado) {
      // Si no hay un trabajo iniciado, mostrar un mensaje de error
      this.presentAlert('Error', 'No hay un trabajo iniciado que se pueda terminar.');
      return;
    }

    var coordenadas = 'NA';

  // Solicitar y verificar las coordenadas antes de continuar
  const tienePermiso = await this.solicitarPermisoUbicacion();
  if (tienePermiso) {
    try {
      const coordenadasObj = await Geolocation.getCurrentPosition();

      const latitud = coordenadasObj.coords.latitude;
      const longitud = coordenadasObj.coords.longitude;

      // Formatear las coordenadas como un string
      coordenadas = latitud + "," + longitud;
      //console.log('Coordenadas:', coordenadas);
      // Continuar con el proceso si se obtienen las coordenadas
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
      this.presentAlert('Error', 'No se pudo obtener la ubicación.');
      return; // Salir de la función si no se obtienen las coordenadas
    }
  } else {
    this.presentAlert('Error', 'Permiso de ubicación no concedido.');
    return; // Salir de la función si no se conceden los permisos
  }



  if (coordenadas != 'NA') {

     // Obtener la hora actual en el formato correcto para la base de datos
     const horaSalida = moment().tz('America/Bogota').format('HH:mm:ss');

     // Establecer la hora de salida
     horarioIniciado.TSTH_HORA_SALIDA = horaSalida;
     horarioIniciado.TSTH_COORDENADAS = coordenadas;
   
     // Pedir la observación al usuario
     const observacion = await this.askForObservacion(); // Asumiendo que tienes un método para pedir input al usuario
     
     if (observacion) {
       horarioIniciado.TSTH_OBSERVACION = observacion;
       // Actualizar la UI
       this.horarioDetails.push(horarioIniciado);
       
        this.sub_Horario.push(horarioIniciado);
       await this.saveHorarioChanges();
 
       const clave = `horarioIniciado_${this.horarioActual!.TSTH_CODIGO_INTERNO}`;
 
       await this.storageService.removeHorarioIniciado(clave); 
 
       this.horarioActual = null;
       this.trabajoIniciado = false;
     } else {
       // horarioIniciado.TSTH_OBSERVACION = '-';
     }
    
  } else {
    this.presentAlert('Error', 'Error al obtner las coordenadas.');
    return; // Salir de la función si no se conceden los permisos
  }

  
    
  }

  async solicitarPermisoUbicacion(): Promise<boolean> {
    let permisos = await Geolocation.checkPermissions();
    if (permisos.location === 'prompt' || permisos.location === 'denied') {
      const respuesta = await Geolocation.requestPermissions();
      // Comprobar directamente si la ubicación fue concedida en la respuesta
      return respuesta.location === 'granted';
    }
    // Devolver el estado actual de los permisos si no se solicitaron nuevamente
    return permisos.location === 'granted';
  }

  

  async askForObservacion(): Promise<string | null> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Observación del Trabajo',
        inputs: [
          {
            name: 'observacion',
            type: 'text',
            placeholder: 'Escriba sus observaciones aquí...'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              resolve(null); // Se resuelve la promesa con null porque se cancela
              return true; // Cerrar el alert después de cancelar
            }
          },
          {
            text: 'Guardar',
            handler: (data) => {
              if (data.observacion.trim()) {
                resolve(data.observacion); // Se resuelve la promesa con la observación
                return true; // Cerrar el alert después de guardar
              } else {
                resolve('-'); 
                return true; 
              }
            }
          }
        ]
      });
  
      await alert.present();
    });
  }
  
  
  



  async saveHorarioChanges() {

    const loading = await this.loadingController.create({
      message: 'Cargando...',
      spinner: 'circles' // Puedes elegir otros estilos de spinner
    });
    await loading.present();
    const isConnected = await this.connectivityService.checkServerStatus();
      if (isConnected) {
        // Tiene conexión, subir detalles de trabajo.
        const updateResponse$ = await this.horarioDetailService.updateHorarioDetails(this.sub_Horario!);
        updateResponse$.subscribe(
          async response => {
            // Manejar respuesta del servidor
            if (response.valid === 'true') {
              loading.dismiss(); // Ocultar mensaje de carga
              this.presentAlert('Éxito', 'Detalles de Horario Actualizados Correctamente');
              this.sub_Horario = [];
              try {
                await this.syncService.syncHorarios(); // Espera a que syncHorarios complete todas sus tareas
                this.loadHorarioDetails(); // Ahora se carga la información actualizada
              } catch (error) {
                console.error('Error en la sincronización o la carga de detalles:', error);
                // Manejar el error aquí, por ejemplo, mostrando una alerta al usuario
              }
            } else {
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
        loading.dismiss(); // Ocultar mensaje de carga
        console.log('No hay conexión con el servidor al iniciar la aplicación.');
        // No tiene conexión, guardar en storage los detalles de equipo localmente.
        await this.storageService.insertPendingHorario(this.sub_Horario[0]);
        await this.storageService.updateHorariosList(this.sub_Horario[0]);
        this.sub_Horario= [];
        this.presentAlert('Sin Conexión', 'Los detalles de horarios se actualizarán cuando se recupere la conexión');
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
