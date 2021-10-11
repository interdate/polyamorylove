import {Component} from '@angular/core';
import {ToastController} from '@ionic/angular';
import {ApiQuery} from '../api.service';
import * as $ from 'jquery';
// declare var $: any;


/*
 Generated class for the ContactUs page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    selector: 'page-contact-us',
    templateUrl: 'contact-us.page.html',
    styleUrls: ['contact-us.page.scss']
})
export class ContactUsPage {

    // form: any = {};
    errors: any = {};
    user_id: any;
    allfields = '';
    logged_in = false;
    form: any = {
        email: '',
        text: '',
        subject: '',
    };

    constructor(public api: ApiQuery,
                public toastCtrl: ToastController) {


        this.api.http.get(this.api.openUrl + '/contact', api.header).subscribe((data: any) => {
            this.form = data.form;
            console.log(this.form);

        }, err => {
            console.log('Oops!');
        });

        this.api.storage.get('user_data').then(data => {
            if (data.user_id) {
                this.user_id = data.user_id;
                this.logged_in = true;
            }
        });


    }

    onOpenKeyboard() {
        $('.footerMenu').hide();
    }

    onHideKeyboard() {
        $('.footerMenu').show();
    }

    formSubmit() {

        let isValid = true;
        if (this.form.email.value.trim().length < 7 && !this.logged_in) {
            this.errors.email = 'Invalid email address';
            isValid = false;
        }
        if (this.form.subject.value.trim() == '') {
            this.errors.subject = 'Enter subject';
            isValid = false;
        }
        if ( this.form.text.value.trim() == '') {
            this.errors.text = 'Enter message';
            isValid = false;
        }

        if (isValid) {
            var params ={
                contact: {
                    email: this.user_id ? this.user_id : this.form.email.value,
                    text: this.form.text.value,
                    subject: this.form.subject.value
                    //_token: this.form._token.value,
                }
            };

            this.api.http.post(this.api.openUrl + '/contacts', params, this.api.header).subscribe(data => this.validate(data));
        }
    }

    validate(response) {
        console.log(response);
        if (response.send == true) {
            this.form.email.value = "";
            this.form.text.value = "";
            this.form.subject.value = "";

            this.toastCtrl.create({
                message: 'Message sent',
                showCloseButton: true,
                closeButtonText: 'Confirm'
            }).then(toast => toast.present());
        } else if(!this.errors) {
            this.allfields = 'ooops!';
        } else {
            this.errors.email = response.errors.form.children.email.errors;
            this.errors.subject = response.errors.form.children.subject.errors;
            this.errors.text = response.errors.form.children.text.errors;
        }
    }


    back() {
        this.api.onBack();
        setTimeout( () => {
            $('.scroll-content, .fixed-content').css({'margin-bottom': '57px'});
        }, 500);
    }


    ionViewWillEnter() {
        this.api.pageName = 'ContactUsPage';
        window.addEventListener('keyboardWillShow', this.onOpenKeyboard);
        window.addEventListener('keyboardWillHide', this.onHideKeyboard);
      //  alert(this.api.pageName);
    }

    ionViewWillLeave() {
        window.removeEventListener('keyboardWillShow', this.onOpenKeyboard);
        window.removeEventListener('keyboardWillHide', this.onHideKeyboard);
    }

}
