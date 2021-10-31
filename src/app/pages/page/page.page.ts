import {Component} from '@angular/core';
// import {NavController, NavParams, Nav} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiQuery} from '../../api.service';


/*
 Generated class for the Page page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-page',
  templateUrl: 'page.page.html',

})
export class PagePage {

  page: { title: any, content: any } = {title: '', content: ''};

  constructor(
              public api: ApiQuery,
              public router: Router) {

    const id = this.router.getCurrentNavigation().extras.state.id;

    this.api.http.get((this.api.url + id).replaceAll('//', '/'), this.api.setHeaders(false)).subscribe((data: any) => {
      this.page = data.page;
    }, err => {
      console.log('Oops!');
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PagePage');
  }

  ionViewWillEnter() {
    this.api.pageName = 'PagePage';
  }

}
