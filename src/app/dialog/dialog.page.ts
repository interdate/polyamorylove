import {Component, ViewChild, OnInit} from '@angular/core';
import {AlertController, Events, IonContent} from '@ionic/angular';
import {ApiQuery} from '../api.service';
import {Router, NavigationExtras} from '@angular/router';
import * as $ from 'jquery';

import { ChangeDetectorRef } from '@angular/core';
import {error, log} from "util";

declare var Peer;

@Component({
  selector: 'page-dialog',
  templateUrl: 'dialog.page.html',
  styleUrls: ['dialog.page.scss']
})

export class DialogPage implements OnInit {
  @ViewChild(IonContent, {static: false}) content: IonContent;

  user: any = {};
  users: Array<{ id: string, isOnline: string, nick_name: string, image: string }>;
  texts: any = {a_conversation_with: '', title: '', photo: ''};
  payment: any;
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
  cantWriteAlert: any;
  cantWriteMessage: any;
  canReadMessages: boolean;

  peerConnection: any;
  peerjs: any;
  peerConnectionApp: any;

  peerToUser: string;
  peerToUserApp: string;
  myPeer;
  // showTyping = true;
  // showTypingTimeout: any;

  constructor(public api: ApiQuery,
              public router: Router,
              public changeRef: ChangeDetectorRef,
              public events: Events,
              public alertCtrl: AlertController,
  ) {
  }


  ngOnInit() {
    this.api.back = false;
    this.user = this.api.data['user'];
    this.getMessages();
    this.checkIfCanWrite();
  }

  getMessages() {
    this.api.http.get(this.api.apiUrl + '/dialogs/' + this.user['id'] + '?per_page=30&page=' + this.page, this.api.setHeaders(true)).subscribe((data: any) => {
      $('.footerMenu').hide();
      this.user = data.dialog.contact;
      this.user.fullPhoto = data.fullPhoto;
      this.user.contactImage = data.contactImage;
      this.texts = data.texts;
      this.messages = data.history;
      this.quickMessages = data.quickMessages;
      this.allowedToReadMessage = data.allowedToReadMessage;
      this.payment = data.payment;

      for(let i = 0; i < this.messages.length; i++) {
        if (this.messages[i].isRead == false) {
          this.notReadMessage.push(this.messages[i].id);
        }
      }
      this.scrollToBottom(500, 0);
      this.addMoreMessages = this.messages.length < 30 ? false : true;
    }, err => {
      console.log("Oops!");
    });
    setTimeout(() => {
      console.log(this.messages);
    }, 8000);
  }

  scrollToBottom(t, s = 300) {
    const that = this;
    setTimeout(() => {
      that.content.scrollToBottom(s);
      $('.messages').scrollTop(99999);
    }, t);
  }

  onOpenKeyboard() {
    if (this.cantWrite) {
      this.showCantWriteAlert();
    } else {
      this.scrollToBottom(100);
    }
  }

  back() {
    $('.footerMenu').show();
    setTimeout(() => {
      $('.scroll-content, .fixed-content').css({'margin-bottom': '57px'});
    }, 500);

    this.api.onBack(true);
  }

  sendPush() {
    this.api.http.post(this.api.apiUrl + '/sends/' + this.user.id + '/pushes', {}, this.api.setHeaders(true)).subscribe(data => {
    });
  }

  ulToggle() {
    if (this.cantWrite) {
      this.showCantWriteAlert();
    } else {
      this.showUl = !this.showUl;
      if (!this.showUl) {
        this.checkedQm = 0;
      } else {
        this.checkIfCanWrite();
      }
    }
  }

