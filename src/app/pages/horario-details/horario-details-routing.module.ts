import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HorarioDetailsPage } from './horario-details.page';

const routes: Routes = [
  {
    path: '',
    component: HorarioDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HorarioDetailsPageRoutingModule {}
