import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Horario } from 'src/app/models/horario.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HorarioDetailService {

  constructor(private storageService: StorageService,
    private http: HttpClient) { }


  public async updateHorarioDetails(horarioDetails: Horario[]): Promise<Observable<any>> {
    const DIR_HTML = await this.storageService.getServerIP();
  
    let data_envio = new URLSearchParams();
    data_envio.set('horarioDetails', JSON.stringify(horarioDetails)); // Enviamos el arreglo como un JSON string.
  
    let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    
    // Asegúrate de cambiar la URL a la de tu API que maneja la actualización de detalles de trabajo.
    return this.http.post<any>(`${DIR_HTML}/actualizar/actualizar_detalles_horario.php`, data_envio.toString(), { headers: headers });
  }

  // Método para subir todas los horarios pendientes
  public async uploadPendingHorarios(): Promise<void> {
    const pendingHorarios = await this.storageService.getPendingHorarios();

      try {
        const response$ = await this.updateHorarioDetails(pendingHorarios);
        response$.subscribe(
          (response) => {
            // Aquí manejas la respuesta exitosa
            if (response.valid == 'true') {
              console.log(`Horarios pendientes actualizados con éxito`);
              this.storageService.removeAllHorarioFromPending();
            } else {
              console.log(`No se pudo actualizar los Horarios pendientes: ${response.msg}`);
            }
            
            // Aquí podrías marcar la orden como no pendiente o eliminarla de la lista
            // de pendientes si se ha actualizado correctamente.
          },
          (error) => {
            // Aquí manejas los errores
            console.error(`Error al actualizar horario `, error);
            // Dependiendo del error, podrías reintentar o dejar la orden como pendiente.
          }
        );
      } catch (error) {
        console.error(`Error al procesar la horarios `, error);
        // Manejar excepción, por ejemplo, si no se pudo conectar al servicio.
      }
    
  }


}
