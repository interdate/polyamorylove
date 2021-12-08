import {Component, ViewChild, OnInit, ElementRef} from '@angular/core';
import {ToastController, Events, ModalController, IonRouterOutlet, NavController} from '@ionic/angular';
import {ApiQuery} from '../../api.service';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {Router, ActivatedRoute, NavigationEnd, NavigationExtras} from '@angular/router';
import {IonInfiniteScroll} from '@ionic/angular';
import {IonContent} from '@ionic/angular';
import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import * as $ from 'jquery';
import {ChangeDetectorRef} from '@angular/core';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {log} from "util";
import {collectExternalReferences} from "@angular/compiler";
import {ShortUser} from "../../../interfaces/short-user";


@Component({
    selector: 'page-home',
    styleUrls: ['./home.page.scss'],
    templateUrl: 'home.page.html',
    providers: [Geolocation]
})
export class HomePage implements OnInit {

    @ViewChild(IonContent, {static: false}) content: IonContent;
    @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;
    @ViewChild(IonRouterOutlet, {static: false}) routerOutlet: IonRouterOutlet;

    public options: { filter: any } = {filter: 1};
    list: any;
    action: any;
    offset: any;
    //page_counter: any;
    loader: any = true;
    username: any;
    password: any;
    blocked_img: any = false;
    user_counter: any = 0;
    form_filter: any;
    filter: any = {filter: '', visible: ''};
    users: ShortUser[];
    texts: any;
    params: any = {action: 'online', filter: 'lastActivity', page: 1, list: ''};
    params_str: any;
    scrolling = false;
    clicked: any;
    subscription: any;
    paramsSubs: any;

    ids: any = [];

    constructor(public api: ApiQuery,
                public route: ActivatedRoute,
                public router: Router,
                public geolocation: Geolocation,
                public events: Events,
                public splashScreen: SplashScreen,
                public platform: Platform,
                public changeRef: ChangeDetectorRef,
                public iap: InAppBrowser,
                public navCtrl: NavController) {

        this.api.storage.get('user_data').then((val) => {
            if (val) {
                this.api.setHeaders(true, val.username, val.password, true).then(() => {
                    this.getUsers(true);
                });
            }
        });
    }


    ngOnInit() {
        this.loader = true;
        this.route.queryParams.subscribe((params: any) => {
            if (params && params.params && !this.api.back) {
                this.params_str = params.params;
                this.params = JSON.parse(params.params);
            } else  if (!this.api.back) {
                this.params =  {
                    action: 'online',
                    filter: this.api.data['filter'] ? this.api.data['filter'] : 'lastActivity',
                    list: '',
                    page: 1
                };
            }

            this.blocked_img = this.params.list === 'black' || this.params.list === 'favorited';
            this.params_str = JSON.stringify(this.params);
            this.api.back = false;

            if (!this.api.checkedPage || this.api.checkedPage === '' || this.api.checkedPage === 'logout') {
                this.api.checkedPage = 'online';
            }
        });
        this.api.storage.get('deviceToken').then(token => {
            if (token) {
                this.api.sendPhoneId(token);
            }
            this.api.back = false;
        });



        this.api.storage.get('afterLogin').then((data: any) => {

            if ( data != null ) {
                this.api.data['user'] = {id: data.user.id};

                this.router.navigate([data.url]).then(() => {
                    this.api.storage.remove('afterLogin');
                });
            }
        });
    }

    ionViewWillEnter() {
        this.paramsSubs = this.route.queryParams.subscribe((params: any) => {
            if ((this.api.pageName == 'LoginPage') || ((params.params) && (params.params.filter !== this.params.filter || this.params.action !== params.params.action))) {
                this.getUsers();
            }
        });

        $(document).on('backbutton', () => {
            if (this.router.url == '/home') {
                navigator['app'].exitApp();
            } else {
                this.api.onBack();
            }
        });

        this.events.subscribe('logo:click', () => {
            if (this.params.filter === 'online' || this.params.filter === 'search') {
                this.content.scrollToTop(200);
            } else {
                this.blocked_img = false;
                this.params = {
                    action: 'online',
                    page: 1,
                    filter: 'lastActivity',
                    list: ''
                };
                this.loader = true;
                this.getUsers();
            }
        });

        this.events.subscribe('footer:click', (params) => {
            this.params = JSON.parse(params.queryParams.params);
            this.getUsers();
        });
        this.api.pageName = 'HomePage';
    }

    ionViewWillLeave() {
        this.paramsSubs.unsubscribe();
        this.events.unsubscribe('logo:click');
        this.events.unsubscribe('footer:click');
        $(document).off();
    }

    filterStatus() {
        this.options.filter = this.options.filter === 1 ? 0 : 1;
    }

    toDialog(user) {
        this.api.data['user'] = user;
        this.router.navigate(['/dialog'], {state: {user: user}});
    }

    checkUnique(needUpdate = false) {
        let stop = false;
        if (needUpdate) {
            this.params.page++;
            this.params_str = JSON.stringify(this.params);
        }
        this.api.http.post(this.api.apiUrl + '/users/results', this.params_str, this.api.setHeaders(true))
            .subscribe((data: any) => {
                if (data.users.length) {
                    for (const user of data.users) {
                        if (stop) {
                            break;
                        }
                        if (this.ids.includes(user.id)) {
                            stop = true;
                        } else {
                            this.ids.push(user.id);
                        }
                    }
                    this.checkUnique(true);
                }
            });
    }

    ClickSortInput() {
        this.clicked = true;
    }

    sortBy() {
        this.params.filter = this.filter;
        this.api.data['filter'] = this.filter;
        this.loader = this.users.length < 10 ? false : true;
        this.params.page = 1;
        if (this.clicked) {
            this.api.showLoad();
            console.log('c')
            this.api.back = false;
            this.content.scrollToTop(500);
            this.getUsers();
            this.clicked = false;
        }

    }

    getUsers(test = false) {
        this.splashScreen.hide();
        if (!this.api.back || test === true) {
            if (!this.params.page) {
                this.params.page = 1;
            }
            this.params_str = JSON.stringify(this.params);
            this.api.http.post(this.api.apiUrl + '/users/results', this.params_str, this.api.header).subscribe((data: any) => {
                this.users = data.users;
                this.texts = data.texts;
                this.user_counter = data.users.length;
                this.form_filter = data.filters;
                this.filter = data.filter;
                if (data.users.length < 10) {
                    this.loader = false;
                } else {
                    this.loader = true;
                }
                this.changeRef.detectChanges();
                console.log(this.api.back)
                this.content.scrollToTop(0);
                this.api.hideLoad();
            }, err => {
                this.api.hideLoad();
            });

        } else {
            this.api.hideLoad();
        }
    }

    moreUsers(event) {
        if (this.loader) {
            this.params.page++;
            if (!this.params.page && !this.api.back) {
                this.params.page = 2;
            }
            this.params_str = JSON.stringify(this.params);
            this.api.http.post(this.api.apiUrl + '/users/results', this.params_str, this.api.setHeaders(true)).subscribe((data: any) => {
                if (data.users.length < 10) {
                    this.loader = false;
                }
                for (let person of data.users) {
                    this.users.push(person);
                }
            });
        }
        event.target.complete();
    }

    onScroll(event) {
        this.scrolling = true;
        $('.my-invisible-overlay').show();
    }

    endscroll(event) {
        setTimeout(() => {
            $('.my-invisible-overlay').hide();
            this.scrolling = false;
        }, 4000);
    }

    toVideoChat(user) {
        this.api.openVideoChat({id: user.id, chatId: 0, alert: false, username: user.username});
    }
}
