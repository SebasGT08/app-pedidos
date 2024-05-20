import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Observable } from 'rxjs';
import { Order } from 'src/app/models/order.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderDetailService {

  constructor(
    private storageService: StorageService,
    private http: HttpClient
  ) { }

  //Metodo para actualizar una orden
  public async updateOrder(order: Order): Promise<Observable<any>> {
    const DIR_HTML = await this.storageService.getServerIP();
    //const username = await this.storageService.getCurrentUser();

    let data_envio = new URLSearchParams();
    data_envio.set('order', JSON.stringify(order));

    let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    
    // Asegúrate de cambiar la URL a la de tu API que maneja la actualización de órdenes
    return this.http.post<any>(`${DIR_HTML}/actualizar/actualizar_orden.php`, data_envio.toString(), { headers: headers });
  }

  // Método para subir todas las órdenes pendientes
  public async uploadPendingOrders(): Promise<void> {
    const pendingOrders = await this.storageService.getPendingOrders();

    for (const order of pendingOrders) {
      try {
        const response$ = await this.updateOrder(order);
        response$.subscribe(
          (response) => {
            if (response.valid == 'true') {
              console.log(`Orden ${order.TST_LLAVE} actualizada con éxito`, response);
              this.storageService.removeOrderFromPending(order);
            } else {
              console.log(`Error al actulizar orden ${order.TST_LLAVE} : ${response.msg} `);
              this.storageService.removeOrderFromPending(order);
            }
            
            
          },
          (error) => {
            // Aquí manejas los errores
            console.error(`Error al actualizar la orden ${order.TST_LLAVE}`, error);
            // Dependiendo del error, podrías reintentar o dejar la orden como pendiente.
          }
        );
      } catch (error) {
        console.error(`Error al procesar la orden ${order.TST_LLAVE}`, error);
        // Manejar excepción, por ejemplo, si no se pudo conectar al servicio.
      }
    }
  }

  
}
