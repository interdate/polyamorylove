import {Component, OnInit} from '@angular/core';

import {ApiQuery} from '../api.service';

import {Router} from "@angular/router";
import {AlertController, Events} from "@ionic/angular";


/*
 Generated class for the Inbox page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['inbox.page.scss']
})
export class InboxPage {

  users: Array<{ id: string,
      message: string,
      username: string,
      newMessagesNumber: string,
      faceWebPath: string,
      noPhoto: string,
      photo: string,
      contactIsPaying: boolean,
      date: string
  }>;
  texts: { no_results: string };
  interval: any;
  constructor(public router: Router,
              public alertCtrl: AlertController,
              public api: ApiQuery,
              public events: Events) {
              // this.api.storage.get('user_data').then((val) => {
              //     if (val) {
              //         this.api.setHeaders(true, val.username, val.password);
              //     }
              // });
  }

    ionViewWillEnter() {
        this.api.pageName = 'InboxPage';
        if (!this.api.back) {
            this.api.showLoad();
        } else {
            this.api.back = true;
        }
        this.getDialogs();
      //  this.interval = setInterval(() => this.getDialogs(), 10000)
        this.events.subscribe('messages:new', (data) => {
           // alert(1);
           this.getDialogs();
            // this.users = data.messages;
        });

    }

    ionViewWillLeave() {
        this.events.unsubscribe('messages:new');
    }

    getDialogs() {
      this.api.http.get(this.api.apiUrl + '/inbox', this.api.setHeaders(true)).subscribe((data:any) => {
        console.log(data);
        this.users = data.dialogs;
        this.texts = data.texts;
        this.api.hideLoad();
      }, err => this.api.hideLoad());

    }

    // checkDialogs() {
    //     this.api.http.get(this.api.apiUrl + '/inbox', this.api.setHeaders(true)).subscribe((data:any) => {
    //         if (data.dialogs.length != this.users.length) {
    //             this.users = data.dialogs;
    //         } else {
    //             for(let x = 0; x < data.dialogs.length; x++) {
    //                 if(this.users[x].message != data[x].message ) {
    //                     this.users[x]. message = data[x].message;
    //                 }
    //             }
    //         }
    //     });
    // }


  toDialogPage(user) {
    this.api.data['user'] = user;
    this.router.navigate(['/dialog']);
  }

  deleteDialog(dialog, index) {
      console.log(dialog);
      this.alertCtrl.create({
          header: 'מחיקת שיחה עם ' + dialog.username,
          message: ' ?למחוק את השיחה',
          buttons: [
              {
                  text: 'כן',
                  handler: () => {
                      this.api.storage.get('user_data').then(user_data => {
                          if (user_data) {
                              let data = {
                                  user_id: user_data.user_id,
                                  contact_id: dialog.id
                              };
                              this.api.showLoad();
                              this.api.http.post(this.api.apiUrl + '/deletes/inboxes.json', data, this.api.header).subscribe((data:any) => {
                                  if (data.deleted) {
                                      this.users.splice(index, 1);
                                      this.ionViewWillEnter();
                                      console.log(this.users);
                                      this.api.hideLoad();
                                  } else {
                                      this.api.hideLoad();
                                  }
                              });
                          }

                      }), err => this.api.hideLoad();
                  }
              },
              {
                  text: 'לא',
                  role: 'cancel',
                 // handler: () => {}
              }
          ]
      }).then( alert => alert.present() );
  }


}
