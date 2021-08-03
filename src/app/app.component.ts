import {AfterViewInit, Component, NgZone, ViewChild} from '@angular/core';
import {
  Platform,
  AlertController,
  Events, IonRouterOutlet
} from '@ionic/angular';
import { StatusBar} from '@ionic-native/status-bar/ngx';
import {Push, PushOptions, PushObject} from '@ionic-native/push/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Market } from '@ionic-native/market/ngx';
import {ApiQuery} from './api.service';
import {MenuController} from '@ionic/angular';
import * as $ from 'jquery';
import {Router, NavigationEnd, NavigationExtras} from '@angular/router';
import {IonNav} from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import {IonContent} from '@ionic/angular';
import 'core-js/es7/reflect';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { LocalNotifications } from '@ionic-native/local-notifications/ngx';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  providers: [
      Keyboard,
  ],


})
export class AppComponent implements AfterViewInit {

  @ViewChild(IonNav, {static: false}) nav: IonNav;
  @ViewChild(IonRouterOutlet, {static: false}) routerOutlet: IonRouterOutlet;
  @ViewChild(IonContent, {static: false}) content: IonContent;


  banner: any;
  menu_items_logout: any;
  menu_items_login: any;
  menu_items: any;
  menu_items_settings: any;
  menu_items_contacts: any;
  menu_items_footer1: any;
  menu_items_footer2: any;

  deviceToken: any;
  activeMenu: string;
  username: any;
  back: string;

  is_login: any = false;
  new_message: any;
  message: any = {};
  avatar: string;
  stats: string;
  interval: any = true;
  social: any;
  alertPresent: boolean;

  newMessagesTimeout: any;

  canEnterNotActivatedUser = ['RegistrationPage', 'ChangePhotosPage', 'ActivationPage', 'ContactUsPage', 'PagePage'];
  canEnterWithoutLogin = ['PasswordRecoveryPage', 'RegistrationPage', 'PagePage', 'ContactUsPage'];

  constructor(public platform: Platform,
              public  menu: MenuController,
              public api: ApiQuery,
              public router: Router,
              private geolocation: Geolocation,
              public alertCtrl: AlertController,
              public events: Events,
              public statusBar: StatusBar,
              public splashScreen: SplashScreen,
              public push: Push,
              public keyboard: Keyboard,
              public market: Market,
              public ap: AndroidPermissions,
              public iap: InAppBrowser,
              private localNotifications: LocalNotifications,
              public zone: NgZone,
  ) {
    this.api.http.get(this.api.openUrl + '/menu', {}).subscribe((data: any) => {
      this.social = data.social;
      this.initMenuItems(data.menu);
    });
    this.keyboard.hide();
    this.closeMsg();
    this.initializeApp();
    this.menu1Active(false);

    this.api.storage.get('user_data').then((val) => {
      if (!val) {
        this.menu_items = this.menu_items_logout;
        this.router.navigate(['/login']).then();
      } else {
        this.api.setHeaders(true, val.username, val.password, true).then(() => {

          this.api.userId = val.user_id;
          this.initPushNotification();
          this.api.checkedPage = 'online';
          this.router.navigate(['/home']).then();
          this.menu_items = this.menu_items_login;
          this.api.setLocation();
          this.api.getThereForPopup()
        });
      }
    });

    this.events.subscribe('status:login', () => {
      this.initPushNotification();
    });

    this.events.subscribe('statistics:updated', () => {
      this.getStatistics();
    });

  }

  requestPermit() {
    this.ap.requestPermissions([this.ap.PERMISSION.CAMERA, this.ap.PERMISSION.RECORD_AUDIO]).then(
        () => {
          },
        err => {
          console.log(err);
          this.api.videoShow = false;
        }
    );
  }

  navigateHome() {
    this.api.checkedPage = 'online';
    this.menuCloseAll();
    this.api.back = false;
    const navigationExtras: NavigationExtras = {
      queryParams: {
        params: JSON.stringify({
          action: 'search',
          filter: 'new',
          page: '1'
        })
      }
    };
    this.menu.close().then();
    if(this.api.pageName == 'HomePage') {
      this.events.publish('logo:click');
    } else {
        this.router.navigate(['/home'], navigationExtras).then();

    }
  }




