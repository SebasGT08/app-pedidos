import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { Client } from 'src/app/models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  // Función para buscar clientes por término usando POST
  public searchClients(valor: string, pagina: number = 0): Observable<{total: number, data: Client[]}> {
    return new Observable(observer => {
      this.storageService.getServerIP().then(DIR_HTML => {
        const url = `${DIR_HTML}/datos/datos-obtener_clientes.php`;
        let data_envio = new URLSearchParams();
        data_envio.set('valor', valor);
        data_envio.set('page', pagina.toString());

        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  
        this.http.post<{total: number, data: Client[]}>(url, data_envio.toString(), { headers: headers }).subscribe(
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
