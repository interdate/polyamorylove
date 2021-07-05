import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessengerNotificationsPageRoutingModule } from './messenger-notifications-routing.module';

import { MessengerNotificationsPage } from './messenger-notifications.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessengerNotificationsPageRoutingModule
  ],
  declarations: [MessengerNotificationsPage]
})
export class MessengerNotificationsPageModule {}
