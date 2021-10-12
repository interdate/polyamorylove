import {Component, ViewChild, OnInit} from '@angular/core';
import {Events} from '@ionic/angular';
import {Injectable} from '@angular/core';
import {Router, NavigationExtras} from "@angular/router";
import {IonSlides} from "@ionic/angular";
import {ApiQuery} from "../../api.service";

@Component({
    selector: 'page-arena',
    templateUrl: 'arena.page.html',
    styleUrls: ['arena.page.scss']
})
@Injectable()
export class ArenaPage implements OnInit {

    @ViewChild(IonSlides, {static: false}) slides: IonSlides;

    users: any;
    texts: { like: string, add: string, message: string, remove: string, unblock: string, no_results: string };
    notifications: any;
    checkNotifications: any;
    user: any;
    index: any = 0;
    renderUsers: any = [];
    renderedUserCount: any = 0;
    realRenderedUserCount: any = 0;

    constructor(public events: Events,
                public router: Router,
                public api: ApiQuery) {
    }


    ngOnInit() {


    }

    slideChanged() {
        this.slides.getActiveIndex().then(index => this.index = index);
        if (this.index > this.realRenderedUserCount - 5 && this.realRenderedUserCount < this.users.length) {
            this.getUsers();
        }
    }

    getUsers() {
        let rendered = this.renderedUserCount;
        const num = (this.users.length - this.renderedUserCount > 10) ? 10 : this.users.length - this.renderedUserCount;
        this.renderedUserCount += num;
        this.realRenderedUserCount += num;
        for (let x = rendered; x < this.renderedUserCount; x++) {
            this.renderUsers.push(this.users[x]);
        }

        if (this.renderUsers.length > (this.users.length / 2)) {

            this.getUsers();

        }
    }

    setNotifications() {
        this.events.subscribe('user:created', (notifications) => {
            this.notifications = notifications;
        });
    }

    goToSlide(str) {
        const user = this.renderUsers[this.index];

        if (str == 'like') {
            const params = JSON.stringify({
                toUser: user.id,
            });
            this.api.http.post(this.api.apiUrl + '/likes/' + user.id, params, this.api.setHeaders(true)).subscribe(() => {
            });
            this.renderUsers.splice(this.index, 1);
            this.realRenderedUserCount--;
            this.slideChanged();
        } else {

            this.api.http.get(this.api.apiUrl + '/dislikes/' + user.id, this.api.header).subscribe(res => console.log(res));

            this.slides.isEnd().then(end => {
                this.renderUsers.splice(this.index, 1);
                this.realRenderedUserCount--;
                this.slideChanged();
                if (end) {
                    this.slides.slideTo(0, 300).then();
                }
            });
        }
    }

    toDialog() {
        this.api.data['user'] = this.renderUsers[this.index];
        this.router.navigate(['/dialog']).then();
    };


    toProfile() {
        const currentUser = this.renderUsers[this.index];
        currentUser.fullPhoto = currentUser.image;

        const navigationExtras: NavigationExtras = {
            queryParams: {
                data: JSON.stringify({
                    user: currentUser
                })
            }
        };
        this.router.navigate(['/profile'], navigationExtras).then();
    }

    swipe(side) {
        if (side == 'left') {
            this.slides.slideNext().then();
        } else {
            this.slides.slidePrev().then();
        }
    }

    toNotifications() {
        this.router.navigate(['/notification']).then();
    }

    ionViewDidLoad() {
    }


    ionViewDidEnter() {
        this.slides.update().then();
    }

    ionViewWillEnter() {
        this.api.pageName = 'ArenaPage';
        this.api.showLoad().then();
        let user_id = null;

        if (this.api.data['user']) {
            user_id = typeof this.api.data['user'] == 'object' ? this.api.data['user'].id : this.api.data['user']
        }

        let params = JSON.stringify({
            action: 'arena',
            user_id: user_id
        });

        this.api.http.post(this.api.apiUrl + '/users/results', params, this.api.setHeaders(true)).subscribe((data: any) => {
            this.users =  data.users;
            this.texts =  data.texts;
            this.getUsers();
            // If there's message, than user can't be on this page
            if (data.arenaStatus) {
                this.api.toastCreate(data.arenaStatus).then();
                this.router.navigate(['/change-photos']).then();
            }
        });
        this.api.hideLoad().then();
    }

}
