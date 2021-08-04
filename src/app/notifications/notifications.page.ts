import {Component, OnInit} from '@angular/core';
import { ApiQuery } from '../api.service';
import {Router} from '@angular/router';

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
    }, err => {
      console.log('Oops!');
    });
  }

  toDialog(user) {
    const user_id = user.user_id;
    const bingo = user.bingo;
   this.api.http.post(this.api.apiUrl + '/notifications.json', {id: user.id}, this.api.setHeaders(true)).subscribe((data: any) => {

      this.users = data.users;

      if( bingo ) {
        this.api.data['user'] = {'id': user_id};
        this.router.navigate(['/dialog']).then();
      } else {
        this.api.data['user'] = user_id;
        this.router.navigate(['/arena']).then();
      }
    },err => {
      console.log('Oops!'+ err);
    });

  }

  readAll() {
    this.api.http.get(this.api.apiUrl + '/read/all/notification?bingo=' + (this.tabs === 'bingo' ? 1 : 0), this.api.header).subscribe((res: any) => {
            this.users.forEach( (user: any) => {
                if ( (user.bingo && this.tabs === 'bingo') || (!user.bingo && this.tabs === 'like')) {
                    user.isRead = true;
                }
            } );
    });
  }

  ionViewWillEnter() {
      this.api.pageName = 'NotificationsPage';
  }

}
