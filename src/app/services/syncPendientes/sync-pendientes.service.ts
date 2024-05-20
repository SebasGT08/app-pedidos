import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { concatMap, catchError, map } from 'rxjs/operators';
import { Order } from 'src/app/models/order.model';
import { ConnectivityService } from '../connectivity/connectivity.service';
import { OrderDetailService } from '../orderDetail/order-detail.service';
import { SyncService } from '../sync/sync.service';
import { WorkDetailService } from '../workDetail/work-detail.service';
import { EquipmentDetailService } from '../equipmentDetail/equipment-detail.service';
import { RepuestoDetailService } from '../repuestoDetail/repuesto-detail.service';
import { HorarioDetailService } from '../horarioDetail/horario-detail.service';
import { FirmaService } from '../firma/firma.service';


@Injectable({
  providedIn: 'root'
})
export class SyncPendientesService {

  constructor(
    private connectivityService: ConnectivityService,
    private orderDetailService: OrderDetailService,
    private workDetailService: WorkDetailService,
    private equipmentDetailService: EquipmentDetailService,
    private repuestoDetailService: RepuestoDetailService,
    private horarioDetailService: HorarioDetailService,
    private firmaService: FirmaService,
    private syncService: SyncService
  ) { }


  public async checkServerAndSync() {
    const isConnected = await this.connectivityService.checkServerStatus();
        if (isConnected) {

          this.orderDetailService.uploadPendingOrders();
          await this.workDetailService.uploadPendingWorkDetails();
          await this.equipmentDetailService.uploadPendingEquipmentDetails();
          await this.repuestoDetailService.uploadPendingRepuestoDetails();
          await this.horarioDetailService.uploadPendingHorarios();
          await this.firmaService.uploadPendingSignatures();

      }else{
        console.log('Sin conexion no se puede sincronizar pendientes.');
      }
      

  }

}
