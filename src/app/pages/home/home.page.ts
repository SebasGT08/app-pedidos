import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public username: string | null = null;

  

  constructor(
    private menuCtrl: MenuController,
    private storageService: StorageService,
    private router: Router,

  ) {
    
   }

   // Activat el menú cuando entramos en la página
  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

   // Mostrar el menú 
  openMenu() {
    this.menuCtrl.open();
  }

  async ngOnInit() {
    this.loadUserData();
  }

  async loadUserData() {
    const us = await this.storageService.getCurrentUser();
    this.username= us.nombre;
  }


  async btn_stock() {
    this.router.navigate(['/stock']);
  }

  async btn_nuevo_pedido() {
    this.router.navigate(['/add-pedido']);
  }

  async abrir_nuevo_cliente() {

  }
  

}
