import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockDetailPageRoutingModule } from './stock-detail-routing.module';

import { StockDetailPage } from './stock-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockDetailPageRoutingModule
  ],
  declarations: [StockDetailPage]
})
export class StockDetailPageModule {}