  initPushNotification() {
    if (!this.platform.is('cordova')) {
      return;
    }
    const options: PushOptions = {
      android: {
        senderID: '355072358993',
        clearNotifications: false,
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'false'
      },
      windows: {},
      browser: {
        pushServiceURL: 'http://push.api.phonegap.com/v1/push'
      }
    };
    const push2: PushObject = this.push.init(options);


    this.push.createChannel({
      id: 'PolyDate',
      importance: 5,
      sound: 'ding_dong',
      description: 'PolyAmoryLove notification',
      vibration: true,
      visibility: 1,
    });

    this.push.createChannel({
      id: 'polyArena',
      importance: 5,
      sound: 'ding_dong',
      description: 'Arena Notification',
      vibration: true,
      visibility: 1,
    });
    this.push.deleteChannel('PushPluginChannel').then();

    this.push.listChannels().then(() =>{});

    push2.on('registration').subscribe((data) => {
      this.api.storage.set('deviceToken', data.registrationId);
      this.api.sendPhoneId(data.registrationId);
    }, error => {
      console.log('registration push error ');
      console.log(error);
    });
    // }

    push2.on('notification').subscribe((data: any) => {
      const pushExtraData = data.additionalData;
      if (!pushExtraData.foreground) {
       this.pushHandler(data);
      } else if (!pushExtraData.onlyInBackgroundMode || pushExtraData.onlyInBackgroundMode == 'false') {
        this.localNotif(data);
      }
    });
  }

  pushHandler(data) {
    const pushExtraData = data.additionalData;
    if (pushExtraData.type == 'linkOut') {
      this.iap.create(pushExtraData.url);
    } else {

      this.api.storage.get('user_data').then((val) => {
        if (val) {
          this.api.setHeaders(true, val.username, val.password);
          if (pushExtraData.url == '/dialog') {
            this.api.data['user'] = {
              id: pushExtraData.userFrom
            };
            this.router.navigate(['/dialog']).then();
          } else {

            if (pushExtraData.bingoData) {
              this.api.data.data = pushExtraData.bingoData;
            }

            this.router.navigate([pushExtraData.url]).then();
          }
        } else {
          this.router.navigate(['/login']).then();
        }
      });
    }
  }

  closeMsg() {
    this.new_message = '';
  }

  localNotif(data) {
    this.localNotifications.schedule({
      id: 1,
      title: data.additionalData.titleMess,
      text: data.message,
      channel: 'PolyAmoryLove',
      data: { additionalData: data.additionalData }
    });
  }

  getStatistics() {
    this.api.http.get(this.api.apiUrl + '/statistics', this.api.setHeaders(true)).subscribe((data:any) => {
      const statistics = data.statistics;

      // First Sidebar Menu
      this.menu_items[3].count = statistics.newNotificationsNumber;
      this.menu_items[0].count = statistics.newMessagesNumber;
      this.menu_items[1].count = statistics.showPhoto;
      // // Contacts Sidebar Menu
      this.menu_items_contacts[0].count = statistics.viewed;
      this.menu_items_contacts[1].count = statistics.viewedMe;
      this.menu_items_contacts[2].count = statistics.connected;
      this.menu_items_contacts[3].count = statistics.connectedMe;
      this.menu_items_contacts[4].count = statistics.favorited;
      this.menu_items_contacts[5].count = statistics.favoritedMe;
      this.menu_items_contacts[6].count = statistics.blacklisted;
      //Footer Menu
      this.menu_items_footer2[2].count = statistics.newNotificationsNumber;
      this.menu_items_footer2[2].count = 0;
      this.menu_items_footer1[3].count = statistics.newMessagesNumber;
      this.menu_items_footer2[0].count = statistics.favorited;
      this.menu_items_footer2[1].count = statistics.favoritedMe;
      this.api.isPay = data.isPay;
      this.api.isMan = data.isMan;
      this.api.isActivated = data.isActivated;
      this.avatar = data.mainPhoto;

      if (!data.isActivated) {
        if (!this.canEnterNotActivatedUser.includes(this.api.pageName)) {
          // alert(1)
          this.router.navigate(['/activation']).then();
        }
      }
      this.bannerStatus();
    }, err => {
      console.log(err);
      if (err.status === 403) {
        this.clearLocalStorage();
      }
    });
  }


  bannerStatus() {
    if ((this.is_login && this.banner && this.banner.hideLogin.includes(this.api.pageName))
        || (!this.is_login && this.banner && this.banner.hideLogout.includes(this.api.pageName))) {
      $('.link-banner').hide();
    } else {
      $('.link-banner').show();
    }
  }


