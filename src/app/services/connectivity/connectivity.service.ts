import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';
import { catchError, timeout } from 'rxjs/operators';
import { throwError, of, TimeoutError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {

  private readonly TIMEOUT = 3000;


  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    ) {

    }

    // public async checkServerStatus(): Promise<boolean> {
    //   try {
    //     const serverIP = await this.storageService.getServerIP();
    //     if (!serverIP) {
    //       console.error('No se pudo obtener la dirección IP del servidor.');
    //       return false;
    //     }
    
    //     const pingEndpoint = `${serverIP}/ping.php`;
    //     await this.http.get(pingEndpoint).toPromise();
    //     return true;
    //   } catch (error) {
    //     console.error('Error al comprobar la conectividad:', error);
    //     return false;
    //   }
    // }

    public async checkServerStatus(): Promise<boolean> {
      let modo = await this.storageService.getModoDesconectado();
      if (modo == false) {
        try {
          const serverIP = await this.storageService.getServerIP();
          if (!serverIP) {
            console.error('No se pudo obtener la dirección IP del servidor.');
            return false;
          }
        
          const pingEndpoint = `${serverIP}/ping.php`;
          // Usamos RxJS para manejar el timeout
          await this.http.get(pingEndpoint)
            .pipe(
              timeout(this.TIMEOUT) // Aplicamos un timeout 
            )
            .toPromise();
          return true; // Si la petición es exitosa antes del timeout, devolvemos true
        } catch (error) {
          //console.error('Error al comprobar la conectividad o timeout alcanzado:', error);
          return false; // Si hay un error o se alcanza el timeout, devolvemos false
        }
      }else{
        return false;
      }
      
    }
}
