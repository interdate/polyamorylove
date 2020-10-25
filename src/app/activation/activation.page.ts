import {Component} from '@angular/core';
import {ApiQuery} from '../api.service';
import {Router} from "@angular/router";

/*
 Generated class for the Activation page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-activation',
  templateUrl: 'activation.page.html',
  styleUrls: ['activation.page.scss'],
})
export class ActivationPage {

  form: { errorMessage: any, res: any, description: any, success: any, submit: any, phone: { label: any, value: any }, code: { label: any, value: any } } =
      {
        errorMessage: '',
        res: false,
        description: '',
        success: '',
        submit: false,
        phone: {label: '', value: ''},
        code: {label: '', value: ''}
      };

  showContact = false;
  canResend: boolean;
  texts: any = {};
  code: string;
  contact: any;
  errors: any = {};
  formErrors = false;
  sendSuccess = false;

  constructor(public router: Router,
              public api: ApiQuery) {
    this.api.http.get(this.api.apiUrl + '/activation', this.api.header).subscribe((data: any) => {
      this.texts = data.texts;
      this.canResend = data.canResend;
      this.contact = data.contact;
      console.log(this.texts);
    });

  }

  resend() {
    // alert(1);
    this.canResend = false;
    this.api.http.post(this.api.apiUrl + '/resends', {}, this.api.header).subscribe((data: any) => {
      this.api.toastCreate(data.message);
      console.log(data);
      if (!data.success) {
        this.canResend = true;
      }
    });
  }

  activate() {
    this.api.http.post(this.api.apiUrl + '/activations', {code: this.code}, this.api.header).subscribe((data: any) => {
      if (data.success) {
        this.api.isActivated = true;
        // alert(1)
        this.router.navigate(['/home']);
      } else {
        this.api.toastCreate(data.errorMessage);
      }
    });
  }

  sendEmail() {

    this.formErrors = false;
    this.errors = {};


    let isValid = true;
    if (!this.contact.email.value.trim()) {
      this.errors.email = 'כתובת אימייל לא תקינה';
      isValid = false;
    }
    if (!this.contact.subject.value.trim()) {
      this.errors.subject = 'נא להזין נושא פניה';
      isValid = false;
    }
    if (!this.contact.text.value.trim()) {
      this.errors.text = 'נא להזין הודעה';
      isValid = false;
    }

    if (isValid) {

      // if (this.contact.email.value.trim() && this.contact.text.value.trim() && this.contact.subject.value.trim()) {
        var params = {
          contact: {
            email: this.contact.email.value,
            text: this.contact.text.value,
            subject: this.contact.subject.value
            // _token: this.form._token.value,
          }
        };
        this.api.http.post(this.api.openUrl + '/contacts', params, this.api.header).subscribe((data: any) => {
          this.showContact = false;
          this.sendSuccess = true;
        });
      } else {
        this.formErrors = true;
      }
    }

    ionViewWillEnter() {
      this.api.pageName = 'ActivationPage';
    }

  // }
}