  clearLocalStorage() {
    this.api.setHeaders(false, null, null);
    // Removing data storage
    this.api.storage.remove('user_data');
    this.router.navigate(['/login']).then();
  }

  initMenuItems(menu) {
    this.back = menu.back;
    this.stats = menu.stats;
    this.menu_items_logout = [
      {_id: '', icon: 'log-in', title: menu.login, url: '/login', count: ''},
      {_id: 'blocked', icon: '', title: menu.forgot_password, url: '/password-recovery', count: ''},
      {_id: '', icon: 'mail', title: menu.contact_us, url: '/contact-us', count: ''},
      {_id: '', icon: 'person-add', title: menu.join_free, url: '/registration', count: ''},
    ];

    this.menu_items = [
      {_id: 'inbox', icon: '', title: menu.inbox, url: '/inbox', count: ''},
      {_id: 'showPhoto', icon: '', title: menu.show_photos, url: '/show-photo', count: ''},
      {_id: 'the_area', icon: '', title: menu.the_arena, url: '/arena', count: ''},
      {_id: 'notifications', icon: '', title: menu.notifications, url: '/notifications', count: ''},
      {_id: 'stats', icon: 'stats', title: menu.contacts, count: ''},
      {_id: '', icon: 'search', title: menu.search, url: '/search', count: ''},
      {_id: '', icon: 'information-circle', title: 'FAQ', url: '/faq', count: ''},
      {_id: '', icon: 'mail', title: menu.contact_us, url: '/contact-us', count: ''},
      {_id: 'subscription', icon: 'ribbon', title: menu.subscription, url: '/subscription', count: ''},
    ];

    this.menu_items_login = [
      {_id: 'inbox', icon: '', title: menu.inbox, url: '/inbox', count: ''},
      {_id: 'showPhoto', icon: '', title: menu.show_photos, url: '/show-photo', count: ''},
      {_id: 'the_area', icon: '', title: menu.the_arena, url: '/arena', count: ''},
      {_id: 'notifications', icon: '', title: menu.notifications, url: '/notifications', count: ''},
      {_id: 'stats', icon: 'stats', title: menu.contacts, count: ''},
      {_id: '', icon: 'search', title: menu.search, url: '/search', count: ''},
      {_id: '', icon: 'information-circle', title: 'FAQ', url: '/faq', count: ''},
      {_id: '', icon: 'mail', title: menu.contact_us, url: '/contact-us', count: ''},
      {_id: 'subscription', icon: 'ribbon', title: menu.subscription, url: '/subscription', count: ''},
    ];

    this.menu_items_settings = [
      {_id: 'edit_profile', icon: '', title: menu.edit_profile, url: '/edit-profile', count: ''},
      {_id: 'edit_photos', icon: '', title: menu.edit_photos, url: '/change-photos', count: ''},
      {_id: '', icon: 'person', title: menu.view_my_profile, url: '/profile', count: ''},
      {_id: 'change_password', icon: '', title: menu.change_password, url: '/change-password', count: ''},
      {_id: 'freeze_account', icon: '', title: menu.freeze_account, url: '/freeze-account', count: ''},
      {_id: 'settings', icon: 'cog', title: menu.settings, url: '/settings', count: ''},
      {_id: '', icon: 'mail', title: menu.contact_us, url: '/contact-us', count: ''},
      {_id: 'logout', icon: 'log-out', title: menu.log_out, url: '/login', count: ''}
    ];

    this.menu_items_contacts = [
      {_id: 'viewed', icon: '', title: menu.viewed, url: '/home', list: 'viewed', count: ''},
      {
        _id: 'viewed_me',
        icon: '',
        title: menu.viewed_me,
        url: '/home',
        list: 'viewed_me',
        count: ''
      },
      {
        _id: 'contacted',
        icon: '',
        title: menu.contacted,
        url: '/home',
        list: 'connected',
        count: ''
      },
      {
        _id: 'contacted_me',
        icon: '',
        title: menu.contacted_me,
        url: '/home',
        list: 'connected_me',
        count: ''
      },
      {
        _id: 'favorited',
        icon: '',
        title: menu.favorited,
        url: '/home',
        list: 'favorited',
        count: ''
      },
      {
        _id: 'favorited_me',
        icon: '',
        title: menu.favorited_me,
        url: '/home',
        list: 'favorite_me',
        count: ''
      },
      {_id: '', icon: 'lock', title: menu.blocked, url: '/home', list: 'black', count: ''}

    ];

    this.menu_items_footer1 = [
      {
        _id: 'online',
        src_img: '../assets/img/icons/online.png',
        icon: '',
        list: 'online',
        title: menu.online,
        url: '/home',
        count: ''
      },
      {
        _id: 'the_area',
        src_img: '../assets/img/icons/the-arena.png',
        icon: '',
        list: 'the_area',
        title: menu.the_arena,
        url: '/arena',
        count: ''
      },
      {
        _id: 'notifications',
        src_img: '../assets/img/icons/notifications_ft.png',
        list: '',
        icon: '',
        title: menu.notifications,
        url: '/notifications',
        count: ''
      },
      {
        _id: 'inbox',
        src_img: '../assets/img/icons/inbox.png',
        icon: '',
        list: '',
        title: menu.inbox,
        url: '/inbox',
        count: ''
      },
    ];

    this.menu_items_footer2 = [
      {
        _id: 'favorited',
        src_img: '../assets/img/icons/favorited.png',
        icon: '',
        list: 'favorited',
        title: menu.favorited,
        url: '/home',
        count: ''
      },
      {
        _id: 'favorited_me',
        src_img: '../assets/img/icons/favorited_me.png',
        icon: '',
        list: 'favorite_me',
        title: menu.favorited_me,
        url: '/home',
        count: ''
      },
      {
        _id: 'near-me',
        title: 'Near me',
        list: 'distance',
        icon: 'pin',
        url: '/home',
        count: ''
      },
      {_id: '', src_img: '', icon: 'search', title: menu.search, list: '', url: '/search', count: ''},
    ];
  }


