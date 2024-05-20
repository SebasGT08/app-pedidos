import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product } from 'src/app/models/product.model';
import { Observable } from 'rxjs';
import { Client } from 'src/app/models/client.model';

@Injectable({
  providedIn: 'root'
})
export class AddPedidoService {

  constructor(
    private storageService: StorageService,
    private http: HttpClient
  ) { }


  public async addPedido(productDetails: Product[],client: Client): Promise<Observable<any>> {
    const DIR_HTML = await this.storageService.getServerIP();
    const us = await this.storageService.getCurrentUser();
    let usuario= us.user;
  
    let data_envio = new URLSearchParams();
    data_envio.set('productDetails', JSON.stringify(productDetails));
    data_envio.set('client', JSON.stringify(client));
    data_envio.set('usuario', usuario);
  
    let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    
    // Asegúrate de cambiar la URL a la de tu API que maneja la actualización de detalles de trabajo.
    return this.http.post<any>(`${DIR_HTML}/ingresar/ingresar_nuevo_pedido.php`, data_envio.toString(), { headers: headers });
  }
}
