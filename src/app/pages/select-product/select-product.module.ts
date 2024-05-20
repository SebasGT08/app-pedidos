import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectProductPageRoutingModule } from './select-product-routing.module';

import { SelectProductPage } from './select-product.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectProductPageRoutingModule
  ],
  declarations: [SelectProductPage]
})
export class SelectProductPageModule {}