  menu1Active(bool = true) {
    this.activeMenu = 'menu1';

    if (bool) {
      this.menu.enable(true, 'menu1').then();
      this.menu.open('menu1');
    } else {
      setTimeout( () => {
        this.menu.enable(true, 'menu1').then();
      });
    }
  }


  menu2Active() {

    this.menu.isOpen('menu1').then(() => {
      this.menu.enable(true, 'menu2').then();
      this.menu.open('menu2').then();
      this.activeMenu = 'menu2';
    });
  }


  menu3Active() {
    this.menu.isOpen('menu1').then(isOpen => {
      if (isOpen) {
        this.activeMenu = 'menu3';
        this.menu.enable(true, 'menu3').then();
        this.menu.open('menu3').then();
      }
    });
  }


  menuCloseAll() {
    if (this.activeMenu != 'menu1') {
      this.menu.toggle().then();
      this.activeMenu = 'menu1';
      this.menu.enable(false, 'menu2').then();
      this.menu.enable(false, 'menu3').then();
      this.menu.enable(true, 'menu1').then();
      this.menu.close().then();
      this.menu.toggle().then();
    }
  }


  initializeApp() {

    this.platform.ready().then(() => {
      this.getAppVersion();
      setTimeout(() => {
        this.getMessage();
      }, 3000);
      this.statusBar.show();
      this.ap.checkPermission(this.ap.PERMISSION.CAMERA).then(
          result => {
            if (result.hasPermission) {
              this.ap.checkPermission(this.ap.PERMISSION.RECORD_AUDIO).then(
                  result => {
                    if (result.hasPermission) {
                    } else {
                      this.requestPermit();
                    }
                  },
                  err => {
                    this.requestPermit();
                  }
              );
            } else {
              this.requestPermit();
            }
          },
          err => {
            this.requestPermit();
          }
      );

      this.localNotifications.on('click').subscribe((notification) => {
        this.pushHandler(notification.data);
      });
    });


  }



  swipeFooterMenu() {
    const moreBtn = $('.more-btn');
    if (moreBtn.hasClass('menu-left')) {

      moreBtn.removeClass('menu-left');
      $('.more-btn .right-arrow').show();
      $('.more-btn .left-arrow').hide();

      moreBtn.parents('.menu-one').animate({
        'margin-right': '-92%'
      }, 1000);

      setTimeout(() => {
        this.footerReturn();
      }, 30000);

    } else {
      this.footerReturn();
    }
  }

