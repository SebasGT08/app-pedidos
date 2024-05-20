import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Equipment } from 'src/app/models/equipment.model';
import { Horario } from 'src/app/models/horario.model';
import { Order } from 'src/app/models/order.model';
import { Product } from 'src/app/models/product.model';
import { Repuesto } from 'src/app/models/repuesto.model';
import { Work } from 'src/app/models/work.model';

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

  public async setOrderData(orderData: Order): Promise<void> {
    await this.storageReady;
    await this._storage?.set('selectedOrder', JSON.stringify(orderData));
  }

  public async getOrderData(): Promise<Order | null> {
    await this.storageReady;
    const orderJson = await this._storage?.get('selectedOrder');
    return orderJson ? JSON.parse(orderJson) : null;
  }
  // Método para eliminar la orden actual del almacenamiento
  public async removeOrderData(): Promise<void> {
    await this.storageReady;
    await this._storage?.remove('selectedOrder');
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


  // Método para establecer la lista completa de órdenes
public async setOrderList(orderList: Order[]): Promise<void> {
  await this.storageReady;
  await this._storage?.set('orderList', JSON.stringify(orderList));
}

  // Método para eliminar la lista completa de órdenes
  public async removeOrderList(): Promise<void> {
    await this.storageReady;
    await this._storage?.remove('orderList');
  }

// Método para obtener la lista completa de órdenes
public async getOrderList(): Promise<Order[] | null> {
  await this.storageReady;
  const ordersJson = await this._storage?.get('orderList');
  if (!ordersJson) {
    return [];
  }

  const allOrders = JSON.parse(ordersJson) as Order[];
  const filteredOrders = allOrders.filter(order => order.TST_ESTADO === 'P');
  
  return filteredOrders;
}

// Método para actualizar una orden específica
public async updateOrderList(updatedOrder: Order): Promise<void> {
  await this.storageReady;

  // Obtener la lista actual de órdenes
  let orderList = await this.getOrderList();
  if (!orderList) {
    orderList = [];
  }

  // Buscar el índice de la orden a actualizar basándose en TST_LLAVE
  const orderIndex = orderList.findIndex(order => order.TST_LLAVE === updatedOrder.TST_LLAVE);

  if (orderIndex !== -1) {
    // Reemplazar la orden antigua por la actualizada
    orderList[orderIndex] = updatedOrder;
  } else {
    // Si no se encuentra la orden, opcionalmente puedes añadirla al arreglo
    //orderList.push(updatedOrder);
    console.log('No se econtro la orden');
  }

  // Guardar la lista actualizada de órdenes
  await this._storage?.set('orderList', JSON.stringify(orderList));
}


// Método para actualizar o añadir una orden pendiente
public async upsertPendingOrder(newOrder: Order): Promise<void> {
  await this.storageReady;

  // Obtener la lista actual de órdenes pendientes
  let pendingOrders = await this.getPendingOrders();

  // Buscar el índice de la orden pendiente con la misma TST_LLAVE
  const orderIndex = pendingOrders.findIndex(order => order.TST_LLAVE === newOrder.TST_LLAVE);

  if (orderIndex !== -1) {
    // Si existe, reemplazar la orden antigua por la nueva
    pendingOrders[orderIndex] = newOrder;
  } else {
    // Si no existe, añadir la nueva orden a la lista de pendientes
    pendingOrders.push(newOrder);
  }

  // Guardar la lista actualizada de órdenes pendientes
  await this._storage?.set(this.pendingOrdersKey, JSON.stringify(pendingOrders));
}

// Método para obtener las órdenes pendientes
public async getPendingOrders(): Promise<Order[]> {
  await this.storageReady; // Asegurarse de que el almacenamiento esté listo

  try {
    const pendingOrdersJson = await this._storage?.get('pendingOrders');
    // Si hay datos, intenta analizarlos. Si no, o si hay un error, retorna un array vacío.
    return pendingOrdersJson ? JSON.parse(pendingOrdersJson) : [];
  } catch (error) {
    console.log('No hay órdenes pendientes:');
    return []; // Retorna un array vacío en caso de error
  }
}

// Elimina una orden de la lista de órdenes pendientes
async removeOrderFromPending(order: Order): Promise<void> {
  await this.storageReady;
  let pendingOrders = await this.getPendingOrders();
  pendingOrders = pendingOrders.filter(o => o.TST_LLAVE !== order.TST_LLAVE); 
  await this.storage.set(this.pendingOrdersKey, pendingOrders);
}



/////////////////////////////////DETALLE TRABAJO ///////////////////////////
// Guarda la lista completa de trabajos
public async setTrabajoList(trabajos: Work[]): Promise<void> {
  await this.storageReady;
  await this._storage?.set('trabajoList', JSON.stringify(trabajos));
}

// Elimina la lista completa de trabajos
public async removeTrabajoList(): Promise<void> {
  await this.storageReady;
  await this._storage?.remove('trabajoList');
}

 // Obtiene todos los trabajos que coinciden con un TSTT_CODIGO_INTERNO específico
 public async getTrabajosByCodigoInterno(codigoInterno: number): Promise<Work[]> {
  await this.storageReady;
  const trabajosJson = await this._storage?.get('trabajoList');
  if (trabajosJson) {
    const trabajos: Work[] = JSON.parse(trabajosJson);
    // Filtra y devuelve todos los trabajos con el mismo TSTT_CODIGO_INTERNO
    return trabajos.filter(t => t.TSTT_CODIGO_INTERNO == codigoInterno);
  }
  return []; // Si no hay trabajos o no se encuentra el TSTT_CODIGO_INTERNO, devuelve una lista vacía
}

public async replaceTrabajosByCodigoInterno(codigoInterno: number, nuevosTrabajos: Work[]): Promise<void> {
  await this.storageReady;

  // Obtiene la lista actual de trabajos
  const trabajosJson = await this._storage?.get('trabajoList');
  let trabajos: Work[] = trabajosJson ? JSON.parse(trabajosJson) : [];

  // Filtra fuera los trabajos con el TSTT_CODIGO_INTERNO que vamos a reemplazar
  trabajos = trabajos.filter(t => t.TSTT_CODIGO_INTERNO !== codigoInterno);

  // Agrega los nuevos trabajos al array filtrado
  trabajos = trabajos.concat(nuevosTrabajos);

  // Guarda la nueva lista de trabajos
  await this._storage?.set('trabajoList', JSON.stringify(trabajos));
}




// Obtiene los detalles de trabajo guardados localmente
async getPendingWorkDetails(): Promise<{ [codTrabajo: number]: Work[] }> {
  await this.storageReady;
  return await this._storage?.get(this.workDetailsKey) || {};
}

// Método para actualizar o añadir detalles de trabajo para un TSTT_CODIGO_INTERNO específico
public async upsertPendingWorkDetails(codigoTrabajo: number, workDetails: Work[]): Promise<void> {
  await this.storageReady;

  // Obtener los detalles de trabajo actuales
  let allWorkDetails = await this.getPendingWorkDetails();

  // Reemplazar los detalles existentes para el codigoTrabajo con los nuevos detalles
  allWorkDetails[codigoTrabajo] = workDetails;

  // Guardar los detalles de trabajo actualizados en el almacenamiento
  await this._storage?.set(this.workDetailsKey, allWorkDetails);
}

// Método para eliminar los detalles de trabajo asociados con un TSTT_CODIGO_INTERNO específico
public async removePendingWorkDetails(codigoTrabajo: number): Promise<void> {
  await this.storageReady;

  // Obtener los detalles de trabajo actuales
  let allWorkDetails = await this.getPendingWorkDetails();

  // Verificar si existe el TSTT_CODIGO_INTERNO en los detalles de trabajo actuales
  if(allWorkDetails.hasOwnProperty(codigoTrabajo)) {
    // Eliminar los detalles de trabajo para el codigoTrabajo
    delete allWorkDetails[codigoTrabajo];

    // Guardar los detalles de trabajo actualizados en el almacenamiento
    await this._storage?.set(this.workDetailsKey, allWorkDetails);
  } else {
    console.log(`No se encontraron detalles de trabajo para el código ${codigoTrabajo}`);
  }
}


/////////////////////////////////DETALLE Equipo ///////////////////////////
// Guarda la lista completa de equipos
public async setEquipoList(equipos: Equipment[]): Promise<void> {
  await this.storageReady;
  await this._storage?.set('equipoList', JSON.stringify(equipos));
}

// Elimina la lista completa de EQUIPOS
public async removeEquipoList(): Promise<void> {
  await this.storageReady;
  await this._storage?.remove('equipoList');
}
 // Obtiene todos los equipos que coinciden con un TSTE_CODIGO_INTERNO específico
 public async getEquiposByCodigoInterno(codigoInterno: number): Promise<Equipment[]> {
  await this.storageReady;
  const equiposJson = await this._storage?.get('equipoList');
  if (equiposJson) {
    const equipos: Equipment[] = JSON.parse(equiposJson);
    // Filtra y devuelve todos los equipos con el mismo TSTE_CODIGO_INTERNO
    return equipos.filter(e => e.TSTE_CODIGO_INTERNO == codigoInterno);
  }
  return []; // Si no hay equipos o no se encuentra el TSTE_CODIGO_INTERNO, devuelve una lista vacía
}

public async replaceEquiposByCodigoInterno(codigoInterno: number, nuevosEquipos: Equipment[]): Promise<void> {
  await this.storageReady;

  // Obtiene la lista actual de equipos
  const equiposJson = await this._storage?.get('equipoList');
  let equipos: Equipment[] = equiposJson ? JSON.parse(equiposJson) : [];

  // Filtra fuera los equipos con el TSTE_CODIGO_INTERNO que vamos a reemplazar
  equipos = equipos.filter(e => e.TSTE_CODIGO_INTERNO !== codigoInterno);

  // Agrega los nuevos equipos al array filtrado
  equipos = equipos.concat(nuevosEquipos);

  // Guarda la nueva lista de trabajos
  await this._storage?.set('equipoList', JSON.stringify(equipos));
}




// Obtiene los detalles de equipos guardados localmente
async getPendingEquipmentDetails(): Promise<{ [codEquipo: number]: Equipment[] }> {
  await this.storageReady;
  return await this._storage?.get(this.equipmentDetailsKey) || {};
}


// Método para actualizar o añadir detalles de equipo para un TSTE_CODIGO_INTERNO específico
public async upsertPendingEquipmentDetails(codEquipo: number, equipmentDetails: Equipment[]): Promise<void> {
  await this.storageReady;

  // Obtener los detalles de equipo actuales
  let allEquipmentDetails = await this.getPendingEquipmentDetails();

  // Reemplazar los detalles existentes para el codEquipo con los nuevos detalles
  allEquipmentDetails[codEquipo] = equipmentDetails;

  // Guardar los detalles de equipo actualizados en el almacenamiento
  await this._storage?.set(this.equipmentDetailsKey, allEquipmentDetails);
}

// Método para eliminar los detalles de equipo asociados con un TSTT_CODIGO_INTERNO específico
public async removePendingEquipmentWorkDetails(codEquipo: number): Promise<void> {
  await this.storageReady;

  // Obtener los detalles de equipo actuales
  let allEquipmentDetails = await this.getPendingEquipmentDetails();

  // Verificar si existe el TSTT_CODIGO_INTERNO en los detalles de equipo actuales
  if(allEquipmentDetails.hasOwnProperty(codEquipo)) {
    // Eliminar los detalles de equipo para el codEquipo
    delete allEquipmentDetails[codEquipo];

    // Guardar los detalles de equipo actualizados en el almacenamiento
    await this._storage?.set(this.equipmentDetailsKey, allEquipmentDetails);
  } else {
    console.log(`No se encontraron detalles de equipo para el código ${codEquipo}`);
  }
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

// Retornar productos según su código o nombre con búsqueda numérica específica
// public async getFilteredProducts(searchTerm: string, limit: number = 50): Promise<Product[]> {
//   await this.storageReady;
//   const productosList = await this._storage?.get('productosList');
//   const allProductos: Product[] = productosList ? JSON.parse(productosList) : [];

//   // Verificar si el término de búsqueda es numérico
//   const isNumeric = /^\d+$/.test(searchTerm);

//   // Retornar solo los productos que coincidan con el término de búsqueda hasta el límite especificado
//   return allProductos
//     .filter(p => {
//       // Siempre excluir productos marcados con IMA_REPUESTO 'no'
//       if (p.IMA_REPUESTO.toLowerCase() === 'no') {
//         if (isNumeric) {
//           // Búsqueda numérica: comparar si el principio de los campos numéricos es igual al searchTerm
//           return p.IMA_ARTICULO.startsWith(searchTerm) || p.IMA_DESCRIPCION.startsWith(searchTerm);
//         } else {
//           // Búsqueda no numérica: comparar si algún campo contiene el searchTerm
//           return p.IMA_ARTICULO.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                  p.IMA_DESCRIPCION.toLowerCase().includes(searchTerm.toLowerCase());
//         }
//       }
//       return false;
//     })
//     .slice(0, limit); // Limitar el número de resultados devueltos
// }

// // Retornar REPUESTOS según su código o nombre con búsqueda numérica específica
// public async getFilteredProducts2(searchTerm: string, limit: number = 50): Promise<Product[]> {
//   await this.storageReady;
//   const productosList = await this._storage?.get('productosList');
//   const allProductos: Product[] = productosList ? JSON.parse(productosList) : [];

//   // Verificar si el término de búsqueda es numérico
//   const isNumeric = /^\d+$/.test(searchTerm);

//   // Retornar solo los productos que coincidan con el término de búsqueda hasta el límite especificado
//   return allProductos
//     .filter(p => {
//       // Siempre excluir productos marcados con IMA_REPUESTO 'no'
//       if (p.IMA_REPUESTO.toLowerCase() === 'si') {
//         if (isNumeric) {
//           // Búsqueda numérica: comparar si el principio de los campos numéricos es igual al searchTerm
//           return p.IMA_ARTICULO.startsWith(searchTerm) || p.IMA_DESCRIPCION.startsWith(searchTerm);
//         } else {
//           // Búsqueda no numérica: comparar si algún campo contiene el searchTerm
//           return p.IMA_ARTICULO.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                  p.IMA_DESCRIPCION.toLowerCase().includes(searchTerm.toLowerCase());
//         }
//       }
//       return false;
//     })
//     .slice(0, limit); // Limitar el número de resultados devueltos
// }




/////////////////////////////////DETALLE REPUESTOS ////////////////////////////////////////////
// Guarda la lista completa de repuestos
public async setRepuestoList(repuestos: Repuesto[]): Promise<void> {
  await this.storageReady;
  await this._storage?.set('repuestoList', JSON.stringify(repuestos));
}

// Elimina la lista completa de repuestos
public async removeRepuestosList(): Promise<void> {
  await this.storageReady;
  await this._storage?.remove('repuestoList');
}

 // Obtiene todos los DETALLE que coinciden con un TSTR_CODIGO_INTERNO específico
 public async getRepuestosByCodigoInterno(codigoInterno: number): Promise<Repuesto[]> {
  await this.storageReady;
  const repuestosJson = await this._storage?.get('repuestoList');
  
  if (repuestosJson) {
    const repuestos: Repuesto[] = JSON.parse(repuestosJson);
    // Filtra y devuelve todos los equipos con el mismo TSTR_CODIGO_INTERNO
    return repuestos.filter(r => r.TSTR_CODIGO_INTERNO == codigoInterno);
  }
  return []; // Si no hay repuestos o no se encuentra el TSTR_CODIGO_INTERNO, devuelve una lista vacía
}


public async replaceRespuestosByCodigoInterno(codigoInterno: number, nuevosRepuestos: Repuesto[]): Promise<void> {
  await this.storageReady;

  // Obtiene la lista actual de repuestos
  const repuestosJson = await this._storage?.get('repuestoList');
  let repuestos: Repuesto[] = repuestosJson ? JSON.parse(repuestosJson) : [];

  // Filtra fuera los equipos con el TSTR_CODIGO_INTERNO que vamos a reemplazar
  repuestos = repuestos.filter(r => r.TSTR_CODIGO_INTERNO !== codigoInterno);

  // Agrega los nuevos equipos al array filtrado
  repuestos = repuestos.concat(nuevosRepuestos);

  // Guarda la nueva lista de REPUESTO
  await this._storage?.set('repuestoList', JSON.stringify(repuestos));
}



// Obtiene los detalles de equipos guardados localmente
async getPendingRepuestoDetails(): Promise<{ [codRepuesto: number]: Repuesto[] }> {
  await this.storageReady;
  return await this._storage?.get(this.repuestoDetailsKey) || {};
}


// Método para actualizar o añadir detalles de equipo para un TSTE_CODIGO_INTERNO específico
public async upsertPendingRepuestoDetails(codRepuesto: number, repuestoDetails: Repuesto[]): Promise<void> {
  await this.storageReady;

  // Obtener los detalles de repuesto actuales
  let allRepuestoDetails = await this.getPendingRepuestoDetails();

  // Reemplazar los detalles existentes para el codRepuesto con los nuevos detalles
  allRepuestoDetails[codRepuesto] = repuestoDetails;

  // Guardar los detalles de REPUESTO actualizados en el almacenamiento
  await this._storage?.set(this.repuestoDetailsKey, allRepuestoDetails);
}

// Método para eliminar los detalles de repuesto asociados con un TSTR_CODIGO_INTERNO específico
public async removePendingRepuestoDetails(codRepuesto: number): Promise<void> {
  await this.storageReady;

  // Obtener los detalles de repuesto actuales
  let allRepuestoDetails = await this.getPendingRepuestoDetails();

  // Verificar si existe el TSTR_CODIGO_INTERNO en los detalles de repuesto actuales
  if(allRepuestoDetails.hasOwnProperty(codRepuesto)) {
    // Eliminar los detalles de repuesto para el codEquipo
    delete allRepuestoDetails[codRepuesto];

    // Guardar los detalles de repuesto actualizados en el almacenamiento
    await this._storage?.set(this.repuestoDetailsKey, allRepuestoDetails);
  } else {
    console.log(`No se encontraron detalles de repuesto para el código ${codRepuesto}`);
  }
}



/////////////////////////////////DETALLE HORARIOS ///////////////////////////
// Guarda la lista completa de horarios
public async setHorarioList(horarios: Horario[]): Promise<void> {
  await this.storageReady;
  await this._storage?.set('horarioList', JSON.stringify(horarios));
}

// Elimina la lista completa de horarios
public async removeHorariosList(): Promise<void> {
  await this.storageReady;
  await this._storage?.remove('horarioList');
}

// Elimina la lista completa de horarios
public async updateHorariosList(horario_nuevo: Horario): Promise<void> {
  await this.storageReady;

  const horariosJson = await this._storage?.get('horarioList');
  const horarios: Horario[] = JSON.parse(horariosJson);

  horarios.push(horario_nuevo);
  await this._storage?.set('horarioList', JSON.stringify(horarios));
}

 // Obtiene todos los DETALLE que coinciden con un TSTH_CODIGO_INTERNO específico
 public async getHorariosByCodigoInterno(codigoInterno: number): Promise<Horario[]> {
  await this.storageReady;
  const horariosJson = await this._storage?.get('horarioList');
  
  if (horariosJson) {
    const horarios: Horario[] = JSON.parse(horariosJson);
    // Filtra y devuelve todos los horarios con el mismo TSTH_CODIGO_INTERNO
    return horarios.filter(h => h.TSTH_CODIGO_INTERNO == codigoInterno);
  }
  return []; // Si no hay horarios o no se encuentra el TSTH_CODIGO_INTERNO, devuelve una lista vacía
}


// Método para actualizar o añadir un horario pendiente
public async insertPendingHorario(newHorario: Horario): Promise<void> {
  await this.storageReady;

  // Obtener la lista actual de horarios pendientes
  let pendingHorarios = await this.getPendingHorarios();

  pendingHorarios.push(newHorario);

  // Guardar la lista actualizada de horarios pendientes
  await this._storage?.set(this.horarioDetailsKey, JSON.stringify(pendingHorarios));
}

// Método para obtener los horarios pendientes
public async getPendingHorarios(): Promise<Horario[]> {
  await this.storageReady; // Asegurarse de que el almacenamiento esté listo

  try {
    const pendingHorariosJson = await this._storage?.get(this.horarioDetailsKey);
    // Si hay datos, intenta analizarlos. Si no, o si hay un error, retorna un array vacío.
    return pendingHorariosJson ? JSON.parse(pendingHorariosJson) : [];
  } catch (error) {
    console.log('No hay horarios pendientes:');
    return []; // Retorna un array vacío en caso de error
  }
}

// Elimina un horario de la lista de horarios pendientes
async removeHorarioFromPending(horario: Horario): Promise<void> {
  await this.storageReady;
  let pendingHorarios = await this.getPendingHorarios();
  pendingHorarios = pendingHorarios.filter(h => h.TSTH_HORA_INGRESO !== horario.TSTH_HORA_INGRESO); 
  await this.storage.set(this.horarioDetailsKey, pendingHorarios);
}

// Elimina un horario de la lista de horarios pendientes
async removeAllHorarioFromPending(): Promise<void> {
  await this.storageReady;
  await this.storage.set(this.horarioDetailsKey, []);
}
  
////////////////////////////////CONTROL DE HORARIOS///////////////
public async setHorarioIniciado(horario: Horario): Promise<void> {
  await this.storageReady;
  const clave = `horarioIniciado_${horario.TSTH_CODIGO_INTERNO}`;
  await this._storage?.set(clave, JSON.stringify(horario));
}

public async getHorarioIniciado(codigoInterno: number): Promise<Horario | null> {
  await this.storageReady;
  const clave = `horarioIniciado_${codigoInterno}`;
  const val = await this._storage?.get(clave);
  return val ? JSON.parse(val) : null;
}

//Ver si existe un horario iniciado
public async existeHorarioIniciado(codigoInterno: number): Promise<boolean> {
  await this.storageReady;
  const clave = `horarioIniciado_${codigoInterno}`;
  const val = await this._storage?.get(clave);
  return val !== null;
}

public async removeHorarioIniciado(key: string): Promise<void> {
  await this.storageReady;
  await this._storage?.remove(key);
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


//METODO PARA VERIFICAR SI EXISTE ALGO PENDIENTE
public async isEverythingProcessed(): Promise<boolean> {
  // Esperar a que el almacenamiento esté listo
  await this.storageReady;

  try {
    // Llamar a cada método y verificar si devuelve datos pendientes
    const pendingHorarios = await this.getPendingHorarios();
    if (pendingHorarios.length > 0) return false;

    const pendingRepuestoDetails = await this.getPendingRepuestoDetails();
    if (Object.keys(pendingRepuestoDetails).length > 0) return false;

    const pendingEquipmentDetails = await this.getPendingEquipmentDetails();
    if (Object.keys(pendingEquipmentDetails).length > 0) return false;

    const pendingWorkDetails = await this.getPendingWorkDetails();
    if (Object.keys(pendingWorkDetails).length > 0) return false;

    const pendingOrders = await this.getPendingOrders();
    if (pendingOrders.length > 0) return false;

    const pendingfirmas = await this.getPendingFirmas();
    if (pendingfirmas.length > 0) return false;

    // Si todos los métodos anteriores no devuelven datos, entonces no hay nada pendiente
    return true;
  } catch (error) {
    console.error('Error al verificar los datos pendientes:', error);
    // En caso de error, podrías decidir devolver false o manejarlo de otra manera
    return false;
  }
}


// Método para guardar una firma pendiente con detalles
public async savePendingFirma(firmaConDetalles: { firma: string, tstLlave: number | null }): Promise<void> {
  await this.storageReady;

  // Obtener las firmas actuales
  let pendingFirmas = await this.getPendingFirmas();

  pendingFirmas.push(firmaConDetalles);

  // Guardar la lista actualizada de firmas pendientes
  await this._storage?.set('pendingFirmasKey', JSON.stringify(pendingFirmas));
}

// Método para obtener las firmas pendientes
public async getPendingFirmas(): Promise<{ firma: string, tstLlave: number | null }[]> {
  await this.storageReady; // Asegurarse de que el almacenamiento esté listo

  try {
    const pendingFirmasJson = await this._storage?.get('pendingFirmasKey');
    return pendingFirmasJson ? JSON.parse(pendingFirmasJson) : [];
  } catch (error) {
    console.log('Error al obtener firmas pendientes:', error);
    return []; // Retorna un array vacío en caso de error
  }
}

// Método para eliminar una firma pendiente basada en TST_LLAVE
public async removePendingFirma(tstLlave: number): Promise<void> {
  await this.storageReady;

  // Obtener las firmas actuales
  let pendingFirmas = await this.getPendingFirmas();

  // Filtrar las firmas para eliminar la que coincide con el TST_LLAVE dado
  pendingFirmas = pendingFirmas.filter(firma => firma.tstLlave !== tstLlave);

  // Guardar la lista actualizada de firmas pendientes
  await this._storage?.set('pendingFirmasKey', JSON.stringify(pendingFirmas));
}



}


