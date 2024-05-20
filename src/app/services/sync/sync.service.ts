import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';
import { Work } from 'src/app/models/work.model';
import { Equipment } from 'src/app/models/equipment.model';
import { Product } from 'src/app/models/product.model';
import { Repuesto } from 'src/app/models/repuesto.model';
import { Horario } from 'src/app/models/horario.model';


@Injectable({
  providedIn: 'root'
})
export class SyncService {

  constructor(private http: HttpClient,
  private storageService: StorageService) { }

  public async syncTrabajos(): Promise<void> {

    try {
      await this.storageService.removeTrabajoList();
  
      const DIR_HTML = await this.storageService.getServerIP();
      const username = await this.storageService.getCurrentUser();
  
      let data_envio = new URLSearchParams();
      data_envio.set('user', username.user);
  
      let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  
      // Aquí usamos await en lugar de .then() para esperar la respuesta del post
      const trabajos = await this.http.post<Work[]>(`${DIR_HTML}/datos/datos-obtener_all_trabajo.php`, data_envio.toString(), { headers: headers }).toPromise();
  
      // Solo procedemos a esta línea si la promesa anterior fue resuelta
      await this.storageService.setTrabajoList(trabajos!);
    } catch (error) {
      console.error('Error al sincronizar trabajos:', error);
      // Aquí debes manejar el error, como mostrar un mensaje al usuario
      throw error; // Opcional: lanza el error para manejarlo en el nivel superior
    }
  }

  public async syncEquipos(): Promise<void> {

    try {
      await this.storageService.removeEquipoList();
  
      const DIR_HTML = await this.storageService.getServerIP();
      const username = await this.storageService.getCurrentUser();
  
      let data_envio = new URLSearchParams();
      data_envio.set('user', username.user);
  
      let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  
      // Aquí usamos await en lugar de .then() para esperar la respuesta del post
      const equipos = await this.http.post<Equipment[]>(`${DIR_HTML}/datos/datos-obtener_all_equipo.php`, data_envio.toString(), { headers: headers }).toPromise();
  
      // Solo procedemos a esta línea si la promesa anterior fue resuelta
      await this.storageService.setEquipoList(equipos!);
    } catch (error) {
      console.error('Error al sincronizar equipos:', error);
      // Aquí debes manejar el error, como mostrar un mensaje al usuario
      throw error; // Opcional: lanza el error para manejarlo en el nivel superior
    }
  }

  public async syncProductos(): Promise<void> {

    try {
      await this.storageService.removeProductosList();
  
      const DIR_HTML = await this.storageService.getServerIP();
      const username = await this.storageService.getCurrentUser();
  
      let data_envio = new URLSearchParams();
      data_envio.set('user', username.user);
  
      let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  
      // Aquí usamos await en lugar de .then() para esperar la respuesta del post
      const productos = await this.http.post<Product[]>(`${DIR_HTML}/datos/datos-obtener_productos.php`, data_envio.toString(), { headers: headers }).toPromise();
  
      // Solo procedemos a esta línea si la promesa anterior fue resuelta
      await this.storageService.setProductosList(productos!);
    } catch (error) {
      console.error('Error al sincronizar productos:', error);
      // Aquí debes manejar el error, como mostrar un mensaje al usuario
      throw error; // Opcional: lanza el error para manejarlo en el nivel superior
    }
  }

  public async syncRepuestos(): Promise<void> {

    try {
      await this.storageService.removeRepuestosList();
  
      const DIR_HTML = await this.storageService.getServerIP();
      const username = await this.storageService.getCurrentUser();
  
      let data_envio = new URLSearchParams();
      data_envio.set('user', username.user);
  
      let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  
      // Aquí usamos await en lugar de .then() para esperar la respuesta del post
      const repuestos = await this.http.post<Repuesto[]>(`${DIR_HTML}/datos/datos-obtener_all_repuestos.php`, data_envio.toString(), { headers: headers }).toPromise();
  
      // Solo procedemos a esta línea si la promesa anterior fue resuelta
      await this.storageService.setRepuestoList(repuestos!);
    } catch (error) {
      console.error('Error al sincronizar repuestos:', error);
      // Aquí debes manejar el error, como mostrar un mensaje al usuario
      throw error; // Opcional: lanza el error para manejarlo en el nivel superior
    }
  }


  public async syncHorarios(): Promise<void> {

    try {
      await this.storageService.removeHorariosList();
  
      const DIR_HTML = await this.storageService.getServerIP();
      const username = await this.storageService.getCurrentUser();
  
      let data_envio = new URLSearchParams();
      data_envio.set('user', username.user);
  
      let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  
      // Aquí usamos await en lugar de .then() para esperar la respuesta del post
      const horarios = await this.http.post<Horario[]>(`${DIR_HTML}/datos/datos-obtener_all_horarios.php`, data_envio.toString(), { headers: headers }).toPromise();
  
      // Solo procedemos a esta línea si la promesa anterior fue resuelta
      await this.storageService.setHorarioList(horarios!);
    } catch (error) {
      console.error('Error al sincronizar horarios:', error);
      // Aquí debes manejar el error, como mostrar un mensaje al usuario
      throw error; // Opcional: lanza el error para manejarlo en el nivel superior
    }
  }



}
