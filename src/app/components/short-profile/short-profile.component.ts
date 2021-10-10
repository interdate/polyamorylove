import {Component, Input, OnInit} from '@angular/core';
import {ApiQuery} from '../../api.service';
import {NavigationExtras} from '@angular/router';
import {Events} from '@ionic/angular';
import {ShortUser} from "../../../interfaces/short-user";

@Component({
  selector: 'app-short-profile',
  templateUrl: './short-profile.component.html',
  styleUrls: ['./short-profile.component.scss'],
})
export class ShortProfileComponent implements OnInit {

    @Input() user: ShortUser;
    @Input() params;
    @Input() texts;

  constructor(
      public api: ApiQuery,
      private events: Events,
  ) { }

  ngOnInit() {
  }

  itemTapped(user: ShortUser) {
    user.url = user.photo;
    const navigationExtras: NavigationExtras = {
      queryParams: {
        data: JSON.stringify({
          user
        })
      }
    };
    this.api.route.navigate(['/profile'], navigationExtras);
  }

  toDialog(user) {
    this.api.data['user'] = user;
    this.api.route.navigate(['/dialog']);
  }

  addLike(user) {

    if (!user.isAddLike) {

      user.isAddLike = true;
      this.api.toastCreate('You liked ' + user.username + "'s pic", 2500);

      const params = JSON.stringify({
        toUser: user.id,
      });

      this.api.http.post(this.api.apiUrl + '/likes/' + user.id, params, this.api.setHeaders(true)).subscribe(data => {
      }, err => {});
    }
  }

  block(user, bool) {
    let params;

    if (!user.isAddBlackListed && (bool)) {

      user.isAddBlackListed = true;

      params = {
        list: 'Favorite',
        action: 'delete'
      };

    } else if (user.isAddBlackListed && !bool) {

      user.isAddBlackListed = false;

      params = {
        list: 'BlackList',
        action: 'delete'
      };
    }


    // Remove user from list
    user.hide = true;

    this.events.publish('statistics:updated');


    this.api.http.post(this.api.apiUrl + '/lists/' + user.id, params, this.api.setHeaders(true)).subscribe((data: any) => {
      // this.loader = true;
      this.api.toastCreate(data.success, 2500);
      console.log('in there');
      if (data.users.length >= 9) {
        // this.loader = false;
      }
      // alert('page = 1 | 2');
      this.params.page = 1;
    });
  }

  addFavorites(user) {

    const params = {
      list: 'Favorite',
      action: ''
    };

    if (!user.isAddFavorite) {
      user.isAddFavorite = true;
    } else {

      user.isAddFavorite = false;
      params.action = 'delete';

    }

    if (this.params.list === 'favorited') {
      user.hide = true;
    }

    this.api.http.post(this.api.apiUrl + '/lists/' + user.id, params, this.api.setHeaders(true)).subscribe((data: any) => {
      this.api.toastCreate(data.success, 2500);
      this.events.publish('statistics:updated');
    });

  }
}
