import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectProductPage } from './select-product.page';

const routes: Routes = [
  {
    path: '',
    component: SelectProductPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectProductPageRoutingModule {}
