import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NearmeUsersPageRoutingModule } from './nearme-users-routing.module';

import { NearmeUsersPage } from './nearme-users.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NearmeUsersPageRoutingModule
  ],
  declarations: [NearmeUsersPage]
})
export class NearmeUsersPageModule {}
