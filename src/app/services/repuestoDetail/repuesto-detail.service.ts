import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Repuesto } from 'src/app/models/repuesto.model';


@Injectable({
  providedIn: 'root'
})
export class RepuestoDetailService {

  constructor(private storageService: StorageService,
    private http: HttpClient) { }


  public async updateRepuestoDetails(repuestoDetails: Repuesto[]): Promise<Observable<any>> {
    const DIR_HTML = await this.storageService.getServerIP();
  
    let data_envio = new URLSearchParams();
    data_envio.set('repuestoDetails', JSON.stringify(repuestoDetails)); // Enviamos el arreglo como un JSON string.
  
    let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    
    // Asegúrate de cambiar la URL a la de tu API que maneja la actualización de detalles de trabajo.
    return this.http.post<any>(`${DIR_HTML}/actualizar/actualizar_detalles_repuesto.php`, data_envio.toString(), { headers: headers });
  }

  // Método para subir todos los detalles de repuesto pendientes
  public async uploadPendingRepuestoDetails(): Promise<void> {
    // Obtener los detalles de repuesto pendientes
    const pendingRepuestoDetails = await this.storageService.getPendingRepuestoDetails();
    // Iterar sobre cada conjunto de detalles de repuesto pendientes
    for (const codigoInterno in pendingRepuestoDetails) {
      if (pendingRepuestoDetails.hasOwnProperty(codigoInterno)) {
        // Obtener los detalles de repuesto para el TSTR_CODIGO_INTERNO actual
        const repuestoDetails = pendingRepuestoDetails[codigoInterno];
        try {
          // Utilizar el método updateRepuestoDetails para enviar los detalles al servidor
          const response$ = await this.updateRepuestoDetails(repuestoDetails);

          // Suscribirse al Observable para manejar la respuesta
          response$.subscribe(
            (response) => {
              if (response.valid == 'true') {
                console.log(`Detalles de repuesto para código ${codigoInterno} actualizados con éxito`, response);
                this.storageService.removePendingRepuestoDetails(+codigoInterno);
              } else {
                console.error(`Error al actualizar repuestos pendientes:  ${response.msg}`);
              }

            },
            (error) => {
              console.error(`Error al actualizar los detalles de equipos para código ${codigoInterno}`, error);
            }
          );
        } catch (error) {
          console.error(`Error al procesar los detalles de equipo para código ${codigoInterno}`, error);
        }
      }
    }
  }
}
