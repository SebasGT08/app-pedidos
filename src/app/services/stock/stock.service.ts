import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model'; // Asegúrate de tener esta interfaz modelada correctamente
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  // Función para buscar productos por término usando POST
  public searchProducts(valor: string, pagina: number = 0, code?: string): Observable<{total: number, data: Product[]}> {
    return new Observable(observer => {
      this.storageService.getServerIP().then(DIR_HTML => {
        const url = `${DIR_HTML}/datos/datos-obtener_productos.php`;
        let data_envio = new URLSearchParams();
        data_envio.set('valor', valor);
        data_envio.set('page', pagina.toString());

        if (code) {
          data_envio.set('code', code); // Set the scanned code if it exists
        }
  
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  
        this.http.post<{total: number, data: Product[]}>(url, data_envio.toString(), { headers: headers }).subscribe(
          response => {
            observer.next(response);
            observer.complete();
          },
          error => {
            observer.error(error);
            observer.complete();
          }
        );
      });
    });
  }

  // Función para buscar productos por término usando POST para pedido
  public searchProductsPedido(valor: string, pagina: number = 0, code?: string): Observable<{total: number, data: Product[]}> {
    return new Observable(observer => {
      this.storageService.getServerIP().then(DIR_HTML => {
        const url = `${DIR_HTML}/datos/datos-obtener_productos_pedido.php`;
        let data_envio = new URLSearchParams();
        data_envio.set('valor', valor);
        data_envio.set('page', pagina.toString());

        if (code) {
          data_envio.set('code', code); // Set the scanned code if it exists
        }
  
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  
        this.http.post<{total: number, data: Product[]}>(url, data_envio.toString(), { headers: headers }).subscribe(
          response => {
            observer.next(response);
            observer.complete();
          },
          error => {
            observer.error(error);
            observer.complete();
          }
        );
      });
    });
  }
}
