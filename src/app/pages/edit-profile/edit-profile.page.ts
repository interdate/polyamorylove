import {Component, OnInit, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ApiQuery} from '../../api.service';
import {SelectModalPage} from "../select-modal/select-modal.page";
import {AlertController, ModalController} from "@ionic/angular";
import {Router} from "@angular/router";
import {HttpHeaders} from "@angular/common/http";
import {Events} from "@ionic/angular";
import {IonContent} from "@ionic/angular";
import { Keyboard } from '@ionic-native/keyboard/ngx';
import * as $ from 'jquery';
import {forEach} from "@angular-devkit/schematics";
import {FormService} from "../../form.service";

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
  relationshipTypeHelper: any;
  multipleFields: [];


  constructor(public api: ApiQuery,
              public modalCtrl: ModalController,
              public router: Router,
              public events: Events,
              private sanitizer: DomSanitizer,
              public keyboard: Keyboard,
              public alertCtrl: AlertController,
              private fs: FormService) {}


  ngOnInit() {
       // this.keyboard.hideKeyboardAccessoryBar(false);
       // this.keyboard.disableScroll(true);
      this.keyboard.hideFormAccessoryBar(false);
     // this.keyboard.disableScroll(false);
      if (!this.api.thereForComplete) {
          this.edit_step(2);
          // $('.wrap').scrollTop(99999);
          setTimeout(() => {
              this.content.scrollToBottom(300);
          //     this.openSelect2(this.form.lookingFor, 'lookingFor');
          //    // console.log()
          }, 3000);
      } else {
          this.edit_step(1);
      }
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
      return this.fs.getValueLabel(this.form, field, this.usersChooses);
  }

  isObject(val) {
    return typeof val == 'object';
  }

  isArray(val) {
    return Array.isArray(val);
  }

  openSelect2(field, fieldTitle) {

      this.fs.openSelect2(this.form, fieldTitle, this.usersChooses);
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
              nutrition: this.form.nutrition.value,
              children: this.form.children.value,
              religion: this.form.religion.value,
              contactGender: this.form.contactGender.value,
              ageTo: this.form.ageTo.value,
              ageFrom: this.form.ageFrom.value,
          }
        });

      }

    this.api.http.post(this.api.apiUrl + '/edits/profiles', data, this.api.setHeaders(true)).subscribe((data: any) => {
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
    this.step = step;
    this.api.http.get(this.api.apiUrl + '/edit/profile?step=' + step, this.api.setHeaders(true)).subscribe((data: any) => {
        this.form = data.form;
        this.relationshipTypeHelper = data.relationshipTypeHelper;
        this.multipleFields = data.multipleFields;
        console.log(data);
        this.formKeys = Object.keys(this.form);
        if(step == 1) {
          // delete(this.form.phone)
;          this.birth = data.form.birthday.value.year + '-' + data.form.birthday.value.month + '-' + data.form.birthday.value.day;
          console.log(this.birth);
        } else if(this.step == 2) {
            if (!this.api.thereForComplete) {
                this.content.scrollToBottom(300);
                this.openSelect2(this.form.lookingFor, 'lookingFor');
            }

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

    openHelp() {
        this.alertCtrl.create({
            header: this.relationshipTypeHelper.header,
            message: this.relationshipTypeHelper.message,

            buttons: [
                {
                    text: this.relationshipTypeHelper.cancel
                },
            ]
        }).then(alert => alert.present());
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
