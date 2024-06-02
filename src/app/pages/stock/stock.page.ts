import { Component, OnInit } from '@angular/core';
import { MenuController, LoadingController, ToastController, NavController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize } from 'rxjs/operators';
import { Product } from 'src/app/models/product.model';
import { StockService } from 'src/app/services/stock/stock.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Router } from '@angular/router';
import { Capacitor, Plugins } from '@capacitor/core';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.page.html',
  styleUrls: ['./stock.page.scss'],
})
export class StockPage implements OnInit {
  currentPage = 0;
  totalResults = 0;
  totalPages = 0;
  products: Product[] = [];
  searchQuery = new BehaviorSubject<{query: string, page: number, code?: string}>({query: '', page: 0});
  loading: any;
  
  searchValue: string = ''; //


  constructor(
    private menuCtrl: MenuController,
    private stockService: StockService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.initializeBackButtonCustomBehavior();

    this.searchQuery.pipe(
      debounceTime(300),
      // distinctUntilChanged((prev, curr) => prev.query === curr.query && prev.page === curr.page),
      tap(() => this.presentLoading()),
      switchMap(({query, page, code}) =>
        this.stockService.searchProducts(query, page, code).pipe(
          finalize(() => this.loading.dismiss())
        )
      ),
      tap(response => {
        this.totalResults = response.total;
        this.products = response.data;
        this.totalPages = Math.ceil(this.totalResults / 20);
      })
    ).subscribe();
  }

  async scanCode() {
    

    BarcodeScanner.checkPermission({ force: true }).then((status) => {

      if (status.granted) {
        BarcodeScanner.hideBackground();
        this.router.navigate(['/cam']);

        document.body.classList.add('scanner-active'); // Activa la vista de la cámara
        // Optionally prepare the scanner
        BarcodeScanner.prepare();

        // Start scanning
        BarcodeScanner.startScan().then(result => {
          if (result.hasContent) {
            this.router.navigate(['/stock']);

            console.log('Barcode data:', result.content);
            this.handleScanResult(result.content);
            this.searchValue = result.content;
            BarcodeScanner.showBackground();
            document.body.classList.remove('scanner-active'); // Desactiva la vista de la cámara
            BarcodeScanner.stopScan(); // Stop scanning      
          }
        }).catch(error => {
          this.router.navigate(['/cam']);

          this.handleScanError(error);
        });
      } else {
        this.showToast('Camera permission is not granted');
      }
    });
  }

  handleScanError(error: any) {
    console.error('Scan error:', error);
    this.showToast('Error al escanear: ' + (error.message || 'Se produjo un error desconocido.'));
  }

  handleScanResult(barcodeData: string) {
    console.log('Contenido escaneado:', barcodeData);
    this.triggerSearch(this.searchQuery.value.query, barcodeData);
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'Cargando...',
      spinner: 'circles'
    });
    await this.loading.present();
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }

  openMenu() {
    this.menuCtrl.open();
  }

  searchChanged(event: any) {
    this.currentPage = 0;
    this.triggerSearch(event.detail.value);
  }

  nextPage() {
    if (this.currentPage * 20 < this.totalResults) {
      this.currentPage++;
      this.triggerSearch(this.searchQuery.value.query);
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.triggerSearch(this.searchQuery.value.query);
    }
  }

  triggerSearch(query: string, scannedCode?: string) {
    this.searchQuery.next({query: query, page: this.currentPage, code: scannedCode});
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  goToDetails(product: Product) {
    // Aquí puedes hacer lo que necesites con el producto seleccionado,
    // como enviarlo a otra pantalla
    this.navCtrl.navigateForward('/stock-detail', {
      queryParams: {
        product: JSON.stringify(product) // Envía el producto como parámetro de consulta
      }
    });
  }


  initializeBackButtonCustomBehavior() {
    if (Capacitor.isNativePlatform()) {
      Plugins['App']['addListener']('backButton', () => {
        // Aquí implementas lo que debe suceder cuando el botón de atrás es presionado
        if (this.router.url === '/cam') {
          // Suponiendo que '/cam' es la ruta donde está activa la cámara
          BarcodeScanner.stopScan();  // Detener el escaneo
          BarcodeScanner.showBackground();
          document.body.classList.remove('scanner-active');
          this.router.navigate(['/stock']); // Vuelve a la página de stock o donde necesites
        } else {
          // Si no está en la cámara, maneja el retroceso normalmente
          window.history.back();
        }
      });
    }
  }
}
