import {Component, OnInit} from '@angular/core';
import {ToastController} from '@ionic/angular';
import {ApiQuery} from '../api.service';
// import 'rxjs/add/operator/catch';
import {HttpHeaders} from '@angular/common/http';
import {Router, ActivatedRoute, NavigationExtras} from '@angular/router';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import * as $ from 'jquery';
import {Events} from '@ionic/angular';
import {AlertController} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import {Platform} from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
// import {InAppPurchase} from '@ionic-native/in-app-purchase/ngx';


@Component({
  selector: 'page-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  providers: [
    FingerprintAIO,
    Keyboard,
    Facebook,
      // InAppPurchase
  ]


})

export class LoginPage implements OnInit {

  form: any;
  errors: any;
  header:any;
  user: any = {id: '', name: ''};
  logout: any = false;
  fingerAuth: any;
  fbId: any;

  constructor(
              public api: ApiQuery,
              private faio: FingerprintAIO,
              public router: Router,
              public events: Events,
              public fb: Facebook,
              public alertCtrl: AlertController,
              public route: ActivatedRoute,
              public splashScreen: SplashScreen,
              public toastCtrl: ToastController,
              public platform: Platform,
              public keyboard: Keyboard,
              // private iap: InAppPurchase,
              ) {}

  ngOnInit() {
    window.addEventListener('keyboardWillShow', () => {
      $('.small-btnim').css({'padding-bottom': '8px'});
    });
    window.addEventListener('keyboardWillHide', () => {
      $('.small-btnim').css({'padding-bottom': '40px'});
    });

    this.splashScreen.hide();
    this.api.showLoad();
    this.api.http.get(this.api.openUrl + '/login', this.api.setHeaders()).subscribe((data:any) => {
      this.form = data;
    },err => console.log(err));
    this.route.queryParams.subscribe((params: any) => {
      if(params && params.logout) {
        this.api.setHeaders(false, null, null);
        this.api.username = 'noname';
        this.api.storage.remove('user_data');
      }
    });

    this.api.hideLoad();

  }

  ionViewWillEnter() {
    //  alert('view');
    this.api.pageName = 'LoginPage';
    $('.footerMenu').hide();
    this.api.storage.get('username').then((username) => {
      this.form.login.username.value = username;
      this.user.name = username;
      this.form.login.password.value = '';
    });

    this.api.storage.get('fingerAuth').then((val) => {
      this.faio.isAvailable().then(result => {
        if (val) {
          this.fingerAuth = true;
        }
      });
    });

    this.api.hideLoad();
  }


  loginFB() {
    this.fb.getLoginStatus().then((
        res: FacebookLoginResponse) => {
      console.log('Logged into Facebook!', res);
      if(res.status == 'connected') {
        this.getFBData(res);
      }else{
        this.fb.login(['email']).then((
            fbres: FacebookLoginResponse) => {
          console.log('Logged into Facebook!', fbres);
          this.getFBData(fbres);
        }).catch(e => console.log('Error logging into Facebook', e));
      }
    }).catch(e => console.log('Error logging into Facebook', e));
  }

  getFBData(status) {
    this.fb.api('/me?fields=email,id', ['email']).then(
        res => {
          // alert(JSON.stringify(res));
          this.checkBFData(res);
        }).catch(e => console.log('Error getData into Facebook '+ e));
  }

  checkBFData(fbData) {
    this.form.login.username.value = '';
    this.form.login.password.value = '';
    let postData = JSON.stringify({facebook_id: fbData.id});
    this.api.http.post(this.api.openUrl + '/logins.json', postData, this.setHeaders()).subscribe((data: any) => {
      if (data.user.login == '1') {
        this.api.storage.set('user_data', {
          username: data.user.username,
          password: data.user.password,
          status: data.user.status,
          user_id: data.user.id,
          user_photo: data.user.photo
        });
        this.api.setHeaders(true, data.user.username, data.user.password);
        this.router.navigate(['/home']);
        this.api.storage.get('deviceToken').then((deviceToken) => {
          if (deviceToken) {
            this.api.sendPhoneId(deviceToken);
          }
        });
      } else {
        this.alertCtrl.create({
          header: this.form.login.facebook.pop_header,
          message: this.form.login.facebook.pop_message,
          buttons: [
            {
              text: this.form.login.facebook.pop_button,
              handler: () => {
                const data = JSON.stringify({
                  user:
                  {
                    email: fbData.email,
                    facebook_id: fbData.id
                  },
                  step: 0
                });
                const navigationExtras: NavigationExtras = {
                  queryParams: {
                    params: data
                  }
                };
                this.router.navigate(['/registration'], navigationExtras);
              }
            },
            {
              text: this.form.login.facebook.pop_cancel,
              role: 'cancel',
              handler: () => this.fbId = fbData.id
            }
          ]
        }).then( alert => alert.present() );

      }
    }, err => {
      console.log('login: ', err);
    });
  }

