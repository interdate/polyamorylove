import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowPhotoPage } from './show-photo.page';

const routes: Routes = [
  {
    path: '',
    component: ShowPhotoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowPhotoPageRoutingModule {}
