import { Injectable } from '@angular/core';

import { Order } from '../../models/order.model';

import { from, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';
import { ConnectivityService } from '../connectivity/connectivity.service';


@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient, 
    private storageService: StorageService,
    private connectivityService: ConnectivityService) {}


    public async getOrdersWithFallback(): Promise<Order[]> {
      try {
        const isConnected = await this.connectivityService.checkServerStatus();
        if (isConnected) {
          // Si hay conexión, intentamos obtener las órdenes del servidor.
          const orders = await (await this.getOrders()).toPromise();
          await this.storageService.setOrderList(orders!);
          return orders!;
        } else {
          // Si no hay conexión, buscamos las órdenes en el almacenamiento local.
          console.log('Sin Internet, obteniendo las ordenes del almacenamiento');
          const storedOrders = await this.storageService.getOrderList();
          return storedOrders || [];
        }
      } catch (error) {
        // Si algo falla, ya sea en checkServerStatus, getOrders o getOrderList, caemos aquí.
        console.error('Error al obtener las órdenes:', error);
        return []; // Devolvemos un array vacío si hay un error.
      }
    }
    


    public async getOrders(): Promise<Observable<Order[]>> {
      const DIR_HTML = await this.storageService.getServerIP();
      const username = await this.storageService.getCurrentUser();
      
      let data_envio = new URLSearchParams();
      data_envio.set('user', username.user);
      
      let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
      
      return this.http.post<Order[]>(`${DIR_HTML}/datos/datos-obtener_ordenes.php`, data_envio.toString(), { headers: headers });
    }


}
