import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddPedidoPageRoutingModule } from './add-pedido-routing.module';

import { AddPedidoPage } from './add-pedido.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddPedidoPageRoutingModule
  ],
  declarations: [AddPedidoPage]
})
export class AddPedidoPageModule {}
