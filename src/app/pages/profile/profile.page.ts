import {Component, OnInit, ViewChild} from '@angular/core';
import {ApiQuery} from '../../api.service';
import {IonContent} from '@ionic/angular';
import {Router, ActivatedRoute} from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import {Platform} from '@ionic/angular';
import * as $ from 'jquery';
import {User} from '../../../interfaces/user';
@Component({
    selector: 'page-profile',
    templateUrl: 'profile.page.html',
    styleUrls: ['profile.page.scss']
})
export class ProfilePage implements OnInit {
    @ViewChild(IonContent, {static: false}) content: IonContent;


    isAbuseOpen: any = false;

    user: User;
    texts: { lock: any, unlock: any } = {lock: '', unlock: ''};

    formReportAbuse: { title: any, buttons: { cancel: any, submit: any }, text: { label: any, name: any, value: any } } =
        {title: '', buttons: {cancel: '', submit: ''}, text: {label: '', name: '', value: ''}};

    myId: any = false;

    myProfile = false;

    userFormKeys: any;

    constructor(public api: ApiQuery,
                public router: Router,
                public route: ActivatedRoute,
                public keyboard: Keyboard,
                private changeRef: ChangeDetectorRef,
                public platform: Platform,
    ) {

    }


    ngOnInit() {
        this.user = {
            age: 0,
            canWriteTo: false,
            form: {
                about: undefined,
                body: undefined,
                children: undefined,
                city: undefined,
                distance: '',
                gender: undefined,
                height: undefined,
                looking: '',
                lookingFor: undefined,
                nutrition: undefined,
                origin: undefined,
                region_name: undefined,
                relationshipStatus: undefined,
                relationshipType: undefined,
                religion: undefined,
                sexOrientation: undefined,
                smoking: undefined,
                zodiac: undefined
            },
            formReportAbuse: undefined,
            hebrewUsername: false,
            id: 0,
            isAddBlackListed: false,
            isAddFavorite: false,
            isAddLike: false,
            isAddVerify: false,
            isNew: false,
            isOnline: false,
            isPaying: false,
            isVerify: false,
            isVip: false,
            noPhoto: '',
            photoStatus: '',
            textCantWrite: '',
            texts: undefined,
            username: '',
            photos: [],
        };
        this.route.queryParams.subscribe((params: any) => {
            if (params.data) {
                const passedUser = JSON.parse(params.data).user;
                if (this.api.usersCache[passedUser.id]) {
                    this.user = this.api.usersCache[passedUser.id];
                    this.userFormKeys = this.getKeys(this.user.form);
                } else {
                    this.user.photos = [
                        {
                            id: 0,
                            isMain: true,
                            isValid: true,
                            url: passedUser.photo,
                            face: '',
                            isPrivate: false,
                        }
                    ];
                    this.user.age = passedUser.age;
                    this.user.username = passedUser.username;
                    this.user.id = passedUser.id;
                    this.user.canWriteTo = passedUser.canWriteTo;
                    this.user.form.region_name = passedUser.region_name;
                    this.user.form.distance = passedUser.distance;
                    this.user.isPaying = passedUser.isPaying;
                    this.user.isAddBlackListed = passedUser.isAddBlackListed;
                    this.user.isAddFavorite = passedUser.isAddFavorite;
                    this.user.isAddLike = passedUser.isAddLike;
                    this.user.isNew = passedUser.isNew;
                    this.user.isOnline = passedUser.isOnline;
                    this.user.isPaying = passedUser.isPaying;
                    this.user.isVerify = passedUser.isVerify;
                }
                this.getUser();
            } else {
                this.api.storage.get('user_data').then(userData => {
                    this.user.id = userData.user_id;
                    this.myId = userData.user_id;
                    this.user.username = userData.username;
                    this.user.photos = [
                        {
                            id: 0,
                            face: '',
                            isMain: true,
                            isValid: true,
                            isPrivate: false,
                            url: userData.user_photo
                        }
                    ];
                    this.myProfile = true;
                    this.getUser();
                    this.api.hideLoad();
                });
            }
        });
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
        const userId = this.user.id;

        this.api.http.get(this.api.apiUrl + '/users/' + userId, this.api.setHeaders(true)).subscribe((data: any) => {
            this.api.usersCache[userId] = this.user = data;
            this.userFormKeys = this.getKeys(data.form);
            this.formReportAbuse = data.formReportAbuse;
            this.changeRef.detectChanges();
        });

    }




    addFavorites(user) {
        let params;
        if (user.isAddFavorite == false) {
            user.isAddFavorite = true;
            params = JSON.stringify({
                list: 'Favorite'
            });
        } else {
            user.isAddFavorite = false;
            params = JSON.stringify({
                list: 'Favorite',
                action: 'delete'
            });
        }
        this.api.http.post(this.api.apiUrl + '/lists/' + user.id, params, this.api.setHeaders(true)).subscribe((data:any) => {
            this.api.toastCreate(data.success, 2500);
        });
    }

    blockSubmit() {
        const params = JSON.stringify({
            list: 'BlackList',
            action: this.user.isAddBlackListed ? 'delete' : 'create',
        });
        this.user.isAddBlackListed = !this.user.isAddBlackListed;
        this.api.http.post(this.api.apiUrl + '/lists/' + this.user.id, params, this.api.setHeaders(true))
            .subscribe((data: any) => this.api.toastCreate(data.success));
    }

    addLike(user) {
        user.isAddLike = true;
        this.api.toastCreate('You liked ' + user.username);
        const params = JSON.stringify({
            toUser: user.id,
        });
        this.api.http.post(this.api.apiUrl + '/likes/' + user.id, params, this.api.setHeaders(true)).subscribe();
    }

    addVerify() {
        this.user.isAddVerify = true;
        this.api.http.post(this.api.apiUrl + '/verifies/' + this.user.id, {user: this.user.id}, this.api.header).subscribe((data: any) => {
            if (data.success) {
                this.api.toastCreate(data.message);
            } else {
                this.user.isAddVerify = false;
            }
        });
    }

    fullPagePhotos(isPrivate) {
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
        this.reportAbuseClose();``
    }

    ionViewWillLeave() {
        this.keyboard.hide();
        this.api.back = true;
        setTimeout( () => {
            this.api.back = false;
        }, 8000);
        $(document).off();
    }

}
