import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewUsersPageRoutingModule } from './new-users-routing.module';

import { NewUsersPage } from './new-users.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewUsersPageRoutingModule
  ],
  declarations: [NewUsersPage]
})
export class NewUsersPageModule {}