  footerReturn() {
    const moreBtn = $('.more-btn');

    moreBtn.addClass('menu-left');
    $('.more-btn .left-arrow').show();
    $('.more-btn .right-arrow').hide();
    moreBtn.parents('.menu-one').animate({
      'margin-right': '0'
    }, 1000);
  }

  removeBackground() {
    $('#menu3, #menu2').find('ion-backdrop').remove();
  }

  getBanner() {
    this.api.http.get(this.api.openUrl + '/banner?user_id=' + this.api.userId, this.api.header).subscribe((data: any) => {
      this.banner = data.banner;
    });
  }

  goTo() {
    this.api.http.get(this.api.openUrl + '/banner/click?id=' + this.banner.id, this.api.header).subscribe(() => {
      window.open(this.banner.link, '_blank');
    });
    return false;
  }

  openPage(page) {

    this.api.checkedPage = page._id;
    // alert(page._id);

    let params = '';
    let logout = false;
    if (page._id == 'logout') {
      // this.status = '';
      logout = true;
    }

    if (page._id == 'stats') {
      this.menu3Active();
    } else {
      // close the menu when clicking a link from the menu
      this.menu.close();


      // navigate to the new page if it is not the current page
      if (page.list == 'online') {
        params = JSON.stringify({
          action: 'online'
        });
      } else if (page.list == 'distance') {
        params = JSON.stringify({
          action: 'search',
          filter: page.list
        });
      } else {
        params = JSON.stringify({
          action: 'list',
          list: page.list
        });
      }

      if (this.menu.isOpen('menu1') || this.menu.isOpen('menu2') || this.menu.isOpen('menu3')) {

        const navigationExtras: NavigationExtras = {
          queryParams: {
            params: params,
            page: page,
            action: 'list',
            logout: logout
          }
        };

        if (this.api.pageName == 'HomePage' && (page._id == 'online' || page._id == 'near-me') ) {
          this.events.publish('footer:click', navigationExtras);
        } else {
          this.router.navigate([page.url], navigationExtras);
        }
      }
    }
  }

  getBingo(test = false) {
    const date = new Date();
    this.api.storage.get('bingoCheck').then( storageDate => {
    if (test || !storageDate || date.getDay() > storageDate.day || date.getMonth() > storageDate.month || date.getFullYear() > storageDate.year) {

        this.api.storage.get('user_data').then((val) => {
          if (val) {
            this.api.http.get(this.api.apiUrl + '/bingo', this.api.setHeaders(true)).subscribe((data: any) => {
              // this.api.storage.set('status', this.status);
              // this.avatar = data.texts.photo;
              if (data.user) {
                this.api.data['data'] = data;
                this.router.navigate(['/bingo']);
                this.api.http.get(this.api.apiUrl + '/bingo?likeMeId=' + data.user.id, this.api.setHeaders(true));
              }

              const dateArray = {
                day: date.getDay(),
                month: date.getMonth(),
                year: date.getFullYear(),
              };
              this.api.storage.set('bingoCheck', dateArray);
            });
          }
        });
      }
    });



  }

  dialogPage() {
    let user = {id: this.new_message.userId};
    this.closeMsg();
    this.api.data['user'] = user;
    this.router.navigate(['/dialog']).then();
  }

  getMessage() {
    if (this.api.username && this.api.username !== 'null' && this.api.username !== 'noname') {
      this.api.http.get(this.api.apiUrl + '/new/messages', this.api.setHeaders(true)).subscribe((data: any) => {
        const timeout = data.timeout;
        if ((this.new_message == '' || typeof this.new_message == 'undefined') && !(this.api.pageName == 'DialogPage')) {
          // alert(1);
          if(data.messages.length > 0) {
            this.new_message = data.messages[0];
          }
          if (typeof this.new_message == 'object') {
            this.api.http.get(this.api.apiUrl + '/messages/notify?message_id=' + this.new_message.id, this.api.setHeaders(true)).subscribe(data => {

            });

          }
        }
        if (this.menu_items[0].count < data.newMessagesNumber) {
          this.events.publish('messages:new', data);
        }
        // this.new_message = data;
        this.menu_items[3].count = data.newNotificationsNumber;
        this.menu_items[0].count = data.newMessagesNumber;
        this.menu_items_footer1[2].count = data.newNotificationsNumber;
        this.menu_items_footer1[3].count = data.newMessagesNumber;

      }, err => {
        if (err.status == 403) {
          this.clearLocalStorage();
        }
      });
    }

    clearTimeout(this.newMessagesTimeout);
    this.newMessagesTimeout = setTimeout( () => {
      this.getMessage();
    }, this.api.timeouts.newMessage);
  }

