import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NearmeUsersPage } from './nearme-users.page';

const routes: Routes = [
  {
    path: '',
    component: NearmeUsersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NearmeUsersPageRoutingModule {}
