import { Component, OnInit } from '@angular/core';
import {ApiQuery} from "../api.service";

@Component({
  selector: 'app-show-photo',
  templateUrl: './show-photo.page.html',
  styleUrls: ['./show-photo.page.scss'],
})
export class ShowPhotoPage implements OnInit {

  data: any;
  constructor(
      public api: ApiQuery,
  ) { }

  ngOnInit() {
    this.api.http.get(this.api.url + '/api/v2/he/show/photo', this.api.header).subscribe(data => {
      this.data = data;
      console.log(data);
    });
  }

  // cancelRequest(request) {
  //   request.isCancel = true;
  //   request.isAllow = false;
  //   const params = {
  //     action: 'allow',
  //     id: request.id,
  //   };
  //   this.postShowPhoto(params);
  // }
  //
  // postShowPhoto(params) {
  //
  //   this.api.http.post(this.api.url + '/he/', params, this.api.header).subscribe((data: any) => {
  //     //
  //   });
  // }

  updateStatus(allow, request) {

    request.isAllow = allow;
    request.isCancel = !allow;

    const params = {
      isAllow: allow,
      id: request.id
    };
    this.api.http.post(this.api.url + '/api/v2/he/shows/photos', params, this.api.header).subscribe( () => {
      //
    });

  }

  ionViewWillEnter() {
      this.api.pageName = 'ShowPhotoPage';
  }

}
