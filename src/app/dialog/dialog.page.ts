import {Component, ViewChild, OnInit} from '@angular/core';
import {AlertController, Events, IonContent} from '@ionic/angular';
import {ApiQuery} from '../api.service';
import {Router, NavigationExtras} from '@angular/router';
import * as $ from 'jquery';

import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'page-dialog',
  templateUrl: 'dialog.page.html',
  styleUrls: ['dialog.page.scss']
})

export class DialogPage implements OnInit{
  @ViewChild(IonContent, {static: false}) content: IonContent;

  user: any = {};
  users: Array<{ id: string, isOnline: string, nick_name: string, image: string }>;
  texts: any = {a_conversation_with: '', title: '', photo: ''};
  message: any;
  messages: any = [];
  checkChat: any;
  notReadMessage: any = [];
  deleteMyMess: boolean;
  page: any = 1;
  addMoreMessages: any;
  messData: any;
  allowedToReadMessage: any;
  showUl: any = false;
  quickMessages: [];
  checkedQm: number;
  cantWrite = false;
  contactWasChecked = false;
  constructor(public api: ApiQuery,
              public router: Router,
              public changeRef: ChangeDetectorRef,
              public events: Events,
              public alertCtrl: AlertController,
              ) {}


  ngOnInit() {
    this.api.back = false;
    this.user = this.api.data['user'];
    this.getMessages();
  }
    getMessages() {
      //alert(44);
      this.api.http.get(this.api.apiUrl + '/dialogs/' + this.user['id'] + '?per_page=30&page=' + this.page, this.api.setHeaders(true)).subscribe((data:any) => {
        //alert(1)
          $('.footerMenu').hide();
          console.log(data);
          this.user = data.dialog.contact;
          this.user.contactImage = data.contactImage;
          this.texts = data.texts;
          this.messages = data.history;
          this.allowedToReadMessage = true; // data.allowedToReadMessage;
          this.quickMessages = data.quickMessages;
          for (let i = 0; i < this.messages.length; i++) {
              if(this.messages[i].isRead == false) {
                  this.notReadMessage.push(this.messages[i].id);
                //alert(2)
              }
          }
        this.scrollToBottom(500, 0);
        this.addMoreMessages = this.messages.length < 30 ? false : true;
        console.log(this.addMoreMessages);
      }, err => {
          console.log("Oops!");
      });
  }

  scrollToBottom(t, s = 300) {
    ////alert(1);
       setTimeout( () => {
        console.log('will scroll');
          this.content.scrollToBottom(s);
         $('.messages').scrollTop(99999);
     }, t );
  }


  onOpenKeyboard() {
    this.checkIfCanWrite();
    this.scrollToBottom(100);
  }
  onCloseKeyboard() {

  }

  back() {
    $('.footerMenu').show();
    setTimeout(() => {
      $('.scroll-content, .fixed-content').css({'margin-bottom': '57px'});
    }, 500);

    this.api.onBack(true);
   }

  sendPush() {
    this.api.http.post(this.api.apiUrl + '/sends/' + this.user.id + '/pushes', {}, this.api.setHeaders(true)).subscribe(data => {});
  }

  ulToggle() {
    this.showUl = !this.showUl;
    if (!this.showUl) {
      this.checkedQm = 0;
    } else {
      this.checkIfCanWrite();
    }
  }

  sendQuickMessage() {
    // alert(1);
    // if (!this.cantWrite) {
    if (this.checkedQm > 0) {
      this.sendMessage(this.checkedQm);
      this.checkedQm = 0;
      this.showUl = false;
    }
      // }
  }

