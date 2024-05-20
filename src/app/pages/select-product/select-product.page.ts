import { Component, OnInit } from '@angular/core';
import { MenuController, LoadingController, ToastController, NavController, ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize } from 'rxjs/operators';
import { Product } from 'src/app/models/product.model';
import { StockService } from 'src/app/services/stock/stock.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-product',
  templateUrl: './select-product.page.html',
  styleUrls: ['./select-product.page.scss'],
})
export class SelectProductPage implements OnInit {

  currentPage = 0;
  totalResults = 0;
  totalPages = 0;
  products: Product[] = [];
  searchQuery = new BehaviorSubject<{query: string, page: number, code?: string}>({query: '', page: 0});
  loading: any;
  
  searchValue: string = ''; //

  isScanning: boolean = false;

  constructor(
    private menuCtrl: MenuController,
    private stockService: StockService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
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
        this.totalPages = Math.ceil(this.totalResults / 5);
      })
    ).subscribe();
  }

  async scanCode() {
    

    BarcodeScanner.checkPermission({ force: true }).then((status) => {

      if (status.granted) {
        BarcodeScanner.hideBackground();
        // this.router.navigate(['/cam']);
        this.isScanning = true;
        document.body.classList.add('scanner-active'); // Activa la vista de la cámara
        // Optionally prepare the scanner
        BarcodeScanner.prepare();
        
        // Start scanning
        BarcodeScanner.startScan().then(result => {
          if (result.hasContent) {
            // this.router.navigate(['/add-pedido']);
            this.isScanning = false;
            console.log('Barcode data:', result.content);
            this.handleScanResult(result.content);
            this.searchValue = result.content;
            BarcodeScanner.showBackground();
            document.body.classList.remove('scanner-active'); // Desactiva la vista de la cámara
            BarcodeScanner.stopScan(); // Stop scanning      
          }
        }).catch(error => {
          // this.router.navigate(['/add-pedido']);
          this.isScanning = false;
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
    if (this.currentPage * 5 < this.totalResults) {
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

  async productSelected(product: Product){
    // Cerrar el modal y pasar el cliente seleccionado como data
    await this.modalController.dismiss({
      product: product
    });
  }


  async hideUIElements() {
    document.querySelectorAll('.ui-element').forEach(element => {
      element.classList.add('hidden');
    });
  }
  
  async showUIElements() {
    document.querySelectorAll('.ui-element').forEach(element => {
      element.classList.remove('hidden');
    });
  }
  

}
