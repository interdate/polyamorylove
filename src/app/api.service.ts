import {Storage} from '@ionic/storage';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {Component, Injectable, isDevMode} from '@angular/core';
import {AlertController, Events, LoadingController, Platform, ToastController} from '@ionic/angular';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {Location} from '@angular/common';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';

import * as $ from 'jquery';
import {Keyboard} from '@ionic-native/keyboard/ngx';
import {reject} from "q";
import {Route, Router} from "@angular/router";
import { Device } from '@ionic-native/device/ngx';
import {environment} from "../environments/environment";


@Injectable({
    providedIn: 'root'
})

export class ApiQuery {

    userId: any;
    videoShow: any = false;
    data: any = {};
    url: any;
    headers: any;
    response: any;
    username: any = 'noname';
    password: any = 'nopass';
    version;
    header: any;
    status: any = '';
    back = false;
    storageRes: any;
    footer: any;
    pageName: any = false;
    loading: any;
    usersChooses: any = {};
    firstOpen: boolean;
    isLoading = false;
    isPay: any;
    isActivated: boolean;
    openUrl: string;
    apiUrl: string;
    callAlertShow: any = false;
    videoChat: any = null;
    videoTimer: any = null;
    callAlert: any;
    audioCall: any;
    audioWait: any;
    checkedPage: string;
    thereForComplete = true;
    alertPresent = false;
    timeouts: any;
    isMan: boolean;
    peerjs: any = [];
    usersCache: any = [];

    constructor(public storage: Storage,
                public loadingCtrl: LoadingController,
                public toastCtrl: ToastController,
                public alertCtrl: AlertController,
                public http: HttpClient,
                public platform: Platform,
                public navLocation: Location,
                public geolocation: Geolocation,
                public route: Router,
                private sanitizer: DomSanitizer,
                public iab: InAppBrowser,
                public events: Events,
                public device: Device
    ) {

        this.url = 'https://PolyinLove.com/';
        this.apiUrl = environment.apiUrl;
        this.openUrl = environment.openUrl;
        this.footer = true;
        this.version = platform.is('android') ? 1 : 1;


    }


    safeHtml(html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
        // return this.sanitizer.bypassSecurityTrustScript(html);
    }

    /**
     * sends phone id, os, and os version to the server
     * @param idPhone
     */
    sendPhoneId(idPhone) {
        //  alert('in send id , api page, id: ' + JSON.stringify(idPhone));
        // alert('in send phone id from api page  ,will send this: ' + idPhone);
        const model = this.device.manufacturer + ' ' + this.device.model;
        const uuid = this.device.uuid;
        const os = this.device.platform + ' ' + this.device.version;
        const data = JSON.stringify({phone_id: idPhone, model, uuid, os});
        this.http.post(this.apiUrl + '/phones', data, this.setHeaders(true)).subscribe(data => {
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
            closeButtonText: 'Submit',
            duration: duration,
            animated: true
        });
        await toast.present();
    }

    async showLoad(text = 'Waiting...') {
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
        if (this.isLoading) {
            this.isLoading = false;
            return await this.loadingCtrl.dismiss();
        }
    }

    setUserData(data) {
        this.setStorageData({label: 'username', value: data.username});
        this.setStorageData({label: 'password', value: data.password});
    }


    setStorageData(data) {
        this.storage
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
        myHeaders = myHeaders.append('Access-Control-Allow-Credentials', 'true');

        if (is_auth == true) {
            myHeaders = myHeaders.append('ApiCode', btoa(encodeURIComponent(this.username) + '|357' + encodeURIComponent(this.password)));
        }
        this.header = {
            headers: myHeaders
        };
        if (promise) {
            return new Promise((resolve) => {
                return resolve({
                    header: this.header
                });

            });
        }
        return this.header;
    }

    setFormHeaders(username = '', password = '') {

        if (username !== '') {
            this.username = decodeURIComponent(username);
        }
        if (password !== '') {
            this.password = decodeURIComponent(password);
        }

        let myHeaders: HttpHeaders = new HttpHeaders();
        myHeaders = myHeaders.append('enctype', 'multipart/form-data');
        // myHeaders = myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
        myHeaders = myHeaders.append('Access-Control-Allow-Origin', '*');
        myHeaders = myHeaders.append('version', this.version.toString());
        myHeaders = myHeaders.append('Access-Control-Allow-Credentials', 'true');
        myHeaders = myHeaders.append('ApiCode', btoa(encodeURIComponent(this.username) + '|357' + encodeURIComponent(this.password)));
        this.header = {
            headers: myHeaders
        };

        return this.header;
    }