  sendMessage(quickMessage = 0) {
    if (this.message || quickMessage > 0) {
      const params: any = {
        message: this.message,
      };
      if (quickMessage > 0) {
        params.quickMessage = quickMessage;
      }
      this.messData = {
        message: {
          username: this.api.username,
          text: this.message,
          delivered: false,
          messPoss: this.messages.length ? this.messages.length : 0
        }
      };
      console.log(this.messData);
      this.messages.push(this.messData.message);
      this.message = '';

      this.api.http.post(this.api.apiUrl + '/sends/' + this.user.id + '/messages', params, this.api.setHeaders(true)).subscribe((data: any) => {
        if (data.message) {
          this.sendPush();
          console.log(data);
          data.message['delivered'] = true;
          this.messages[this.messData.message.messPoss] = data.message;
          this.allowedToReadMessage = true; // data.allowedToReadMessage;
          // alert()
          this.notReadMessage.push(data.message.id);
          this.scrollToBottom(150);
        } else {
          this.api.toastCreate(data.errorMessage);
          this.messages.splice(this.messData.message.messPoss, 1);
        }
      });
    }

  }

  moreMessages(event) {

  console.log('more users run');

  if (this.addMoreMessages) {
    this.page++;
    this.api.http.get(this.api.apiUrl + '/dialogs/' + this.user.id + '?per_page=30&page=' + this.page, this.api.setHeaders(true)).subscribe((data: any) => {
      console.log(data);
      // $('.messages').css('overflow', 'hidden');
      for (const message of data.history) {
        this.messages.unshift(message);
      }
      console.log(this.messages);
      this.addMoreMessages = data.history.length < 30 ? false : true;
    });
  }


  event.target.complete();

  }

  getNewMessages() {

    let myLastMess = this.notReadMessage.slice(-1)[0] ? this.notReadMessage.slice(-1)[0] : false;
    console.log('not read messages');
   // let messageData = JSON.stringify(this.notReadMessage);
    // var notReadMessageStr = '?messages=['+messagesIds+']';
    let messageData = '';
    for (let i = 0; i < this.notReadMessage.length; i++) {
      messageData +=  messageData == '' ? this.notReadMessage[i] : ', ' + this.notReadMessage[i];
    }

    console.log(this.notReadMessage);

   // this.api.http.get(this.api.apiUrl + '/chats/' + this.user.id + '/new/messages' + notReadMessageStr, this.api.setHeaders(true)).subscribe((data:any) => {
   // this.api.http.get(this.api.apiUrl + '/chats/' + this.user.id + '/new/messages?lastMess=' + myLastMess, this.api.setHeaders(true)).subscribe((data:any) => {
    this.api.http.get(this.api.apiUrl + '/chats/' + this.user.id + '/new/messages?notReadMess=' + messageData, this.api.setHeaders(true)).subscribe((data:any) => {

      if (data.lastIsRead) {
        let ids = [];
        ids.push(data.lastIsRead.map((vel) => {
          console.log(vel[0]);
          return vel.MessageId;
        }));

        this.messages.filter((obj) => {
          if (ids[0].includes(obj.id)) {
            obj.isRead = true;
            console.log(obj.isRead);
            this.notReadMessage.splice(this.notReadMessage.indexOf(obj.id), 1);

          }
        });

      }

    //  alert(0);
      if (data.newMessages && data.newMessages.length > 0) {
        // alert(1);
        let isRead = '';
        for (let message of data.newMessages) {
          isRead += message.id + ', ';
          if (this.allowedToReadMessage) {
            for (let y = this.messages.length - 1, x = 0; x < this.notReadMessage.length; x++, y--) {

              this.messages[y].isRead = true;
              console.log(this.messages);
            }
           // alert('notReadMessage will be empty');
            this.notReadMessage = [];
          }
          this.messages.push(message);
          // alert(300)
          this.scrollToBottom(300);

        }
       // if (this.allowedToReadMessage) {
         let params = JSON.stringify({
           messages_id: isRead
         });
        // alert(isRead);
         this.api.http.post(this.api.apiUrl + '/reads/' + this.user.id + '/messages', params, this.api.setHeaders(true)).subscribe((data: any) => {
           // alert(5);
         });
       // }
      }

    });

  }


