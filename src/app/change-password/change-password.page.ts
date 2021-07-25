import {Component} from '@angular/core';
import {ApiQuery} from '../api.service';

import * as $ from 'jquery'

/*
 Generated class for the ChangePassword page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.page.html',
  styleUrls: ['change-password.page.scss'],
 // providers: [HTTP]
})
export class ChangePasswordPage {

  form: any = {
    oldPassword: '',
    password: {
      first: '',
      second: '',
    }
  };
  oldPassword: any = '';
  firstPass: any = '';
  secondPass: any = '';

  constructor(public api: ApiQuery) {

    this.api.http.post(this.api.apiUrl + '/passwords', {}, api.header).subscribe((data:any) => {
      this.form = data.form;
    }, err => {
      console.log('Oops!');
    });
  }

  formSubmit(form) {
    this.oldPassword = this.firstPass = this.secondPass ='';
    console.log(form);
    let isValid = true;
    if (this.form.oldPassword.value.length < 7) {
      this.oldPassword = 'Invalid old password';
      isValid = false;
    }
    if (this.form.password.first.value.length < 7) {
      this.firstPass = 'New password must contain at least 7 chars';
      isValid = false;
    }
    if ( this.form.password.second.value !== this.form.password.first.value) {
      this.secondPass = 'Passwords not matched';
      isValid = false;
    }
    if (isValid) {


      var params ={
        change_password: {
         // _token: this.form._token.value,
          oldPassword: this.form.oldPassword.value,
          password: {
            first: this.form.password.first.value,
            second: this.form.password.second.value
          },

        }
      };

      //
      // const headers = {
      // 'Content-type': 'application/json',
      // 'Accept': '*/*',
      // 'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Methods': 'POST',
      //  "Authorization": "Basic " + btoa(encodeURIComponent(this.username) + ':' + encodeURIComponent(this.password))
      // };


      this.api.http.post(this.api.apiUrl + '/passwords', params, this.api.header).subscribe(data => this.validate(data));
    }
  }

  validate(response:any) {
    this.oldPassword = response.errors.form.children.oldPassword.errors;
    this.firstPass = response.errors.form.children.password.children.first.errors;
    this.secondPass = response.errors.form.children.password.children.second.errors;

    console.log(this);


    if (response.changed == true) {

      this.api.storage.get('user_data').then(data => {
        data.password = this.form.password.first.value;
        this.api.storage.set('user_data', data);
      });
      this.api.setHeaders(true, '', this.form.password.first.value);

      this.form.password.first.value = "";
      this.form.password.second.value = "";
      this.form.oldPassword.value = "";

  this.api.toastCreate('Password Changed');
    } else {
      this.form = response.form;
    }
  }

  onOpenKeyboard() {
    $('.footerMenu').hide();
  }

  onCloseKeyboard() {
    $('.footerMenu').show();
  }

  ionViewWillEnter() {
    this.api.pageName = 'ChangePasswordPage';
    console.log(this.api.pageName);
    // window.addEventListener('keyboardWillShow', this.onOpenKeyboard);
    // window.addEventListener('keyboardWillHide', this.onHideKeyboard);
  }

  // ionViewWillLeave() {
  //   window.removeEventListener('keyboardWillShow', this.onOpenKeyboard);
  //   window.removeEventListener('keyboardWillHide', this.onHideKeyboard);
  // }
}
