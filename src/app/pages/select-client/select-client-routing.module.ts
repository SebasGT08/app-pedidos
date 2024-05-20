import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectClientPage } from './select-client.page';

const routes: Routes = [
  {
    path: '',
    component: SelectClientPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectClientPageRoutingModule {}
