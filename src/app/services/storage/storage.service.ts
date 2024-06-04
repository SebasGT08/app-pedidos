import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Product } from 'src/app/models/product.model';


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private storageReady: Promise<void>;
  private pendingOrdersKey = 'pendingOrders';
  private workDetailsKey = 'pendingWorks'; 
  private equipmentDetailsKey = 'pendingEquipments'; 
  private repuestoDetailsKey = 'pendingRepuestos'; 
  private horarioDetailsKey = 'pendingHorarios'; 

  constructor(private storage: Storage) {
    this.storageReady = this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }


  // Método para eliminar el usuario actual del almacenamiento
  public async removeCurrentUser(): Promise<void> {
    await this.storageReady;
    await this._storage?.remove('currentUser');
  }

  // Método para establecer los datos del usuario actual
  public async setCurrentUser(userData: any): Promise<void> {
    await this.storageReady;
    await this._storage?.set('currentUser', JSON.stringify(userData));
  }
  
  public async getCurrentUser(): Promise<any | null> {
    await this.storageReady;
    const userJson = await this._storage?.get('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user; // Devuelve el objeto de usuario completo
    }
    return []; // Si no hay usuario, devuelve null
  }
  
  
  


  // Método para obtener la dirección IP del servidor
  public async getServerIP(): Promise<string | null> {
    await this.storageReady;
    const serverIP = await this._storage?.get('serverIP');
    return serverIP;
  }

  // Método para establecer la dirección IP del servidor
  public async setServerIP(serverIP: string): Promise<void> {
    await this.storageReady;
    await this._storage?.set('serverIP', serverIP);
  }

  // Método para eliminar la dirección IP del servidor
  public async removeServerIP(): Promise<void> {
    await this.storageReady;
    await this._storage?.remove('serverIP');
  }




/////////////LISTA DE PRODUCTO //////

// Guarda la lista completa de productos
public async setProductosList(productos: Product[]): Promise<void> {
  await this.storageReady;
  await this._storage?.set('productosList', JSON.stringify(productos));
}

// Elimina la lista completa de productos
public async removeProductosList(): Promise<void> {
  await this.storageReady;
  await this._storage?.remove('productosList');
}



// Método para obtener el estadpo de modo desconectado
public async getModoDesconectado(): Promise<boolean>  {
  await this.storageReady;
  const modo = await this._storage?.get('ModoDesconectado');
  return modo;
}

// Método para establecer el estadpo de modo desconectado
public async setModoDesconectado(modo: boolean): Promise<void> {
  await this.storageReady;
  await this._storage?.set('ModoDesconectado', modo);
}

// Método para eliminar el estadpo de modo desconectado
public async removeModoDesconectado(): Promise<void> {
  await this.storageReady;
  await this._storage?.remove('ModoDesconectado');
}





}


