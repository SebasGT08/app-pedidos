import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HorarioDetailsPageRoutingModule } from './horario-details-routing.module';

import { HorarioDetailsPage } from './horario-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HorarioDetailsPageRoutingModule
  ],
  declarations: [HorarioDetailsPage]
})
export class HorarioDetailsPageModule {}