  checkStatus() {

  }

  async alert(title, subTitle) {
    const alert = await this.alertCtrl.create({
      header: title,
      subHeader: subTitle,
      buttons: ['Confirm']
    });
    await alert.present();
  }

  getAppVersion() {

    this.api.http.get(this.api.openUrl + '/version?version=' + this.api.version, this.api.header).subscribe((data: any) => {
    const that = this;

    this.api.timeouts = data.timeouts;

      if (data.needUpdate) {
        if (data.canLater) {
          this.alertCtrl.create({
            header: data.title,
            message: data.message,

            buttons: [
              {
                text: data.cancelText,
              },
              {
                text: data.updateText,
                handler: res => {
                  this.market.open('il.co.polydate');
                  that.getAppVersion();
                }
              }
            ]
          }).then(alert => alert.present());
        } else {
          this.alertCtrl.create({
            header: data.title,
            message: data.message,
            backdropDismiss: false,
            keyboardClose: false,
            buttons: [
              {
                text: data.updateText,
                handler: res => {
                  window.open(data.src);
                  this.alertPresent = false;
                  this.getAppVersion();
                }
              }
            ]
          }).then((alert) => {
            if (!this.alertPresent) {
              alert.present().then(() => this.alertPresent = true);
            }
            alert.onDidDismiss().then(() => this.alertPresent = false);
          });

        }
      }
      setTimeout(() => {
        this.getAppVersion();
      }, this.api.timeouts.getAppVersion);
    });

  }




  async callAlert(data) {
    if (this.api.callAlertShow == false && this.api.videoChat == null) {
      this.api.playAudio('wait');
      this.api.callAlertShow = true;
      const param = {
        id: data.calls.msgFromId,
        chatId: data.calls.msgId,
        alert: true,
        username: data.calls.nickName,
      };
      this.api.checkVideoStatus(param);
      this.alertCtrl.create({
        header: '<img class="alert-call" width="40" src="' + data.calls.img.url + '"> ' + data.calls.title,
        message: data.calls.title.message,
        buttons: [
          {
            text: data.calls.buttons[1],
            cssClass: 'redCall',
            role: 'cancel',
            handler: () => {
              this.api.stopAudio();
              this.api.callAlertShow = false;
              this.api.http.post(this.api.apiUrl + '/calls/' + param.id, {
                message: 'close',
                id: param.chatId
              }, this.api.setHeaders(true)).subscribe((data: any) => {

                if(this.api.callAlert !== null) {
                  this.api.callAlert.dismiss();
                  this.api.callAlert = null;
                }

              });
            }
          },
          {
            text: data.calls.buttons[0],
            cssClass: 'greenCall',
            handler: () => {
              if (this.api.callAlert !== null) {
                this.api.callAlert.dismiss();
                this.api.callAlert = null;
              }
              this.api.callAlertShow = false;

              this.api.openVideoChat(param);
            }
          }
        ]
      }).then(alert => this.api.callAlert = alert);


      await this.api.callAlert.present();
      this.api.callAlert.onWillDismiss(() => {
        this.api.callAlertShow = false;
        this.api.callAlert = null;
        this.api.stopAudio();
      });
    }
   }

  ngAfterViewInit() {
      this.router.events.subscribe((nav) => {
      if (nav instanceof  NavigationEnd) {

        this.getBanner();
        this.getBingo();

        if (this.api.pageName == 'LoginPage') {
          this.avatar = '';
          this.menu_items = this.menu_items_logout;
          this.is_login = false;
        }

        this.api.storage.get('user_data').then((val: any) => {
          if (val) {
            if (!val.status) {
              this.menu_items = this.menu_items_logout;
              this.is_login = false;
            } else {
              this.is_login = true;
              this.menu_items = this.menu_items_login;
              this.getStatistics();
            }
            this.bannerStatus();

          } else {
            if (!this.canEnterWithoutLogin.includes(this.api.pageName)) {
              this.router.navigate(['/login']);
              this.is_login = false;
              this.menu_items = this.menu_items_logout;
            }
          }
        });
      }
    });
  }
}


