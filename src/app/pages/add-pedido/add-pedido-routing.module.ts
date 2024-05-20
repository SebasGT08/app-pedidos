import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddPedidoPage } from './add-pedido.page';

const routes: Routes = [
  {
    path: '',
    component: AddPedidoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddPedidoPageRoutingModule {}
