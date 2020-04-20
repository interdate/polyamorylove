import {Component, ViewChild} from '@angular/core';
import {ApiQuery} from '../api.service';
import {IonContent} from '@ionic/angular';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import {Platform} from '@ionic/angular';
import * as $ from 'jquery';

/*
 Generated class for the Profile page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */



@Component({
  selector: 'page-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {
  @ViewChild(IonContent, {static: false}) content: IonContent;


  isAbuseOpen: any = false;

  user: any = {
      isAddBlackListed: false
  };
  texts: { lock: any, unlock: any } = {lock: '', unlock: ''};

  formReportAbuse: { title: any, buttons: { cancel: any, submit: any }, text: { label: any, name: any, value: any } } =
  {title: '', buttons: {cancel: '', submit: ''}, text: {label: '', name: '', value: ''}};

  myId: any = false;

  constructor(public api: ApiQuery,
              public navLocation: Location,
              public router: Router,
              public route: ActivatedRoute,
              public keyboard: Keyboard,
              private changeRef: ChangeDetectorRef,
              public platform: Platform) {
  }


    ngOnInit() {

        this.route.queryParams.subscribe((params: any) => {
            if (params.data) {
                this.user = JSON.parse(params.data).user;
                console.log(this.user);
                this.user.photos = [
                    {
                        isMain: true,
                        isValid: true,
                        url: this.user.url ? this.user.url : this.user.image,
                    }
                ];
                this.getUesr();
            } else {
                this.api.storage.get('user_data').then(userData => {
                    console.log(userData.user_id);
                    this.user.id = userData.user_id;
                    this.myId = userData.user_id;
                    this.user.username = userData.username;
                    this.user.photos = [
                        {
                            isMain: true,
                            isValid: true,
                            url: userData.user_photo
                        }
                    ];
                    console.log(userData);
                    this.getUesr();
                    this.api.hideLoad();
                });
            }
        });

        console.log(this.texts);

    }


    onClickInput() {
        $('.footerMenu').hide();
        $('.container').css({ 'margin-bottom': '32px'});
        $('.abuse-form').css({'padding-bottom': 0});
        $('.content').css({'padding-bottom': 0});
        setTimeout(() => {
            this.content.scrollToBottom(100);
        }, 300);
    }


    onBlurInput() {
        $('.footerMenu').show();
        $('.container').css({ 'margin-bottom': '66px'});
    }


    onOpenKeyboard() {
        // $('.footerMenu').hide();
        // $('.content').css(
        //     {
        //         'margin-bottom': 0,
        //         'padding-bottom': '23px',
        //     }
        // );
        // $('.abuse-form').css(
        //     {
        //         'padding-bottom': '23px',
        //     }
        // );
        // setTimeout(()=>{
        //     this.content.scrollToBottom(100);
        // }, 300);
    }

    onHideKeyboard() {
        // $('.footerMenu').show();
        // $('.content').css(
        //     {
        //         'height': '101%',
        //         'padding-bottom': '10px',
        //     }
        // );
        // $('.abuse-form').css(
        //     {
        //         //'padding-bottom': '67px',
        //         'padding-bottom': '0',
        //     }
        // );

    }

    ionViewWillEnter() {
        this.api.pageName = 'ProfilePage';
       // window.addEventListener('keyboardWillShow', this.onOpenKeyboard);
        window.addEventListener('keyboardWillHide', this.onHideKeyboard);
    }


    getKeys(obj) {

        return Object.keys(obj);

    }

    getUesr() {
        this.api.http.get(this.api.url + '/api/v2/he/users/' + this.user.id, this.api.setHeaders(true)).subscribe((data:any) => {
           this.user = data;
           this.user.formKeys = this.getKeys(data.form);
           this.formReportAbuse = data.formReportAbuse;
           this.changeRef.detectChanges();
           this.user.privateText = data.texts.privatePhoto + ' <br> ' + data.texts[data.photoStatus];
           console.log(this.user);
        });

    }


  back() {
      this.api.back = true;
      this.navLocation.back();
  }

  addFavorites(user) {
      if (user.isAddFavorite == false) {
          user.isAddFavorite = true;

          var params = JSON.stringify({
              list: 'Favorite'
          });
      } else {
          user.isAddFavorite = false;
          var params  = JSON.stringify({
              list: 'Favorite',
              action: 'delete'
          });
      }

   this.api.http.post(this.api.url + '/api/v2/he/lists/' + user.id, params, this.api.setHeaders(true)).subscribe((data:any) => {
      console.log(data);
     this.api.toastCreate(data.success, 2500);
    });
  }

  blockSubmit() {
    if (this.user.isAddBlackListed == true) {
      this.user.isAddBlackListed = false;
      var action = 'delete';
    } else {
      this.user.isAddBlackListed = true;
      var action = 'create';
    }


    let params = JSON.stringify({
      list: 'BlackList',
      action: action
    });

   this.api.http.post(this.api.url + '/api/v2/he/lists/' + this.user.id, params, this.api.setHeaders(true)).subscribe((data:any) => {
     this.api.toastCreate(data.success);
    });
  }

  addLike(user) {
    user.isAddLike = true;
    this.api.toastCreate(' עשית לייק ל' + user.username);

    let params = JSON.stringify({
      toUser: user.id,
    });

   this.api.http.post(this.api.url + '/api/v2/he/likes/' + user.id, params, this.api.setHeaders(true)).subscribe(data => {
      console.log(data);
    }, err => {
      console.log('Oops!');
    });

  }

  addVerify() {
      this.user.isAddVerify = true;
      this.api.http.post(this.api.url + '/api/v2/he/verifies/' + this.user.id, {user: this.user.id}, this.api.header).subscribe((data: any) => {
         console.log(data);
         if (data.success) {
             this.api.toastCreate(data.message);
         } else {
             this.user.isAddVerify = false;
         }
      });
  }

  fullPagePhotos(isPrivate) {
      // alert(isPrivate);
      if (!isPrivate) {
          this.api.data['user'] = this.user;
          this.router.navigate(['/full-screen-profile']);
      } else {
          let params = JSON.stringify({
              user: this.user.id,
          });
          this.api.http.post(this.api.url + '/api/v2/he/shows/' + this.user.id, params, this.api.header).subscribe( (data: any) => {
             if (data.success) {
                 this.api.toastCreate(data.text);
                 this.user.privateText = this.user.texts.privatePhoto + ' <br> ' + this.user.texts.waiting;
                 this.user.photoStatus = 'waiting';
             }
          });
      }
  }

  toDialog(user) {

    this.api.data['user'] = user;
    this.router.navigate(['/dialog']);
  }

  reportAbuseShow() {
    this.isAbuseOpen = true;
      setTimeout(()=>this.content.scrollToBottom(300), 300);
      $('.pmtitle.bottom').css(
          {
              'margin-bottom': '0px',
          }
      );
  }

  reportAbuseClose() {
    this.isAbuseOpen = false;
    this.formReportAbuse.text.value = '';
    this.keyboard.hide();
    $('.footerMenu').show();
    $('.pmtitle.bottom').css({'margin-bottom': '66px'});
  }


    closeKeyboard() {
        this.keyboard.hide();
    }

  abuseSubmit() {

    let params = JSON.stringify({
      text: this.formReportAbuse.text.value,
    });

   this.api.http.post(this.api.url + '/api/v2/he/reports/' + this.user.id + '/abuses', params, this.api.setHeaders(true)).subscribe((data:any) => {
     this.api.toastCreate(data.success);
    }, err => {
      console.log('Oops!');
    });
    this.reportAbuseClose();
  }

  ionViewWillLeave() {
      this.keyboard.hide();
      this.api.back = true;
      setTimeout( () => {
          this.api.back = false;
      }, 8000);
      // window.removeEventListener('keyboardWillShow', this.onOpenKeyboard);
      // window.removeEventListener('keyboardWillHide', this.onHideKeyboard);
  }

}
