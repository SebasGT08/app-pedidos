import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/login/auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';
import { StorageService } from '../services/storage/storage.service';
import { LoadingController } from '@ionic/angular';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit{

  defaultServerIP: string = '192.168.5.3';
  model: any = { server: this.defaultServerIP, username: '', password: '' };

  constructor(
    private authService: AuthService, 
    private router: Router,
    private alertController: AlertController,
    private menuCtrl: MenuController,
    private storageService: StorageService,
    private loadingController: LoadingController
    ) {
      
    }

    ngOnInit() {
      this.menuCtrl.enable(false);
      this.checkLoginStatus();
    }
  

    async checkLoginStatus() {
      const currentUser = await this.storageService.getCurrentUser();
      if (currentUser && currentUser.key === 'true') {
        this.router.navigate(['/home']);
      } else {
        
      }
    }

  // Desactivar el menú cuando entramos en la página
  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }



  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }


  async login() {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
      spinner: 'circles' // Puedes elegir otros estilos de spinner
    });
    await loading.present();
    const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  
    if (ipPattern.test(this.model.server)) {
      const fullServerPath = `http://${this.model.server}/FERRICENTER/conexion_app_pedidos/administrador`;
      
      await this.storageService.setServerIP(fullServerPath);

      await this.storageService.setModoDesconectado(false);
  
      this.authService.login(this.model.username, this.model.password).subscribe(
        user => {
          loading.dismiss(); // Ocultar mensaje de carga
          if (user && user.key === 'true') {
            this.router.navigate(['/home']);
          } else {
            this.presentAlert('Error de inicio de sesión', user.msg);
          }
        },
        error => {
          loading.dismiss(); // Ocultar mensaje de carga
          if (error.status === 0) {
            this.presentAlert('Error de conexión', `No se puede conectar con el servidor ${this.model.server}`);
          } else {
            this.presentAlert('Error de inicio de sesión', 'Error al iniciar sesión.');
          }
          console.error(error.message);
        }
      );
    } else {
      loading.dismiss(); // Ocultar mensaje de carga
      console.error('La dirección IP del servidor no es válida');
    }
  }
  
}
