import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirmaService {

  constructor(private storageService: StorageService, private http: HttpClient) { }

  // Método para enviar los detalles de una firma al servidor
  public async uploadSignatureDetails(signatureDetails: { firma: string, tstLlave: number | null }): Promise<Observable<any>> {
    const DIR_HTML = await this.storageService.getServerIP();
    
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
  
    return this.http.post<any>(`${DIR_HTML}/subir/subir_firma.php`, signatureDetails, { headers: headers });
  }
  

  // Método para subir todas las firmas pendientes
  public async uploadPendingSignatures(): Promise<void> {
    // Obtener las firmas pendientes
    const pendingSignatures = await this.storageService.getPendingFirmas();
    
    // Iterar sobre cada firma pendiente
    for (const firma of pendingSignatures) {
      try {
        // Utilizar el método uploadSignatureDetails para enviar la firma al servidor
        const response$ = await this.uploadSignatureDetails(firma);

        response$.subscribe(
          async (response) => {
            if (response.valid === 'true') {
              console.log(`Firma para TST_LLAVE ${firma.tstLlave} subida con éxito`, response);
              await this.storageService.removePendingFirma(firma.tstLlave!);
            } else {
              console.error(`Error al subir firma pendiente: ${response.msg}`);
            }
          },
          (error) => {
            console.error('Error al subir la firma', error);
          }
        );
      } catch (error) {
        console.error('Error al procesar la firma pendiente', error);
      }
    }
  }
}
