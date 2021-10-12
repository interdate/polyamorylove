import {Component, OnInit, ViewChild} from '@angular/core';
import {ApiQuery} from '../../api.service';
import {ActivatedRoute, NavigationExtras} from "@angular/router";
import {IonContent} from '@ionic/angular';


@Component({
  selector: 'app-messenger-notifications',
  templateUrl: './messenger-notifications.page.html',
  styleUrls: ['./messenger-notifications.page.scss'],
})


export class MessengerNotificationsPage implements OnInit {

  @ViewChild(IonContent, {static: true}) content: IonContent;

  data: any;

  constructor(
      public api: ApiQuery,
      public activatedRoute: ActivatedRoute,
  ) { }

  notifications: any;

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((data) => {
      this.data = this.api.route.getCurrentNavigation().extras.state.notifications;
      this.notifications = this.data.notifications;
      console.log(this.notifications);
    });

    this.setAsRead();

    this.content.scrollToBottom().then(() => {});
  }

  openPage(notification) {
    if (notification.push) {
      const push = notification.push;

      if (push.type == 'linkOut') {
        window.open(push.webAppLink);
      } else {
        this.api.route.navigate([push.applink]);
      }
    } else {

    }
  }

  redirect(notification) {
    if (notification.notification) {
      console.log(notification.notification.fromUser);
      const navigationExtras: NavigationExtras = {
        queryParams: {
          data: JSON.stringify({
            user: {
              id: notification.notification.fromUser
            }
          })
        }
      };
      console.log(navigationExtras);
      this.api.route.navigate(['/profile'], navigationExtras);
    } else if (notification.push) {

      if (notification.push.type === 'linkIn') {
        this.api.route.navigate['/' + notification.push.appLink];
      } else {
        window.open(notification.push.webAppLink);
      }

    }
  }

  setAsRead() {
    this.api.http.post(this.api.apiUrl + '/messengers/notifications/reads', {}, this.api.header).subscribe(() => {
      //
    });
  }

  ionViewWillEnter() {
    this.api.pageName = 'MessengerNotifications';

  }

}
