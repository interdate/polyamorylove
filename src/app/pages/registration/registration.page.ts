import {Component, OnInit, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ApiQuery} from '../../api.service';
import * as $ from 'jquery';
// //import {Http, Headers} from '@angular/http';
// import { RequestOptions} from '@angular/http';
import {SelectModalPage} from '../select-modal/select-modal.page';
import {AlertController, ModalController} from '@ionic/angular';
import {Router, NavigationExtras, ActivatedRoute} from '@angular/router';
import {HttpHeaders} from '@angular/common/http';
import {Events} from '@ionic/angular';
import {IonContent} from '@ionic/angular';


/*
 Generated class for the One page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */


@Component({
    selector: 'page-registration',
    templateUrl: 'registration.page.html',
    styleUrls: ['registration.page.scss'],
    //providers: [Storage]
})

export class RegistrationPage implements OnInit {

    @ViewChild(IonContent, {static: false}) content: IonContent;

    cityname: any = '';
    data: any = {};
    usersChooses: any = {};
    form: any = {};
    err: any = {};
    errKeys: any;
    formKeys: any;
    user: any = {};
    name: any;
    birth: any;
    allfields = '';
    facebookId: any;
    username: string;
    email: string;


    constructor(public api: ApiQuery,
                public modalCtrl: ModalController,
                public router: Router,
                public route: ActivatedRoute,
                public events: Events,
                public alertCtrl: AlertController) {}

    ngOnInit() {
        this.api.showLoad();
        this.api.http.post(this.api.openUrl + '/signs/ups/news.json', {}, this.api.setHeaders()).subscribe((res: any) => {

            this.form = res.user.form;
            this.formKeys = Object.keys(this.form); this.api.hideLoad();
            this.getFacebookData();

        }, err => {
            console.log('Oops!');
            this.api.hideLoad();

        });
    }

    getFacebookData() {
        this.route.queryParams.subscribe((params: any) => {
            const data = JSON.parse(params.params);
            if (data.user) {
                this.facebookId = data.user.facebookId;
                this.form.email.value = data.user.email;
            }
        });
    }

    isObject(val) {
        return typeof val == 'object';
    }

    isArray(val) {
        return Array.isArray(val);
    }

