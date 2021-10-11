import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OnlineUsersPage } from './online-users.page';

const routes: Routes = [
  {
    path: '',
    component: OnlineUsersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnlineUsersPageRoutingModule {}
