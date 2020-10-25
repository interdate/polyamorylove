import {Component, OnInit} from '@angular/core';
import { ApiQuery } from '../api.service';
import {Router} from '@angular/router';
import {forEach} from "@angular-devkit/schematics";

/*
 Generated class for the Notifications page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.page.html',
  styleUrls: ['notifications.page.scss']
})
export class NotificationsPage implements OnInit{
  like: string = 'like';
  tabs: string = this.like;
  bingo: string = 'bingo';
  users: Array<{ id: string, date: string, username: string, is_read: string, photo: string, text: string, region_name: string, image: string, about: {}, component: any}>;
  texts: any;
  constructor(public router: Router,
              public api: ApiQuery) {}

  ngOnInit() {
    this.api.http.post(this.api.apiUrl + '/notifications.json', {}, this.api.setHeaders(true)).subscribe((data: any) => {
      this.users = data.users;
      this.texts = data.texts;
      console.log('Features: ', data);
    }, err => {
      console.log('Oops!');
    });
  }

  toDialog(user) {
    let user_id = user.user_id;
    let bingo = user.bingo;
   this.api.http.post(this.api.apiUrl + '/notifications.json', {id: user.id}, this.api.setHeaders(true)).subscribe((data: any) => {

      this.users = data.users;

      if( bingo ) {
        this.api.data['user'] = {'id': user_id};
        this.router.navigate(['/dialog']);
      } else {
        this.api.data['user'] = user_id;
        this.router.navigate(['/arena']);
      }
    },err => {
      console.log('Oops!');
    });

  }

  readAll() {
    alert(1);
    this.api.http.get(this.api.apiUrl + '/read/all/notification?bingo=' + (this.tabs === 'bingo' ? 1 : 0), this.api.header).subscribe((res: any) => {
        // if (res.success) {
            this.users.forEach( (user: any) => {
                console.log(user);
                if ( (user.bingo && this.tabs === 'bingo') || (!user.bingo && this.tabs === 'like')) {
                    user.isRead = true;
                }
            } );
        // }
    });
  }

  ionViewWillEnter() {
      this.api.pageName = 'NotificationsPage';
  }


}