  sendQuickMessage() {
    if (this.checkedQm > 0) {
      this.sendMessage(this.checkedQm);
      this.checkedQm = 0;
      this.showUl = false;
    }
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
          from: this.api.userId,
          username: this.api.username,
          text: this.message,
          delivered: false,
          messPoss: this.messages.length ? this.messages.length : 0,
        }
      };

      this.messages.push(this.messData.message);
      this.message = '';

      this.api.http.post(this.api.apiUrl + '/sends/' + this.user.id + '/messages', params, this.api.setHeaders(true)).subscribe((data: any) => {
        if (data.message) {
          data.message.action = 'new';
          data.message['delivered'] = true;
          this.messages[this.messData.message.messPoss] = data.message;
          this.allowedToReadMessage = data.allowedToReadMessage;
          this.notReadMessage.push(data.message.id);
          this.scrollToBottom(150);
          if (quickMessage > 0) {
            data.message.quickMessage = true;
          }

          this.helperSend(JSON.stringify(data.message));
          this.sendPush();
        } else {
          this.api.toastCreate(data.errorMessage);
          this.messages.splice(this.messData.message.messPoss, 1);
        }
      });
    }

  }

  moreMessages(event) {

    if (this.addMoreMessages) {
      this.page++;
      this.api.http.get(this.api.apiUrl + '/dialogs/' + this.user.id + '?per_page=30&page=' + this.page, this.api.setHeaders(true)).subscribe((data: any) => {
        for (const message of data.history) {
          this.messages.unshift(message);
        }
        this.addMoreMessages = data.history.length < 30 ? false : true;
      });
    }

    event.target.complete();

  }


  setMessageAsRead(messageId) {
    this.api.http.post(this.api.apiUrl + '/reads/' + this.user.id + '/messages', {messages_id: messageId}, this.api.setHeaders(true))
        .subscribe((data: any) => {
          // alert(5);
        });
  }


  deleteMessage(message, index) {

    this.api.storage.get('user_data').then(userData => {
      if (userData) {
        this.deleteMyMess = message.from == userData.user_id ? true : false;
      }
      let data = {
        messageId: message.id,
        deleteFrom: this.deleteMyMess,
        userId: userData.user_id,
        contactId: this.user.id
      };
      this.api.http.post(this.api.apiUrl + '/deletes/messages.json', data, this.api.header).subscribe(data => {
        if (data) {

          this.messages.splice(index, 1);
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

      this.api.http.post(this.api.apiUrl + '/checks/messages', params, this.api.setHeaders(true)).subscribe((data: any) => {

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


  ionViewWillLeave() {
    clearInterval(this.checkChat);
    this.api.peerjs[this.myPeer].disconnect();
    $('.footerMenu').show();
    $(document).off();
    this.peerConnectionApp.close();
  }

  toProfilePage() {
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

    $('button').click(() => {
      $('textarea').val('');
    });

    this.myPeer = 'polyApp' + this.api.userId + '_' + this.user.id;
    this.peerToUser = 'poly' + this.user.id + '_' + this.api.userId;
    this.peerToUserApp = 'polyApp' + this.user.id + '_' + this.api.userId;

    const that = this;
    setTimeout(() => {
      that.peerInit();
    }, 1000);

  }


  helperSend(message) {

    const that = this;
    if (that.peerConnectionApp != null && that.peerConnectionApp.send && typeof that.peerConnectionApp.send != 'undefined') {

      setTimeout(() => {
        console.log(that.peerConnectionApp);
        that.peerConnectionApp.send(message);
      }, 10);
    } else {
      setTimeout(() => {
        that.helperSend(message);
      });
    }
  }

  useFreePointToReadMessage(message) {
    const index = this.api.functiontofindIndexByKeyValue(this.messages, 'id', message.id);
    this.api.http.get(this.api.apiUrl + '/frees/points/tos/reads/messages/use?message_id=' + message.id, this.api.setHeaders(true))
        .subscribe((data: any) => {
          data = JSON.parse(data.content);
          message.allowedToRead = true;
          message.text = data.message.text;

          if (!data.userHasFreePoints) {
            for (let i = 0; i < this.messages.length; i++) {
              this.messages[i].hasPoints = 0;
            }
          }
        });
  }

  checkIfCanWrite() {
    if (!this.contactWasChecked) {
      this.api.http.get(this.api.apiUrl + '/writes/' + this.user.id, this.api.header).subscribe((res: any) => {
        if (!res.canContact) {
          this.cantWrite = true;
          this.cantWriteMessage = res.message;
          this.showCantWriteAlert();
        }
      });
      this.contactWasChecked = true;
    }
  }

  showCantWriteAlert() {
    this.alertCtrl.create({
      header: this.cantWriteMessage.messageHeader,
      message: this.cantWriteMessage.messageText,
      backdropDismiss: false,
      buttons: [
        {
          text: this.cantWriteMessage.btns.ok,
        }
      ]
    }).then(alert => alert.present());
  }


  ionViewDidLoad() {
  }

  peerInit() {
    console.log('this.api.peerjs[this.myPeer]', this.api.peerjs[this.myPeer]);
    this.api.peerjs[this.myPeer] = new Peer(this.myPeer, {
      host: 'peerjs.wee.co.il',
      port: 9000,
      secure: true,
      path: '/peerjs',
      debug: 2,
    });
    alert(2);
    this.tryConnect();
    this.api.peerjs[this.myPeer].on('open', (id) => {
      console.log('my open id: ', id);
    });
    this.api.peerjs[this.myPeer].on('connection', (connection => {
      console.log('receive conentin', connection);
      this.peerConnectionApp = connection;
      this.peerSubscribes();
    }));

  }

  peerSubscribes() {
    if (this.peerConnectionApp) {
      this.peerConnectionApp.on('data', data => {
        data = JSON.parse(data);
        console.log('data: ', data);
        if (data.action == 'new') {
          // this.showTyping = false;
          this.peerMessage(data);
        } else if (data.action == 'read') {
          for (const message of this.messages) {
            if (message.id == data.id) {
              message.isRead = true; break;
            }
          }
        }
        /*else if (data.action == 'typing') {
          this.showTyping = true;
          clearTimeout(this.showTypingTimeout);
          setTimeout(() => {
            this.showTyping = false;
          }, 3000);
        }*/
      });
    }
  }

  tryConnect() {
    console.log('in try connection');
    if (!this.peerConnectionApp) {
      console.log('in reconnect to ', this.peerToUserApp);
      this.peerConnectionApp = this.api.peerjs[this.myPeer].connect(this.peerToUserApp);
      setTimeout(() => {
        this.tryConnect();
      }, 2000);
    } else {
      this.peerSubscribes();
    }
  }

  peerMessage(message) {
    console.log(message);
    this.messages.push(message);
    this.scrollToBottom(300);
    this.setMessageAsRead(message.id);
    message.action = 'read';
    this.helperSend(JSON.stringify({id: message.id, action: 'read'}));

  }

  // sendTyping() {
  //   if (this.message.length > 0) {
  //     this.peerConnectionApp.send(JSON.stringify({
  //       action: 'typing',
  //     }));
  //   }
  // }

}
