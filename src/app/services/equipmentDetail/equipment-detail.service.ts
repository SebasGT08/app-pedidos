import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Equipment } from 'src/app/models/equipment.model';

@Injectable({
  providedIn: 'root'
})
export class EquipmentDetailService {

  constructor(private storageService: StorageService,
    private http: HttpClient) { }


  public async updateEquipmentDetails(equipmentDetails: Equipment[]): Promise<Observable<any>> {
    const DIR_HTML = await this.storageService.getServerIP();
  
    let data_envio = new URLSearchParams();
    data_envio.set('equipmentDetails', JSON.stringify(equipmentDetails)); // Enviamos el arreglo como un JSON string.
  
    let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    
    // Asegúrate de cambiar la URL a la de tu API que maneja la actualización de detalles de trabajo.
    return this.http.post<any>(`${DIR_HTML}/actualizar/actualizar_detalles_equipo.php`, data_envio.toString(), { headers: headers });
  }

  // Método para subir todos los detalles de equipos pendientes
  public async uploadPendingEquipmentDetails(): Promise<void> {
    // Obtener los detalles de equipo pendientes
    const pendingEquipmentDetails = await this.storageService.getPendingEquipmentDetails();
    // Iterar sobre cada conjunto de detalles de equipo pendientes
    for (const codigoInterno in pendingEquipmentDetails) {
      if (pendingEquipmentDetails.hasOwnProperty(codigoInterno)) {
        // Obtener los detalles de equipo para el TSTE_CODIGO_INTERNO actual
        const equipmentDetails = pendingEquipmentDetails[codigoInterno];
        try {
          // Utilizar el método updateEquipmentDetails para enviar los detalles al servidor
          const response$ = await this.updateEquipmentDetails(equipmentDetails);

          // Suscribirse al Observable para manejar la respuesta
          response$.subscribe(
            (response) => {
              if (response.valid == 'true') {
                console.log(`Detalles de equipo para código ${codigoInterno} actualizados con éxito`, response);
                this.storageService.removePendingEquipmentWorkDetails(+codigoInterno);
              } else {
                console.error(`Error al actualizar equipos pendientes:  ${response.msg}`);
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
