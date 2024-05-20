import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { StorageService } from '../storage/storage.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any> | undefined;

  constructor(
    private http: HttpClient,
    private storageService: StorageService// Usamos StorageService en lugar de Storage
  ) {
    // Inicializamos el BehaviorSubject con datos vacíos o del storage si están disponibles
    this.currentUserSubject = new BehaviorSubject<any>(null);
    //this.init();
  }

  // // Inicializamos el servicio de almacenamiento y recuperamos el usuario si existe
  // async init() {
  //   const user = await this.storageService.getCurrentUser();
  //   if (user) {
  //     this.currentUserSubject.next(user);
  //   }
  //   this.currentUser = this.currentUserSubject.asObservable();
  // }

  // Acceso al valor actual del usuario de forma sincrónica
  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  // Función para realizar el inicio de sesión
  login(username: string, password: string): Observable<any> {
    // Usamos el método getServerIP del StorageService
    return from(this.storageService.getServerIP()).pipe(
      switchMap(DIR_HTML => {
        if (!DIR_HTML) {
          throw new Error('No se encontró la dirección del servidor en el almacenamiento.');
        }
  
        // Preparamos el cuerpo de la petición
        const body = new URLSearchParams();
        body.set('USUARIO', "wsdl_bppa_sojih");
        body.set('PASSWORD', "1q2w3e4r5t6y7u8i9o0p_ppa_sojih");
        body.set('mail', username);
        body.set('pass', password);

        // Preparamos los headers de la petición
        let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
  
        // Realizamos la petición HTTP y devolvemos el Observable resultante
        return this.http.post<any>(`${DIR_HTML}/json/login.php`, body.toString(), { headers: headers });
      }),
      tap(user => {
        // Si el usuario es válido, actualizamos el almacenamiento y el BehaviorSubject
        if (user && user.key == 'true') {
          this.storageService.setCurrentUser(user); // Usamos el método del StorageService
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  // Función para cerrar sesión
  logout() {
    // Eliminamos el usuario del almacenamiento y reseteamos el BehaviorSubject
    this.storageService.removeCurrentUser(); // Usamos el método del StorageService
    this.storageService.removeOrderList();
    this.storageService.removeOrderData();
    this.currentUserSubject.next(null);
  }
}
