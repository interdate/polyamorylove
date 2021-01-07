import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OnlineUsersPageRoutingModule } from './online-users-routing.module';

import { OnlineUsersPage } from './online-users.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OnlineUsersPageRoutingModule
  ],
  declarations: [OnlineUsersPage]
})
export class OnlineUsersPageModule {}
