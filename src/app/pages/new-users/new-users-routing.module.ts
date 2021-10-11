import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewUsersPage } from './new-users.page';

const routes: Routes = [
  {
    path: '',
    component: NewUsersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewUsersPageRoutingModule {}
