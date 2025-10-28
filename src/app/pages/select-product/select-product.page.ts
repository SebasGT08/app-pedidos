import { Component, OnInit } from '@angular/core';
import { MenuController, LoadingController, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, tap, finalize } from 'rxjs/operators';
import { Product } from 'src/app/models/product.model';
import { StockService } from 'src/app/services/stock/stock.service';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Router } from '@angular/router';
import { Capacitor, Plugins } from '@capacitor/core';

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

  // Ahora usamos un subject con query+page+code (la bodega la tenemos como prop del componente)
  searchQuery = new BehaviorSubject<{query: string, page: number, code?: string}>({query: '', page: 0});

  loading: any;
  searchValue: string = '';

  // >>> NUEVO: bodega recibida desde add-pedido (o localStorage)
  private selectedBodega: string | null = null;

  constructor(
    private menuCtrl: MenuController,
    private stockService: StockService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.initializeBackButtonCustomBehavior();

    // ====== Capturar bodega que llega por navigation extras (o fallback a localStorage) ======
    // Preferimos el state más reciente (router.getCurrentNavigation) y si no, history.state
    const nav = this.router.getCurrentNavigation();
    const stateBodega = nav?.extras?.state?.['bodega'] ?? (history.state && history.state['bodega']);
    const storedBodega = localStorage.getItem('BODEGA_SELECCIONADA');

    this.selectedBodega = stateBodega || storedBodega || null;

    // ====== Pipeline de búsqueda enviando la bodega al servicio ======
    this.searchQuery.pipe(
      debounceTime(300),
      tap(() => this.presentLoading()),
      switchMap(({query, page, code}) =>
        // Opción A: si tu servicio tiene firma con parámetro bodega separado:
        // this.stockService.searchProductsPedido(query, page, code, this.selectedBodega).pipe(
        //   finalize(() => this.loading.dismiss())
        // )

        // Opción B (recomendada): si tu servicio acepta un objeto de opciones:
        //   searchProductsPedido(query, page, code, { bodega: this.selectedBodega })
        this.stockService.searchProductsPedido(query, page, code, this.selectedBodega!).pipe(
          finalize(() => this.loading.dismiss())
        )
      ),
      tap(response => {
        this.totalResults = response.total;
        this.products = response.data;
        this.totalPages = Math.ceil(this.totalResults / 20);
      })
    ).subscribe();

    // Dispara la búsqueda inicial (respetando bodega)
    this.triggerSearch('');
  }

  async scanCode() {
    BarcodeScanner.checkPermission({ force: true }).then((status) => {
      if (status.granted) {
        BarcodeScanner.hideBackground();
        this.router.navigate(['/cam']);

        document.body.classList.add('scanner-active');
        BarcodeScanner.prepare();

        BarcodeScanner.startScan().then(result => {
          if (result.hasContent) {
            this.router.navigate(['/select-product']);
            this.handleScanResult(result.content);
            this.searchValue = result.content;
            BarcodeScanner.showBackground();
            document.body.classList.remove('scanner-active');
            BarcodeScanner.stopScan();
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

  initializeBackButtonCustomBehavior() {
    if (Capacitor.isNativePlatform()) {
      Plugins['App']['addListener']('backButton', () => {
        if (this.router.url === '/cam') {
          BarcodeScanner.stopScan();
          BarcodeScanner.showBackground();
          document.body.classList.remove('scanner-active');
          this.router.navigate(['/stock']);
        } else {
          window.history.back();
        }
      });
    }
  }

  productSelected(product: Product) {
    // Aquí NO hace falta reenviar la bodega; add-pedido la mantiene.
    // Si igual quisieras preservarla explícitamente:
    // const navigationExtras = { state: { product, bodega: this.selectedBodega } };

    const navigationExtras = { state: { product } };
    this.router.navigate(['add-pedido'], navigationExtras);
  }

}
