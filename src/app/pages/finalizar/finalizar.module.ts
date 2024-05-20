import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinalizarPageRoutingModule } from './finalizar-routing.module';

import { FinalizarPage } from './finalizar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinalizarPageRoutingModule
  ],
  declarations: [FinalizarPage]
})
export class FinalizarPageModule {}
