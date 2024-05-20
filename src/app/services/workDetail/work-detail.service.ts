import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Work } from 'src/app/models/work.model';

@Injectable({
  providedIn: 'root'
})
export class WorkDetailService {

  constructor(private storageService: StorageService,
    private http: HttpClient) { }

    public async updateWorkDetails(workDetails: Work[]): Promise<Observable<any>> {
      const DIR_HTML = await this.storageService.getServerIP();
      // Asumiendo que WorkDetail es tu interfaz o clase que representa los detalles del trabajo.
    
      let data_envio = new URLSearchParams();
      data_envio.set('workDetails', JSON.stringify(workDetails)); // Enviamos el arreglo como un JSON string.
    
      let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
      
      // Asegúrate de cambiar la URL a la de tu API que maneja la actualización de detalles de trabajo.
      return this.http.post<any>(`${DIR_HTML}/actualizar/actualizar_detalles_trabajo.php`, data_envio.toString(), { headers: headers });
    }

    // Método para subir todos los detalles de trabajo pendientes
    public async uploadPendingWorkDetails(): Promise<void> {
      // Obtener los detalles de trabajo pendientes
      const pendingWorkDetails = await this.storageService.getPendingWorkDetails();
      // Iterar sobre cada conjunto de detalles de trabajo pendientes
      for (const codigoInterno in pendingWorkDetails) {
        if (pendingWorkDetails.hasOwnProperty(codigoInterno)) {
          // Obtener los detalles de trabajo para el TSTT_CODIGO_INTERNO actual
          const workDetails = pendingWorkDetails[codigoInterno];
          try {
            // Utilizar el método updateWorkDetails para enviar los detalles al servidor
            const response$ = await this.updateWorkDetails(workDetails);

            // Suscribirse al Observable para manejar la respuesta
            response$.subscribe(
              (response) => {
                if (response.valid = 'true') {
                  console.log(`Detalles de trabajo para código ${codigoInterno} actualizados con éxito`, response);
                  this.storageService.removePendingWorkDetails(+codigoInterno);
                } else {
                  console.error(`Error al actulizar trabajos pendientes: ${response.msg}`);
                }
                
                // Aquí puedes manejar la lógica post-actualización, como eliminar los detalles de trabajo pendientes que ya se han actualizado
              },
              (error) => {
                console.error(`Error al actualizar los detalles de trabajo para código ${codigoInterno}`, error);
                // Aquí puedes manejar errores, por ejemplo, reintentar o dejar los detalles como pendientes
              }
            );
          } catch (error) {
            console.error(`Error al procesar los detalles de trabajo para código ${codigoInterno}`, error);
            // Manejar excepciones, por ejemplo, si no se pudo conectar al servicio
          }
        }
      }
    }
    
}
