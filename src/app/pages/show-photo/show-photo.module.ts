import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowPhotoPageRoutingModule } from './show-photo-routing.module';

import { ShowPhotoPage } from './show-photo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowPhotoPageRoutingModule
  ],
  declarations: [ShowPhotoPage]
})
export class ShowPhotoPageModule {}