  deleteMessage(message, index) {

    // this.api.showLoad();
   // console.log(message);
    this.api.storage.get('user_data').then(user_data => {

      if(user_data){
        //console.log('in if data');
         this.deleteMyMess = message.from == user_data.user_id ? true : false;
      }
    //  console.log(this.deleteMyMess);
      let data = {
        messageId: message.id,
        deleteFrom: this.deleteMyMess,
        userId: user_data.user_id,
        contactId: this.user.id
      };
      this.api.http.post(this.api.apiUrl + '/deletes/messages.json', data, this.api.header).subscribe(data => {
        if (data) {

          //console.log(index);
          this.messages.splice(index, 1);
          //console.log(this.messages);
          this.api.hideLoad();
        } else {
          this.api.hideLoad();
        }
      });
    });

  }

  readMessagesStatus() {
    if (this.notReadMessage.length > 0) {
      const params = JSON.stringify({
        messages: this.notReadMessage
      });

      this.api.http.post(this.api.apiUrl + '/checks/messages', params, this.api.setHeaders(true)).subscribe((data:any) => {

        for (let i = 0; i < this.messages.length; i++) {
          if (data.readMessages.indexOf(this.messages[i].id) !== '-1') {
          this.messages[i].isRead = 1;
          }
        }
        for (let e = 0; this.notReadMessage.length; e++) {
          if (data.readMessages.indexOf(this.notReadMessage[e]) !== '-1') {
          delete this.notReadMessage[e];
          }
        }
      });
    }
  }

  subscription() {
    this.router.navigate(['/subscription']);
  }

  ionViewWillLeave() {
    clearInterval(this.checkChat);
    this.events.unsubscribe('messages:new');
    $('.footerMenu').show();
    $(document).off();
  }

  toProfilePage() {
    // this.api.data['user'] = this.user;
    const navigationExtras: NavigationExtras = {
      queryParams: {
        data: JSON.stringify({
          user: this.user
        })
      }
    };
    this.router.navigate(['/profile'], navigationExtras);
  }

  ionViewWillEnter() {

    $(document).one('backbutton', () => {
      this.api.onBack(true);
    });

    this.api.pageName = 'DialogPage';
    $('.footerMenu').hide();
    this.scrollToBottom(400);
    const that = this;
    this.checkChat = setInterval(() => {
      that.getNewMessages();
    }, 10000);

    $('button').click(() => {
      $('textarea').val('');
    });

    this.events.subscribe( 'messages:new', (data: any) => {
      console.log(data.messages);
      if (data.messages[0] && data.messages[0].userId == this.user.id) {
        const date = new Date();
        console.log(date.getDate());
        let isRead = '';
        for (const message of data.messages) {
          isRead += isRead == '' ? message.id : ', ' + message.id;
          message.from = message.userId;
          message.dateTime = date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
          console.log(message);
          this.messages.push(message);
        }
        // alert(this.allowedToReadMessage ? 'y' : 'n')
        if (this.allowedToReadMessage) {
          const params = {
            messages_id: isRead,
          };
          this.api.http.post(this.api.apiUrl + '/reads/' + this.user.id + '/messages', params, this.api.setHeaders(true)).subscribe((data: any) => {
              //
            });
          }
      }


      this.scrollToBottom(300);
    });

  }

  useFreePointToReadMessage(message) {
    let index = this.api.functiontofindIndexByKeyValue(this.messages, 'id', message.id);
    this.api.http.get(this.api.apiUrl + '/chats/' + message.id + '/use/free/point/to/read/message.json', this.api.setHeaders(true)).subscribe((data:any) => {
      this.messages[index].text = data.messageText;
      //this.setMessagesAsRead([message.id]);
      if (!data.userHasFreePoints) {
        // Update page
        //this.messages = [];
        //this.getMessages();
        for (let i = 0; i < this.messages.length; i++) {
          this.messages[i].hasPoints = 0;
        };
      }
    });
  }

  checkIfCanWrite() {
    if (!this.contactWasChecked) {
      this.api.http.get(this.api.apiUrl + '/writes/' + this.user.id, this.api.header).subscribe((res: any) => {
        if (!res.canContact) {
          this.cantWrite = true;
          this.alertCtrl.create({
            header: res.message.messageHeader,
            message: res.message.messageText,
            buttons: [
              {
                text: res.message.btns.ok,
              }
            ]
          }).then(alert => alert.present());
        }
      });
      this.contactWasChecked = true;
    }
  }

  ionViewDidLoad() { }
}
