import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Order } from 'src/app/models/order.model';
import { StorageService } from 'src/app/services/storage/storage.service';
import { MenuController } from '@ionic/angular';
import { Work } from 'src/app/models/work.model';
import { Equipment } from 'src/app/models/equipment.model';
import { Repuesto } from 'src/app/models/repuesto.model';
import { Horario } from 'src/app/models/horario.model';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-finalizar',
  templateUrl: './finalizar.page.html',
  styleUrls: ['./finalizar.page.scss'],
})
export class FinalizarPage implements OnInit {

  order: Order | null = null;
  workDetails: Work[] = [];
  equipmentDetails: Equipment[] = [];
  repuestoDetails: Repuesto[] = [];
  horarioDetails: Horario[] = [];

  constructor(
    private storageService: StorageService,
    private router: Router,
    private menuCtrl: MenuController,
    private alertController: AlertController,
  ) { }

  async ngOnInit() {
    await this.loadDetails();
  }

  async loadDetails() {
    this.order= null;
    let orderData = await this.storageService.getOrderData();
    if (!orderData) {
      this.router.navigate(['/orders']);
      return;
    }
    this.order = orderData;


    this.workDetails= await this.storageService.getTrabajosByCodigoInterno(this.order.TST_LLAVE);
    this.equipmentDetails= await this.storageService.getEquiposByCodigoInterno(this.order.TST_LLAVE);
    this.repuestoDetails= await this.storageService.getRepuestosByCodigoInterno(this.order.TST_LLAVE);
    this.horarioDetails= await this.storageService.getHorariosByCodigoInterno(this.order.TST_LLAVE);

    let subtotal = 0;

    // Sumar todos los totales de Work
    this.workDetails.forEach(work => {
      subtotal += Number(work.TSTT_TOTAL);
    });

    // Sumar todos los totales de Repuesto
    this.repuestoDetails.forEach(repuesto => {
      subtotal += Number(repuesto.TSTR_TOTAL);
    });

    // Calcular IVA (suponiendo un 15% de IVA)
    const iva = subtotal * 0.15;

    // Calcular el total
    const total = subtotal + iva;

    // Actualizar la orden
    if (this.order) {
      this.order.TST_SUBTOTAL = Number(subtotal.toFixed(2));
      this.order.TST_IVA = Number(iva.toFixed(2));
      this.order.TST_TOTAL = Number(total.toFixed(2));
    }
  }

  async ionViewWillEnter() {
    await this.loadDetails();
  }

  // Mostrar el menú 
  openMenu() {
    this.menuCtrl.open();
  }

  async firmar() {

    //Verificar si hay un horario sin finalizar
    const horarioIniciado = await this.storageService.existeHorarioIniciado(this.order!.TST_LLAVE);

    if (horarioIniciado== false) {

      const alert = await this.alertController.create({
        header: 'Confirmar',
        message: '¿Desea continuar con la firma? Una vez firmado no se podra realizar cambios',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              console.log('Confirmación cancelada');
            }
          }, {
            text: 'Aceptar',
            handler: () => {
              this.router.navigate(['/firma']);
            }
          }
        ]
      });
      await alert.present();
      
    } else {
      this.presentAlert('Error', 'Existe un horario de trabajo sin finalizar');
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