    async openSelect2(field, fieldTitle) {

        // alert(1);

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
              ;
            }
        });

    }

    openHelp() {
        this.alertCtrl.create({
            header: this.form.relationshipTypeHelper.header,
            message: this.form.relationshipTypeHelper.message,

            buttons: [
                {
                    text: this.form.relationshipTypeHelper.cancel
                },
            ]
        }).then(alert => alert.present());
    }

    getKeys(obj) {
        return Object.keys(obj);
    }

    maxYear() {
        return new Date().getFullYear() - 18;
    }

    minYear() {
        return new Date().getFullYear() - 99;
    }
    onOpenKeyboard()  {
        $('.footerMenu').hide();
        $('.container').css({
            'margin': '11px auto 197px!important'
        });
    }


    onHideKeyboard() {
      $('.container').css({
          'margin': '11px auto 69px!important'
      });
      $('.footerMenu').show();
    }

    formSubmit() {

        this.err = {};
        this.allfields = '';
        this.api.showLoad();

        let data: any;

        if (this.form.step == 1) {
            this.user = {
                username: this.form.username.value,
                password: this.form.password.first.value,
                email:  this.form.email.value,
                gender: this.form.gender.value,
                phone: this.form.phone.value,
                facebookId: this.facebookId
            };


            data = {
                signUpOne: {
                    username: this.form.username.value,
                    email:  this.form.email.value,
                    password: {
                        first: this.form.password.first.value,
                        second: this.form.password.second.value
                    },
                    gender: this.form.gender.value,
                    phone: this.form.phone.value,
                }
            };

        } else if (this.form.step == 2) {
            var date_arr = ['', '', ''];
            if (typeof this.birth != 'undefined') {
                date_arr = this.birth.split('-');
            }

            this.user.relationshipStatus = this.form.relationshipStatus.value;
            this.user.region = this.form.region.value;
            this.user.city = this.form.city.value;
            this.user.sexOrientation = this.form.sexOrientation.value;
            this.user.height = this.form.height.value? this.form.height.value : 160;
            this.user.body = this.form.body.value;
            this.user.relationshipType = this.form.relationshipType.value;
            this.user.lookingFor = this.form.lookingFor.value;
            this.user.origin = this.form.origin.value;
            this.user.smoking = this.form.smoking.value;
            this.user.birthday = {
                day: parseInt(date_arr[2]),
                month: parseInt(date_arr[1]),
                year: parseInt(date_arr[0])
            },

            data = {
                signUpTwo: {
                    relationshipStatus: this.form.relationshipStatus.value,
                    region: this.form.region.value,
                    city: this.form.city.value,
                    sexOrientation: this.form.sexOrientation.value,
                    height: this.form.height.value? this.form.height.value : '160',
                    body: this.form.body.value,
                    relationshipType: this.form.relationshipType.value,
                    lookingFor: this.form.lookingFor.value,
                    origin: this.form.origin.value,
                    smoking: this.form.smoking.value,
                    birthday: {
                        day: parseInt(date_arr[2]),
                        month: parseInt(date_arr[1]),
                        year: parseInt(date_arr[0])
                    },
                }
            };
            data = JSON.stringify(data);

        } else if (this.form.step == 3) {

            this.user.about = this.form.about.value;
            this.user.looking = this.form.looking.value;
            this.user.contactGender = this.form.contactGender.value;
            this.user.ageTo = this.form.ageTo.value;
            this.user.ageFrom = this.form.ageFrom.value;
            this.user.agree = this.form.agree.value;

            data = {
                user: this.user,
                signUpTwo: {
                    about: this.form.about.value,
                    looking: this.form.looking.value,
                    contactGender: this.form.contactGender.value,
                    ageTo: this.form.ageTo.value,
                    ageFrom: this.form.ageFrom.value,
                    agree: this.form.agree.value,
                }
            };
            data = JSON.stringify(data);

        }
        console.log(data);
        this.api.http.post(this.api.openUrl + '/signs/ups/news.json', data, this.api.setHeaders()).subscribe((res:any) => {
            this.validate(res);
        }), err => this.api.hideLoad();
    }


    validate(response) {
        this.err = [];
        if(parseInt(response.id) > 0) { // step 4

            this.api.setHeaders(true, this.user.username, this.user.password);

            this.api.storage.set('user_data', {
                username: this.user.username,
                password: this.user.password,
                status: 'login',
                user_id: response.id,
                user_photo: response.photo
            });
            this.api.userId = response.id;
            this.events.publish('status:login');
            this.api.storage.get('deviceToken').then((val) => {
               this.api.sendPhoneId(val);
           });
            const data = {
               // status: 'init',
                username: this.user.username,
                password: this.user.password
            };
            this.api.storage.set('', data);

            const navigationExtras: NavigationExtras = {
                queryParams: {
                    new_user: true
                }
            };
            this.api.setLocation();
            this.router.navigate(['/change-photos'], navigationExtras);
        }
        else if (typeof response.user.form.step != 'undefined' && response.user.form.step == (this.form.step + 1)) {
            this.form = response.user.form;
            this.formKeys = this.getKeys(this.form);
            if (this.form.step == 2) {
                 // delete option gey for womans ond lesbit for mans
                if(this.user.gender == 1 || this.user.gender == 4) {
                 this.form.sexOrientation.choices.splice(2, 1);
                } else if(this.user.gender == 2 || this.user.gender == 3) {
                    this.form.sexOrientation.choices.splice(1, 1);
                }
            } else if (this.form.step == 3) {
                this.usersChooses.ageFrom = response.user.form.ageFrom.value;
                this.usersChooses.ageTo = response.user.form.ageTo.value;
            }
            this.content.scrollToTop(0);

        } else {
                if (this.form.step == 1) {
                    response.user.form.password.first = this.form.password.first;
                    response.user.form.password.second = this.form.password.second;
                } else if(this.form.step == 2){
                    response.user.form.lookingFor = this.form.lookingFor;
                } else if(this.form.step == 3){
                    response.user.form.agree = this.form.agree;
                    response.user.form.contactGender = this.form.contactGender;

                }
                this.form = response.user.form;
                this.formKeys = this.getKeys(this.form);
                setTimeout( () => {
                    let y = this.form.step == 3 ? $('.border-red').offset().top : $('.border-red').offset().top ;
                    this.content.scrollToPoint(null, y, 300);
                }, 300 );
           // }



            this.err = response.user.errors.form.children;
            if(this.err.length > 1) {
                this.errKeys = Object.keys(this.err);
            }
            else {
                this.allfields = 'Fill please all marker as require fields';
            }

        }


        this.api.hideLoad();
    }

    getPage(id) {
        const navigationExtras: NavigationExtras = {
            state: {
                id: id
            }
        };
        alert(id);
        this.router.navigate(['/page'], navigationExtras);
    }

    setHeaders() {
        let myHeaders = new HttpHeaders();
        myHeaders = myHeaders.append('username', this.form.login.username.value);
        myHeaders = myHeaders.append('password', this.form.login.password.value);
        myHeaders = myHeaders.append('Content-type', 'application/json');
        myHeaders = myHeaders.append('Accept', '*/*');
        myHeaders = myHeaders.append('Access-Control-Allow-Origin', '*');

        const header = {
            headers: myHeaders
        };
        return header;
    }


    ionViewWillEnter() {
        this.api.pageName = 'RegistrationPage';
    }
}
