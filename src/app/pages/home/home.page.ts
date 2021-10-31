import {Component, ViewChild, OnInit,} from '@angular/core';
import {Events, IonRouterOutlet} from '@ionic/angular';
import {ApiQuery} from '../../api.service';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {Router, ActivatedRoute, NavigationExtras} from '@angular/router';
import {IonInfiniteScroll} from '@ionic/angular';
import {IonContent} from '@ionic/angular';
import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import * as $ from 'jquery';
import {ChangeDetectorRef} from '@angular/core';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';


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
    loader: any = true;
    username: any;
    password: any;
    blocked_img: any = false;
    user_counter: any = 0;
    form_filter: any;
    filter: any = {filter: '', visible: ''};
    users: any;
    texts: any;
    params: any = {action: 'online', filter: '', page: 1, list: ''};
    params_str: any;
    scrolling = false;
    clicked: any;
    subscription: any;


    constructor(public api: ApiQuery,
                public route: ActivatedRoute,
                public router: Router,
                public geolocation: Geolocation,
                public events: Events,
                public splashScreen: SplashScreen,
                public platform: Platform,
                public changeRef: ChangeDetectorRef,
                public iap: InAppBrowser) {

    }


    ngOnInit() {
        this.loader = true;
        this.route.queryParams.subscribe((params: any) => {
            if (params && params.params && !this.api.back) {
                this.params_str = params.params;
                this.params = JSON.parse(params.params);
                this.params.page = parseInt(this.params.page, 10);
            } else if (!this.api.back) {
                this.params = {
                    action: 'online',
                    filter: this.api.data['filter'] ? this.api.data['filter'] : 'lastActivity',
                    list: '',
                    page: 1
                };
            }

            this.blocked_img = false;
            this.params_str = JSON.stringify(this.params);
            if (this.params.list == 'black' || this.params.list == 'favorited') {
            }

            this.api.back = false;
            if (this.api.password) {
                this.getUsers(true);
            }
            this.getLocation();

            if (!this.api.checkedPage || this.api.checkedPage == '' || this.api.checkedPage == 'logout') {
                this.api.checkedPage = 'online';
            }
        });
// if not params and not ths params => set params and get users;
// if not params but yes this params then ignore;
        this.api.storage.get('deviceToken').then(token => {
            if (token) {
                this.api.sendPhoneId(token);
            }
            this.api.back = false;
            if (!this.users) {
                this.getUsers(true);
            }
        });

        $('ion-content').resize();

        this.api.storage.get('afterLogin').then((data: any) => {

            if (data != null) {
                this.api.data['user'] = {id: data.user.id};
                this.router.navigate([data.url]).then(() => {
                    this.api.storage.remove('afterLogin').then();
                });
            }
        });
    }


    ionViewWillEnter() {
        this.api.pageName = 'HomePage';
        this.events.subscribe('logo:click', () => {
            if (this.params.filter == 'online' || this.params.filter == 'search') {
                // this.content.scrollToTop(200);
            } else {
                this.blocked_img = false;
                this.params = {
                    action: 'online',
                    page: 1,
                    list: ''
                };
                this.params_str = JSON.stringify(this.params);
                this.loader = true;
                this.getUsers();
            }
        });

        this.events.subscribe('footer:click', (params) => {
            this.params = JSON.parse(params.queryParams.params);
            this.getUsers();
        });

        $(document).on('backbutton', () => {
            if (this.router.url == '/home') {
                navigator['app'].exitApp();
            } else {
                this.api.onBack();
            }
        });

    }

    ionViewWillLeave() {
        this.events.unsubscribe('logo:click');
        $(document).off();
    }

    itemTapped(user) {
        if (this.scrolling == false) {
            user.fullPhoto = user.photo;
            const navigationExtras: NavigationExtras = {
                queryParams: {
                    data: JSON.stringify({
                        user: user
                    })
                }
            };
            this.api.route.navigate(['/profile'], navigationExtras).then();
        }
    }

    filterStatus() {
        // options.filter should always be 1 or 0
        this.options.filter = 1 - this.options.filter;
    }

    toDialog(user) {
        this.api.data['user'] = user;
        this.router.navigate(['/dialog']).then();
    }

    addLike(user) {

        if (user.isAddLike == false) {

            user.isAddLike = true;
            this.api.toastCreate(' You liked ' + user.username, 2500).then();
            let params = JSON.stringify({
                toUser: user.id,
            });
            this.api.http.post(this.api.apiUrl + '/likes/' + user.id, params, this.api.setHeaders(true, this.username, this.password)).subscribe(data => {
            }, err => {
            });
        }
    }

    block(user, bool) {

        let params;

        if (user.isAddBlackListed == false && bool == true) {
            user.isAddBlackListed = true;

            params = {
                list: 'Favorite',
                action: 'delete'
            };

        } else if (user.isAddBlackListed == true && bool == false) {

            user.isAddBlackListed = false;

            params = {
                list: 'BlackList',
                action: 'delete'
            };
        }

        if (this.users.length == 1) {
            this.user_counter = 0;
        }

        // Remove user from list
        this.users.splice(this.users.indexOf(user), 1);
        this.events.publish('statistics:updated');

        this.api.http.post(this.api.apiUrl + '/lists/' + user.id, params, this.api.setHeaders(true)).subscribe((data: any) => {
            this.loader = true;
            this.api.toastCreate(data.success, 2500).then();
            if (data.users.length >= 9) {
                this.loader = false;
            }
            this.params.page = 1;
        });
    }

    addFavorites(user, bool = false) {

        let params;
        if (user.isAddFavorite == false) {
            user.isAddFavorite = true;
            params = JSON.stringify({
                list: 'Favorite'
            });
        } else {
            if (this.params.list == 'favorited') {
                bool = true;
            }
            user.isAddFavorite = false;
            params = JSON.stringify({
                list: 'Favorite',
                action: 'delete'
            });
        }


        if (bool) {
            this.users.splice(this.users.indexOf(user), 1);
        }
        this.api.http.post(this.api.apiUrl + '/lists/' + user.id, params, this.api.setHeaders(true)).subscribe((data: any) => {
            this.api.toastCreate(data.success, 2500).then();
            this.events.publish('statistics:updated');
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
        this.params_str = JSON.stringify(this.params);

        this.api.showLoad();
        this.api.back = false;
        this.content.scrollToTop(500).then();
        this.getUsers();
    }

    getUsers(test = false) {

        this.splashScreen.hide();
        if (!this.api.back || test === true) {
            if (!this.params.page) {
                this.params.page = 1;
                this.params_str = JSON.stringify(this.params);
            }
            this.api.http.post(this.api.apiUrl + '/users/results', this.params_str, this.api.setHeaders(true)).subscribe((data: any) => {

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
                this.api.hideLoad().then();
                this.content.scrollToTop(0).then();
            }, err => {
                // alert( 'getUsers data error: '  + JSON.stringify(err));
                this.api.hideLoad().then();
            });
        } else {
            this.api.hideLoad().then();
        }

    }

    getLocation() {
        this.geolocation.getCurrentPosition().then(pos => {
        });
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
        setTimeout( () =>{
            $('.my-invisible-overlay').hide();
            this.scrolling = false;
        }, 4000);
    }

    toVideoChat(user) {
        this.api.openVideoChat({id: user.id, chatId: 0, alert: false, username: user.username});
    }

}
