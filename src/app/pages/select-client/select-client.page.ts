import { Component, OnInit } from '@angular/core';
import { Client } from 'src/app/models/client.model';
import { MenuController, LoadingController, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, tap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ClientService } from 'src/app/services/client/client.service';

@Component({
  selector: 'app-select-client',
  templateUrl: './select-client.page.html',
  styleUrls: ['./select-client.page.scss'],
})
export class SelectClientPage implements OnInit {

  currentPage = 0;
  totalResults = 0;
  totalPages = 0;
  clients: Client[] = [];
  searchQuery = new BehaviorSubject<{query: string, page: number}>({query: '', page: 0});
  loading: any;
  
  searchValue: string = ''; //

  constructor(
    private menuCtrl: MenuController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private clientService: ClientService,
    private router: Router
  ) { }

  ngOnInit() {
    this.searchQuery.pipe(
      debounceTime(300),
      tap(() => this.presentLoading()),
      switchMap(({query, page}) =>
        this.clientService.searchClients(query, page).pipe(
          finalize(() => this.loading.dismiss())
        )
      ),
      tap(response => {
        this.totalResults = response.total;
        this.clients = response.data;
        this.totalPages = Math.ceil(this.totalResults / 10);
      })
    ).subscribe();
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'Cargando...',
      spinner: 'circles'
    });
    await this.loading.present();
  }

  openMenu() {
    this.menuCtrl.open();
  }

  searchChanged(event: any) {
    this.currentPage = 0;
    this.triggerSearch(event.detail.value);
  }

  nextPage() {
    if (this.currentPage * 10 < this.totalResults) {
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

  triggerSearch(query: string) {
    this.searchQuery.next({query: query, page: this.currentPage});
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  clientSelected(client: Client) {
    const navigationExtras = {
      state: {
        client: client
      }
    };
    this.router.navigate(['add-pedido'], navigationExtras);
  }

}
