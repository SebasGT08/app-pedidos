import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkDetailsPageRoutingModule } from './work-details-routing.module';

import { WorkDetailsPage } from './work-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkDetailsPageRoutingModule
  ],
  declarations: [WorkDetailsPage]
})
export class WorkDetailsPageModule {}