    ngAfterViewInit() {
        this.storage.get('user_data').then(data => {
            if (data.username) {
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

            this.http.post(this.apiUrl + '/locations', params, this.setHeaders(true)).subscribe(data => {
            });
        });
    }

    onBack(set = false) {
        this.back = set;
        this.navLocation.back();
    }

    openVideoChat(param) {
        this.storage.get('user_data').then((data) => {

            if (this.callAlert && this.callAlert != null) {
                this.callAlert.dismiss();
                this.callAlert = null;
            }
            this.playAudio('call');

            this.http.post(this.apiUrl + '/calls/' + param.id, {
                message: 'call',
                id: param.chatId
            }, this.setHeaders(true)).subscribe((res: any) => {
                this.stopAudio();
                if (res.error != '') {
                    this.toastCtrl.create({
                        message: res.error,
                        showCloseButton: true,
                        closeButtonText: 'Confirm'
                    }).then(toast => toast.present());

                } else {
                    // /user/call/push/
                    if (res.call.sendPush) {
                        this.http.post(this.url + '/calls/' + param.id + '/push/' + param.id, {}, this.setHeaders(true)).subscribe((data: any) => {

                        });
                    }
                    param.chatId = res.call.callId;
                    $('#close-btn,#video-iframe').remove();
                    const closeButton = document.createElement('button');
                    closeButton.setAttribute('id', 'close-btn');
                    closeButton.style.backgroundColor = 'transparent';
                    closeButton.style.margin = '0 10px';
                    closeButton.style.width = '40px';
                    closeButton.style.height = '40px';
                    closeButton.style['font-size'] = '0px';
                    closeButton.style['text-align'] = 'center';
                    closeButton.style.background = 'url(https://m.richdate.co.il/assets/img/video/buzi_b.png) no-repeat center';
                    closeButton.style['background-size'] = '100%';
                    closeButton.style.position = 'absolute';
                    closeButton.style.bottom = '10px';
                    closeButton.style.left = 'calc(50% - 25px)';
                    closeButton.style.zIndex = '9999';
                    closeButton.onclick = (e) => {
                        $('#close-btn,#video-iframe').remove();
                        this.http.post(this.apiUrl + '/calls/' + param.id, {
                            message: 'close',
                            id: param.chatId
                        }, this.setHeaders(true)).subscribe((data: any) => {
                            // let res = data.json();
                        });
                        this.videoChat = null;
                    };

                    this.videoChat = document.createElement('iframe');
                    this.videoChat.setAttribute('id', 'video-iframe');
                    this.videoChat.setAttribute('src', 'https://m.richdate.co.il/video.html?id=' + data.user_id + '&to=' + param.id);
                    this.videoChat.setAttribute('allow', 'camera; microphone');
                    this.videoChat.style.position = 'absolute';
                    this.videoChat.style.top = '0';
                    this.videoChat.style.left = '0';
                    this.videoChat.style.boxSizing = 'border-box';
                    this.videoChat.style.width = '100vw';
                    this.videoChat.style.height = '101vh';
                    this.videoChat.style.backgroundColor = 'transparent';
                    this.videoChat.style.zIndex = '999';
                    this.videoChat.style['text-align'] = 'center';

                    document.body.appendChild(this.videoChat);
                    document.body.appendChild(closeButton);

                    if (param.alert == false) {
                        this.checkVideoStatus(param);
                    }
                }
            }, error => {
                this.stopAudio();
            });


        });
    }

    playAudio(audio) {
        if (this.callAlertShow == false) {
            this.showLoad();
        }
        if (audio == 'call') {
            this.audioCall.play();
            this.audioCall.loop = true;
        } else {
            this.audioWait.play();
            this.audioWait.loop = true;
        }
    }

    stopAudio() {
        this.audioCall.pause();
        this.audioCall.currentTime = 0;
        this.audioWait.pause();
        this.audioWait.currentTime = 0;
        this.hideLoad();
    }

    checkVideoStatus(param) {
        this.http.get(this.url + '/user/call/status/' + param.chatId, this.setHeaders(true)).subscribe((res: any) => {
            // let res = data.json();

            this.status = res.status;
            if (res.status == 'answer') {

            }
            if (res.status == 'close' || res.status == 'not_answer') {


                this.stopAudio();
                if (this.videoChat != null || this.callAlert != null) {

                    this.toastCtrl.create({
                        message: (this.status == 'not_answer' && this.videoChat && this.videoChat != null) ? ('call with  ' + param.username + ' was rejected') : 'call ended',
                        showCloseButton: true,
                        closeButtonText: 'Confirm'
                    }).then(toast => toast.present);
                }
                if (this.callAlert && this.callAlert != null) {
                    this.callAlert.dismiss();
                    this.callAlert = null;
                }
                if (this.videoChat && this.videoChat != null) {
                    $('#close-btn,#video-iframe').remove();
                    this.videoChat = null;
                }
            }

            if (this.videoChat != null || this.callAlert != null) {
                let that = this;
                setTimeout(() => {
                    that.checkVideoStatus(param);
                }, 3000);
            }
        });

    }

    getThereForPopup() {
        const that = this;
        if (this.pageName !== 'EditProfilePage' && !this.alertPresent) {
            this.http.get(this.apiUrl + '/update/user/information', this.header).subscribe((res: any) => {
                if (res.needPopup) {
                    this.alertCtrl.create({
                        message: res.texts.message,
                        backdropDismiss: false,
                        buttons: [{
                            text: res.texts.btns.link,
                            handler: () => {
                                that.route.navigate(['/edit-profile']);
                            }
                        }]
                    }).then(alert => {
                        alert.present();
                    });
                } else {
                    console.log('from api wiill set there for complete as true');
                    this.thereForComplete = true;
                    console.log(this.thereForComplete);
                }
            });
        }

        // }
    }

}
