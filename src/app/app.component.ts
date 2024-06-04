import { Component } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';

import {  OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/login/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public appPages = [
    { title: 'HOME', url: 'home', icon: 'home' },
    { title: 'Consulta Stock', url: 'stock', icon: 'search' },
    { title: 'Nuevo Pedido', url: 'add-pedido', icon: 'duplicate'}


    // { title: 'Detalle Serv. Tecnico', url: 'order-details', icon: 'hammer' },
    // { title: 'Det. Trabajo Realizado', url: 'work-details', icon: 'briefcase' },
    // { title: 'Det. Equipos', url: 'equipment-details', icon: 'desktop' },
    // { title: 'Det. Repuestos', url: 'repuesto-details', icon: 'construct' },
    // { title: 'Det. Horarios', url: 'horario-details', icon: 'time' },
    // { title: 'Finalizar Orden', url: 'finalizar', icon: 'document-text' },
    


  ];
  public labels = [];
  // public ordenActual: Order | null = null; 
  public username: string | null = null;
  public cod_usu: string | null = null;
  

  constructor(
    private storageService: StorageService,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController,
    
    ) {}

  ngOnInit() {
    //this.syncPendientesService.checkServerAndSync();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // this.loadOrderData();
        this.loadUserData();
      }
    });
  }

  // async loadOrderData() {
  //   this.ordenActual = await this.storageService.getOrderData();
  // }

  async loadUserData() {
    const us = await this.storageService.getCurrentUser();
    this.username= us.nombre;
    this.cod_usu=us.user;
  }

  async logout() {
    // let pendiente = await this.storageService.isEverythingProcessed();
    // if (pendiente == true) {
      // this.storageService.removeOrderData();
      this.authService.logout();
      this.router.navigateByUrl('/login');
    // } else {
    //   this.presentAlert('Alerta', 'Existen cambios pendientes, sincronice los datos primero');
    // }
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