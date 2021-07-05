import {Component, ViewChild, OnInit} from '@angular/core';
import { Events} from '@ionic/angular';
import {ApiQuery} from '../api.service';
import {Injectable} from '@angular/core';
import {Router, NavigationExtras} from "@angular/router";
import {IonSlides} from "@ionic/angular";
import {log} from "util";
/*
 Generated class for the Arena page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-arena',
  templateUrl: 'arena.page.html',
  styleUrls: ['arena.page.scss']
})
@Injectable()
export class ArenaPage implements OnInit{

  @ViewChild(IonSlides, {static: false}) slides: IonSlides;


  users:any;

  texts: { like: string, add: string, message: string, remove: string, unblock: string, no_results: string  };
  notifications: any;
  checkNotifications: any;
  user:any;
  index:any = 0;
  renderUsers:any = [];
  renderedUserCount:any = 0;
  realRenderedUserCount:any = 0;

  constructor(public events: Events,
              public router: Router,
              public api: ApiQuery) {}


  ngOnInit() {

    this.api.showLoad();
    let user_id = null;

    if (this.api.data['user']) {
       user_id = typeof this.api.data['user'] == 'object' ? this.api.data['user'].id : this.api.data['user']
    }

    let params = JSON.stringify({
      action: 'arena',
      user_id: user_id
    });

    this.api.http.post(this.api.apiUrl + '/users/results', params, this.api.setHeaders(true)).subscribe((data: any) => {
      // console.log(data);
      this.users =  data.users;
      this.texts =  data.texts;
      this.getUsers();
      // If there's message, than user can't be on this page
      if (data.arenaStatus) {
        this.api.toastCreate(data.arenaStatus);
        this.router.navigate(['/change-photos']);
      }
    });
    this.api.hideLoad();
  }

  slideChanged(event?) {
    // alert(2);
    // alert('in slideChange');
    // console.log(this.renderedUserCount);
    // console.log(this.realRenderedUserCount);
    this.slides.getActiveIndex().then(index => this.index = index);
    // console.log('index after change in slideChange' + this.index);
    //   console.log(this.realRenderedUserCount, this.users.length);
    if (this.index > this.realRenderedUserCount - 5 && this.realRenderedUserCount < this.users.length) {
       this.getUsers();
    }
  }

  getUsers() {
    let rendered = this.renderedUserCount;
    // console.log(this.realRenderedUserCount, this.renderedUserCount);
    const num = (this.users.length - this.renderedUserCount > 10) ? 10 : this.users.length - this.renderedUserCount;
    this.renderedUserCount += num;
    this.realRenderedUserCount += num;
    for(let x = rendered; x < this.renderedUserCount; x++)  {
      this.renderUsers.push(this.users[x]);
      // console.log(this.users);
      // console.log(this.renderUsers);
      // console.log(this.renderedUserCount);
      // console.log(this.realRenderedUserCount);
    }

    if (this.renderUsers.length > (this.users.length / 2)) {

      this.getUsers();

    }
  }

  setNotifications() {
    this.events.subscribe('user:created', (notifications) => {
      // console.log('Welcome', notifications, 'at');
      this.notifications = notifications;
    });
  }

  goToSlide(str) {
    const user = this.renderUsers[this.index];

    if (str == 'like') {

      const params = JSON.stringify({
        toUser: user.id,
      });

      this.api.http.post(this.api.apiUrl + '/likes/' + user.id, params, this.api.setHeaders(true)).subscribe(data => {
        // console.log(data);
      });
      // this.slides.slideTo(this.index ,300);
      this.renderUsers.splice(this.index, 1);
      this.realRenderedUserCount--;
      this.slideChanged();
      // this.index++;


    } else {

      this.api.http.get(this.api.apiUrl + '/dislikes/' + user.id, this.api.header).subscribe(res => console.log(res));

      this.slides.isEnd().then(end => {
       // alert(1);
        console.log('index befor slice: ' + this.index);
        this.renderUsers.splice(this.index, 1);
        console.log('index after slice: ' + this.index);
        console.log(this.realRenderedUserCount);
        this.realRenderedUserCount--;
        this.slideChanged();
        if (end) {
        //  alert(2)
          this.slides.slideTo(0, 300);
        } else {
          //this.slides.slideTo(this.index + 1, 300);
        }
      });

      // if (this.slides.isEnd()) {
      //   //this.slides.slideNext();
      //   var that = this;
      //   //setTimeout(function () {
      //   this.slides.slideTo(0, 300);
      //   //this.slides.update();
      //   //}, 10);
      // } else {
      //   this.slides.slideTo(this.index + 1, 300);
      // }
    }
  }


  toDialog() {
    this.api.data['user'] = this.renderUsers[this.index];
    this.router.navigate(['/dialog']);
    };




  toProfile() {
    // this.api.data['user'] = this.users[this.index];
    console.log(this.renderUsers[this.index]);

   // this.renderUsers[this.index].url = this.renderUsers[this.index].image.replace('h_300,w_300', 'h_500,w_500');
    const currentUser = this.renderUsers[this.index];
    currentUser.fullPhoto = currentUser.image;

    const navigationExtras: NavigationExtras = {
      queryParams: {
        data: JSON.stringify({
          user:  currentUser
        })
      }
    };
    this.router.navigate(['/profile'], navigationExtras);
  }

  swipe(side) {
    if (side == 'right') {
      this.slides.slideNext();
    } else {
      this.slides.slidePrev();
    }
  }

  toNotifications() {
    this.router.navigate(['/notification']);
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad ArenaPage');
  }


  ionViewDidEnter() {
    this.slides.update();
  }

  ionViewWillEnter() {
    this.api.pageName = 'ArenaPage';
  }

}
