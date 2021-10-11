import {Component, OnInit, ViewChild} from '@angular/core';
import {ApiQuery} from '../api.service';
import {IonContent} from '@ionic/angular';
import {Router, ActivatedRoute} from '@angular/router';
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
export class ProfilePage implements OnInit {
  @ViewChild(IonContent, {static: false}) content: IonContent;


  isAbuseOpen: any = false;

  user: any = {
      isAddBlackListed: false,
      isAddVerify: true
  };
  texts: { lock: any, unlock: any } = {lock: '', unlock: ''};

  formReportAbuse: { title: any, buttons: { cancel: any, submit: any }, text: { label: any, name: any, value: any } } =
  {title: '', buttons: {cancel: '', submit: ''}, text: {label: '', name: '', value: ''}};

  myId: any = false;

  myProfile = false;

  constructor(public api: ApiQuery,
              public router: Router,
              public route: ActivatedRoute,
              public keyboard: Keyboard,
              private changeRef: ChangeDetectorRef,
              public platform: Platform,
              ) {

  }


    ngOnInit() {
        this.route.queryParams.subscribe((params: any) => {
            if (params.data) {
                this.user = JSON.parse(params.data).user;

                this.user.photos = [
                    {
                        isMain: true,
                        isValid: true,
                        cropedImage: this.user.fullPhoto
                    }
                ];
                console.log(this.user);
                this.getUser();
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
                    this.myProfile = true;
                    this.getUser();
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


    ionViewWillEnter() {
      $(document).one('backbutton', () => {
          this.api.onBack(true);
      });
      this.api.pageName = 'ProfilePage';
    }

    getKeys(obj) {

        return Object.keys(obj);

    }

    getUser() {
        console.log('this.user.id: ');
        console.log(this.user.id);
        if (typeof this.api.usersCache[this.user.id] !== 'undefined') {
            this.user = this.api.usersCache[this.user.id];
        }
        let cropedImage0 = this.user['photos'][0].cropedImage;
        let userId = this.user.id;
        this.api.http.get(this.api.apiUrl + '/users/' + userId, this.api.setHeaders(true)).subscribe((data:any) => {
            this.api.usersCache[this.user.id] = data;
            if(this.user['photos'].length > 0 && this.myId != this.user.id){
                data['photos'][0].cropedImage = cropedImage0;
            }
            this.user = data;

           this.user.formKeys = this.getKeys(data.form);
           this.formReportAbuse = data.formReportAbuse;
           this.changeRef.detectChanges();
           this.user.privateText = data.texts.privatePhoto + ' <br> ' + data.texts[data.photoStatus];
           console.log(this.user);
        });

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

   this.api.http.post(this.api.apiUrl + '/lists/' + user.id, params, this.api.setHeaders(true)).subscribe((data:any) => {
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

   this.api.http.post(this.api.apiUrl + '/lists/' + this.user.id, params, this.api.setHeaders(true)).subscribe((data:any) => {
     this.api.toastCreate(data.success);
    });
  }

  addLike(user) {
    user.isAddLike = true;
    this.api.toastCreate(' You liked ' + user.username);

    let params = JSON.stringify({
      toUser: user.id,
    });

   this.api.http.post(this.api.apiUrl + '/likes/' + user.id, params, this.api.setHeaders(true)).subscribe(data => {
      console.log(data);
    }, err => {
      console.log('Oops!');
    });

  }

  addVerify() {
      this.user.isAddVerify = true;
      this.api.http.post(this.api.apiUrl + '/verifies/' + this.user.id, {user: this.user.id}, this.api.header).subscribe((data: any) => {
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
          this.api.http.post(this.api.apiUrl + '/shows/' + this.user.id, params, this.api.header).subscribe( (data: any) => {
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
      setTimeout(() => this.content.scrollToBottom(300), 300);
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

    const params = JSON.stringify({
      text: this.formReportAbuse.text.value,
    });
    this.api.http.post(this.api.apiUrl + '/reports/' + this.user.id + '/abuses', params, this.api.setHeaders(true)).subscribe((data: any) => {
    this.api.toastCreate(data.success);
    }, err => {
      console.log('Oops!');
    });
    this.reportAbuseClose();
  }

    toVideoChat() {
        this.api.openVideoChat({id: this.user.userId, chatId: 0, alert: false, username: this.user.nickName});
    }

  ionViewWillLeave() {
      this.keyboard.hide();
      this.api.back = true;
      setTimeout( () => {
          this.api.back = false;
      }, 8000);
      // document.removeEventListener('backbutton', () => {
      //     this.back();
      // });
      $(document).off();
      // window.removeEventListener'('keyboardWillShow', this.onOpenKeyboard);
      // window.removeEventListener('keyboardWillHide', this.onHideKeyboard);
  }

}
