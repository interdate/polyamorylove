import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessengerNotificationsPage } from './messenger-notifications.page';

const routes: Routes = [
  {
    path: '',
    component: MessengerNotificationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessengerNotificationsPageRoutingModule {}
