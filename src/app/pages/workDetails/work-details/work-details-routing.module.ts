import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkDetailsPage } from './work-details.page';

const routes: Routes = [
  {
    path: '',
    component: WorkDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkDetailsPageRoutingModule {}
