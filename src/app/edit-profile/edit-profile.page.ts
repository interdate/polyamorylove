import {Component, OnInit, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ApiQuery} from '../api.service';
import {SelectModalPage} from "../select-modal/select-modal.page";
import {ModalController} from "@ionic/angular";
import {Router} from "@angular/router";
import {HttpHeaders} from "@angular/common/http";
import {Events} from "@ionic/angular";
import {IonContent} from "@ionic/angular";
import { Keyboard } from '@ionic-native/keyboard/ngx';
import * as $ from 'jquery';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.page.html',
  styleUrls: ['edit-profile.page.scss'],
})

export class EditProfilePage implements OnInit {

  @ViewChild(IonContent, {static: false}) content: IonContent;

  cityname: any = "";
  data: any = {};
  usersChooses: any = {};
  form: any;
  err: any = {};
  errKeys: any;
  formKeys: any;
  field_value: any;
  user: any;//{ region: any, username: any, email: any, email_retype: any, area: any, neighborhood: any, zip_code: any, phone: any, occupation: any, about_me: any, looking_for: any };
  name: any;
  birth: any;
  allfields = '';
  step: any = 1;


  constructor(public api: ApiQuery,
              public modalCtrl: ModalController,
              public router: Router,
              public events: Events,
              private sanitizer: DomSanitizer,
              public keyboard: Keyboard) {}


  ngOnInit() {
       // this.keyboard.hideKeyboardAccessoryBar(false);
       // this.keyboard.disableScroll(true);
      this.keyboard.hideFormAccessoryBar(false);
     // this.keyboard.disableScroll(false);
      this.edit_step(1);
  }


     onOpenKeyboard()  {
       $('.footerMenu').hide();
         $('.container').css({
             'margin': '0 0 197px!important'
         });
    }


    onHideKeyboard() {
        $('.container').css({
                'margin': '0 0 69px!important'
            });

        $('.footerMenu').show();
    }

  getValueLabel(field) {
   return this.form[field].choices.find(x=>x.value == this.form[field].value).label;
  }

  isObject(val) {
    return typeof val == 'object';
  }

  isArray(val) {
    return Array.isArray(val);
  }

  async openSelect2(field, fieldTitle) {

    console.log(field);
    const modal = await this.modalCtrl.create({
      component: SelectModalPage,
      componentProps: {
        choices: field.choices,
        title: field.label,
        choseNow: this.usersChooses[fieldTitle],
        search: fieldTitle == 'city' ? true : false
      }
    });
    await modal.present();

    modal.onDidDismiss().then(data => {
      if(data.data) {
        this.form[fieldTitle].value = data.data.value;
        this.usersChooses[fieldTitle] = data.data.label;
      }
    });
    //field.name

  }

  getKeys(obj) {
    return Object.keys(obj);
  }

  maxYear() {
    return new Date().getFullYear() - 18;
  }

  formSubmit() {
    this.err = {};
    this.allfields = '';
     this.api.showLoad();

    let data: any;

    if (this.step == 1) {

      var date_arr = ['', '', ''];

      if (typeof this.birth != 'undefined') {
        date_arr = this.birth.split('-');
      }

        data = JSON.stringify({
          profile_one: {
            username: this.form.username.value,
            email: this.form.email.value,
            // phone: this.form.phone.value,
           // _token: this.form._token.value
          }
        });

    } else if (this.step == 2) {

       data = JSON.stringify({
          profile_two: {
              relationshipStatus: this.form.relationshipStatus.value,
              region: this.form.region.value,
              city: this.form.city.value,
              sexOrientation: this.form.sexOrientation.value,
              height: this.form.height.value,
              body: this.form.body.value,
              relationshipType: this.form.relationshipType.value,
              lookingFor: this.form.lookingFor.value,
              origin: this.form.origin.value,
              lookingForDetails: this.form.lookingForDetails.value,
              relationshipTypeDetails: this.form.relationshipTypeDetails.value,
              sexOrientationDetails: this.form.sexOrientationDetails.value,
              smoking: this.form.smoking.value,
           // _token: this.form._token.value
          }
        });

      } else if (this.step == 3) {

       data = JSON.stringify({
          profile_three: {
              about: this.form.about.value,
              looking: this.form.looking.value,
              contactGender: this.form.contactGender.value,
              ageTo: this.form.ageTo.value,
              ageFrom: this.form.ageFrom.value,
          }
        });

      }

    this.api.http.post(this.api.url + '/api/v2/he/edits/profiles', data, this.api.setHeaders(true)).subscribe((data:any) => {
        this.err = data.errors.form.children;
        console.log(this.err);
        if(data.success) {
            this.api.toastCreate(data.texts.textSuccess, 2500);
            if (this.step == 1) {
                this.api.storage.get('user_data').then(user_data => {
                    if (data.username != this.form.username.value) {
                        user_data.username = this.form.username.value;
                        this.api.storage.set('user_data', user_data);
                        this.api.setHeaders(true, this.form.username.value);
                    }
                });
                this.api.storage.set('username', this.form.username.value);
            }
            // data.form.remove(data.form.)
            this.form = data.form;
        } else {
            setTimeout( () => {
                let y = $('.border-red').offset().top - 30;
                this.content.scrollToPoint(null, y, 300);
            }, 300 );
        }
        this.api.hideLoad();
    }, (err) => this.api.hideLoad());
  }


  edit_step(step) {
    this.api.http.get(this.api.url + '/api/v2/he/edit/profile?step=' + step, this.api.setHeaders(true)).subscribe((data: any) => {
        this.form = data.form;
        console.log(data);
        this.formKeys = Object.keys(this.form);
        this.step = step;
        if(step == 1) {
          // delete(this.form.phone)
;          this.birth = data.form.birthday.value.year + '-' + data.form.birthday.value.month + '-' + data.form.birthday.value.day;
          console.log(this.birth);
        } else if(this.step == 2) {
          //delete option gey for woman and lesbi for man
            if(data.user_gender == 1){
              this.form.sexOrientation.choices.splice(2,1);
            } else if(data.user_gender == 2){
              this.form.sexOrientation.choices.splice(1, 1);
            }
        }

    });
  }

  setHeaders() {
    let myHeaders = new HttpHeaders();
    myHeaders = myHeaders.append('username', this.form.login.username.value);
    myHeaders = myHeaders.append('password', this.form.login.password.value);
    myHeaders = myHeaders.append('Content-type', 'application/json');
    myHeaders = myHeaders.append('Accept', '*/*');
    myHeaders = myHeaders.append('Access-Control-Allow-Origin', '*');

    let header = {
      headers: myHeaders
    };
    return header;
  }

  ionViewWillEnter() {
      this.api.pageName = 'EditProfilePage';
      // window.addEventListener('keyboardWillShow', this.onOpenKeyboard);
      // window.addEventListener('keyboardWillHide', this.onHideKeyboard);
  }

  ionViewWillLeave() {
      //window.removeEventListener('keyboardWillShow', null);
      // window.removeEventListener('keyboardWillHide', null);
  }

}
