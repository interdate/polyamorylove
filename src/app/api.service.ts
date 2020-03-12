

import {Storage} from '@ionic/storage';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { DomSanitizer} from '@angular/platform-browser';
import {Component, Injectable} from '@angular/core';
import {LoadingController, Platform, ToastController} from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import {Keyboard} from '@ionic-native/keyboard/ngx';
import {reject} from "q";






@Injectable({
  providedIn: 'root'
})

export class ApiQuery {

  data: any = {};
  url: any;
  headers: any;
  response: any;
  username: any = 'noname';
  password: any = 'nopass';
  version;
  header: any;
  status: any = '';
  back: any = false;
  storageRes: any;
  footer: any;
  pageName: any = false;
  loading: any;
  usersChooses: any = {};
  firstOpen: boolean;
  isLoading = false;
  isPay: any;
  isActivated: boolean;

  constructor(public storage: Storage,
              public loadingCtrl: LoadingController,
              public toastCtrl: ToastController,
              public http: HttpClient,
              public platform: Platform,
              public geolocation: Geolocation,
              private sanitizer: DomSanitizer,
  ) {

    // this.url = 'http://localhost:8100';
    this.url = 'https://polydate.wee.co.il';
    // this.url = 'http://10.0.0.6:8100';
    this.footer = true;
    this.version = platform.is('android') ? 1 : 1;
    // alert('version: ' + this.version);

  }

  safeHtml(html) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
    // return this.sanitizer.bypassSecurityTrustScript(html);
  }

  sendPhoneId(idPhone) {
    //  alert('in send id , api page, id: ' + JSON.stringify(idPhone));
    // alert('in send phone id from api page  ,will send this: ' + idPhone);
    let data = JSON.stringify({phone_id: idPhone});
    this.http.post(this.url + '/api/v2/he/phones', data, this.setHeaders(true)).subscribe(data => {
      // alert('data after send id: ' + JSON.stringify(data));
    }), err => console.log('error was in send phone: ' + err);
  }

  functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
    for (var i = 0; i < arraytosearch.length; i++) {
      if (arraytosearch[i][key] == valuetosearch) {
        return i;
      }
    }
    return null;
  }

  async toastCreate(mess, duration = 60000) {
    const toast = await this.toastCtrl.create({
      message: mess,
      showCloseButton: duration == 60000 ? true : false,
      closeButtonText:  'אישור',
      duration: duration,
      animated: true
    });
    await toast.present();
  }

  async showLoad(text = 'אנא המתן...') {
    if (!this.isLoading) {
      this.isLoading = true;
      return await this.loadingCtrl.create({
        message: text,
      }).then(a => {
        a.present().then(() => {
          if (!this.isLoading) {
            a.dismiss();
          }
        });
      });
    }
  }

  async hideLoad() {
    if(this.isLoading){
      this.isLoading = false;
      return await this.loadingCtrl.dismiss();
    }
  }

  setUserData(data) {
    this.setStorageData({label: 'username', value: data.username});
    this.setStorageData({label: 'password', value: data.password});
  }


  setStorageData(data) {
    this.storage.set(data.label, data.value);
  }

  getStorageData(data) {
    /*
     this.storage.get(data).then((res) => {
     console.log(this.storageRes);
     this.storageRes = res;
     });
     setTimeout(function(){
     console.log(this.storageRes);
     return this.storageRes;
     },2000);
     */
  }

  setHeaders(is_auth = false, username = '', password = '', promise = false) {

    if (username !== '') {
      this.username = decodeURIComponent(username);
    }
    if (password !== '') {
      this.password = decodeURIComponent(password);
    }

    let myHeaders: HttpHeaders = new HttpHeaders();
    myHeaders = myHeaders.append('Content-type', 'application/json; charset=UTF-8');
    // myHeaders = myHeaders.append('Accept', '*/*');
    myHeaders = myHeaders.append('Access-Control-Allow-Origin', '*');
    myHeaders = myHeaders.append('version', this.version.toString());

    if (is_auth == true) {
      // alert(1);
      myHeaders = myHeaders.append("Authorization", "Basic " + btoa(encodeURIComponent(this.username) + ':' + encodeURIComponent(this.password)));
    }
    this.header = {
      headers: myHeaders
    };
    // alert(JSON.stringify(this.header));
    if (promise) {
      return new Promise((resolve) => {
         return  resolve({
            header: this.header
          });

      });
    }
    return this.header;
  }



  ngAfterViewInit() {
    this.storage.get('user_data').then(data => {
      if(data.username) {
        this.username = data.username;
        this.password = data.password;
      }
    });

  }

  setLocation() {
    this.geolocation.getCurrentPosition().then(pos => {
      let params = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      };

      this.http.post(this.url + '/api/v2/he/locations', params, this.setHeaders(true)).subscribe(data => {});
    });
  }
}
