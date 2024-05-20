import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectClientPageRoutingModule } from './select-client-routing.module';

import { SelectClientPage } from './select-client.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectClientPageRoutingModule
  ],
  declarations: [SelectClientPage]
})
export class SelectClientPageModule {}
