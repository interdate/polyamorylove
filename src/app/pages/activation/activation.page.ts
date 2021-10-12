import {Component} from '@angular/core';
import {ApiQuery} from '../../api.service';
import {Router} from '@angular/router';
import {Events} from '@ionic/angular';

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
    phone: string;
    email: string;
    phoneUpdated: string;
    phoneError: string;
    emailUpdated: string;
    emailError: string;

    constructor(public router: Router,
                public api: ApiQuery,
                public events: Events) {
        this.api.http.get(this.api.apiUrl + '/activation', this.api.header).subscribe((data: any) => {
            this.texts = data.texts;
            this.canResend = data.canResend;
            this.contact = data.contact;
            this.phone = data.phone;
            this.email = data.email;
        });
    }

    checkPhone() {
        this.phoneUpdated = this.phoneError = '';

        this.api.alertCtrl.create({
            header: this.texts.phone.header,
            subHeader: this.texts.phone.subheader,
            animated: true,
            inputs: [
                {
                    type: 'tel',
                    name: 'phone',
                    value: this.phone,
                    label: this.texts.phone.label,

                }
            ],
            buttons: [
                {
                    text: this.texts.phone.cancel,
                    handler: () => {
                        console.log('resend from cancel');
                        this.resend();
                    }
                },
                {
                    text: this.texts.phone.update,
                    handler: (alertData) => {
                        console.log('resend from update');
                        this.updatePhone(alertData.phone);
                    }
                },

            ]
        }).then(alert => alert.present());
    }


    checkEmail() {
        this.emailUpdated = this.emailError = '';

        this.api.alertCtrl.create({
            header: this.texts.email.header,
            subHeader: this.texts.email.subheader,
            animated: true,
            inputs: [
                {
                    type: 'email',
                    name: 'email',
                    value: this.email,
                    label: this.texts.email.label,

                }
            ],
            buttons: [
                {
                    text: this.texts.email.cancel,
                    handler: () => {
                        this.resend();
                    }
                },
                {
                    text: this.texts.email.update,
                    handler: (alertData) => {
                        this.updateEmail(alertData.email);
                    }
                },

            ]
        }).then(alert => alert.present());
    }


    updatePhone(newPhone) {
        this.api.http.post(this.api.apiUrl + '/updates/phones', {phone: newPhone}, this.api.header).subscribe((data: any) => {
            if (data.success) {
                this.phoneUpdated = data.message;
                this.resend();
            } else {
                this.phoneError = data.error;
            }
        });
    }

    updateEmail(newEmail) {
        this.api.http.post(this.api.apiUrl + '/updates/emails', {email: newEmail}, this.api.header).subscribe((data: any) => {
            if (data.success) {
                this.emailUpdated = data.message;
                this.resend();
            } else {
                this.emailError = data.error;
            }
        });
    }


    resend() {
        // alert(1);
        this.canResend = false;
        this.api.http.post(this.api.apiUrl + '/resends', {}, this.api.header).subscribe((data: any) => {
            this.api.toastCreate(data.message);
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
                this.events.publish('status:login');
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
            this.errors.email = 'An invalid email address';
            isValid = false;
        }
        if (!this.contact.subject.value.trim()) {
            this.errors.subject = 'Enter please a subject';
            isValid = false;
        }
        if (!this.contact.text.value.trim()) {
            this.errors.text = 'Enter please a message';
            isValid = false;
        }

        if (isValid) {

            // if (this.contact.email.value.trim() && this.contact.text.value.trim() && this.contact.subject.value.trim()) {
            const params = {
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
        this.resend();
    }

    // }
}