  formSubmit() {
    let postData = '';
    if (this.fbId) {
      postData = JSON.stringify({facebook_id: this.fbId});
    }
    console.log(this.setHeaders());
    this.api.http.post(this.api.openUrl + '/logins.json', postData, this.setHeaders()).subscribe(data => {
      this.validate(data);
    }, err => {
      if (this.form.errors.is_not_active) {
        this.errors = 'This user blocked by Administrator';
      } else {
        this.errors = this.form.errors.bad_credentials;
      }
    });
  }

  fingerAuthentication() {
    this.faio.show({
      title: 'Login to Polyamorylove with finger print',
      description: 'Login to Polyamorylove with finger print' ,
    }).then((result: any) => {
          if (result) {
            this.api.storage.get('fingerAuth').then((val) => {
              if (val) {
              //  alert('in if val, '  + JSON.stringify(val));
                this.form.login.username.value = val.username;
                this.form.login.password.value = val.password;
              //  alert('form, ' + this.form.login.username.value + this.form.login.password.value)
                this.formSubmit();
              }
            });
          }
        }).catch((error: any) => console.log(error));
  }

  setHeaders() {
    let myHeaders = new HttpHeaders();
    console.log(myHeaders);
    myHeaders = myHeaders.append('username', encodeURIComponent(this.form.login.username.value));
    myHeaders = myHeaders.append('password', encodeURIComponent(this.form.login.password.value));
    myHeaders = myHeaders.append('Content-type', 'application/json');
    myHeaders = myHeaders.append('Accept', '*/*');
    myHeaders = myHeaders.append('Access-Control-Allow-Origin', '*');
    console.log(myHeaders);

    let header = {
      headers: myHeaders
    };
    return header;
  }


  validate(response) {
    this.errors = '';
    if(response.status) {
      this.api.isPay = response.isPay;
      this.api.isMan = response.isMan;
      if (response.status != 'not_activated') {
        this.fbId = '';
        this.api.userId = response.id;
        this.api.storage.set('user_data', {
          username: response.username,
          password: this.form.login.password.value,
          status: response.status,
          user_id: response.id,
          user_photo: response.photo
        });
        this.api.storage.set('fingerAuth', {
          username: this.form.login.username.value,
          password: this.form.login.password.value,

        });
        // this.checkPayment();
        this.api.storage.set('username', this.form.login.username.value);

        this.events.publish('status:login');
        this.api.setHeaders(true, response.username, this.form.login.password.value);
        this.api.setLocation();
        this.api.getThereForPopup();
      }

      if (response.status == 'login') {
        //alert(2);
        this.api.data['params'] = 'login';
        this.router.navigate(['/home']);

      } else if (response.status == 'no_photo') {
        this.user.id = response.id;

        this.api.toastCreate('Confirm');

      } else if (response.status == 'not_activated') {
        this.api.toastCreate('Confirm');
        this.router.navigate(['/login']);
      }
    } else {
      this.errors = response.is_not_active ? this.form.errors.account_is_disabled : this.form.errors.bad_credentials;
    }
    this.api.storage.get('deviceToken').then((deviceToken) => {
      if(deviceToken) this.api.sendPhoneId(deviceToken);
    });

  }

  // checkPayment() {
  //   if (!this.api.isPay) {
  //     let that = this;
  //     this.iap.restorePurchases().then( (history) => {
  //       // this.restore = data;
  //       console.log('checkPayment: ' + JSON.stringify(history));
  //       console.log(that.api.setHeaders(true));
  //       that.api.http.post(that.this.api.apiUrl + '/api/v2/he/subs', { history: history }, that.api.setHeaders(true)).subscribe((res: any) => {
  //         console.log('Restore: ' + JSON.stringify(res));
  //         if(res.payment == 1) {
  //           this.api.isPay = true;
  //         }
  //       }, error => {
  //         console.log('Restore: ' + error);
  //       });
  //     }).catch((err) => {
  //       // console.log('Restore: ' + err);
  //     });
  //   }
  // }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }


  ionViewDidEnter() {

  }


  ionViewWillLeave() {
    this.api.footer = true;
    console.log('login page will liiv');
    $('.footerMenu').show();

  }

  testfn() {
    // alert(1);
  }

}
