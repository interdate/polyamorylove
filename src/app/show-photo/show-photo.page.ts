import { Component, OnInit } from '@angular/core';
import {ApiQuery} from "../api.service";
import {NavigationExtras, Router} from '@angular/router';

@Component({
  selector: 'app-show-photo',
  templateUrl: './show-photo.page.html',
  styleUrls: ['./show-photo.page.scss'],
})
export class ShowPhotoPage implements OnInit {

  data: any;
  constructor(
      public api: ApiQuery,
      public router: Router,
  ) { }

  ngOnInit() {
    this.api.http.get(this.api.apiUrl + '/show/photo', this.api.header).subscribe(data => {
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
  //   this.api.http.post(this.api.apiUrl + '/', params, this.api.header).subscribe((data: any) => {
  //     //
  //   });
  // }

  updateStatus(allow, request) {

    request.isAllow = allow;
    request.isCancel = !allow;
    const contactId = request.ownerId;
    const params = {
      isAllow: allow,
      id: request.id
    };
    this.api.http.post(this.api.apiUrl + '/shows/photos', params, this.api.header).subscribe( (res: any) => {
      //
      if ( allow && res.success && res.isNotificated === false) {
        const params2 = {
          quickMessage: 9999
        };

        this.api.http.post(this.api.apiUrl + '/sends/' + contactId + '/messages', params2, this.api.setHeaders(true))
            .subscribe((data: any) => {
              // if (data.success) {
              //
              // }
            });
      }


  });
}

goToProfile(clickedUser) {
   // console.log(clickedUser);
    const navigationExtras: NavigationExtras = {
    queryParams: {
      data: JSON.stringify({
        user: clickedUser
      })
    }
  };

  this.router.navigate(['/profile'], navigationExtras);
}

  ionViewWillEnter() {
      this.api.pageName = 'ShowPhotoPage';
  }

}
