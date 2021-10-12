import {Component, OnInit} from '@angular/core';
import { ApiQuery } from '../../api.service';
import {Router} from '@angular/router';


/*
 Generated class for the Bingo page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-bingo',
  templateUrl: 'bingo.page.html',
  styleUrls: ['bingo.page.scss']
})
export class BingoPage implements OnInit {

  data: { user: any, texts: any };

  constructor(
      public router: Router,
      public api: ApiQuery) {}


  ngOnInit() {
    this.data = this.api.data['data'];
    console.log(this.data);
    this.data.texts.text = this.data.texts.text.replace('USERNAME',this.data.user.username);
  }

  toDialog() {
    this.data.user.id = this.data.user.contact_id;
    this.api.data['user'] = this.data.user;
    this.router.navigate(['/dialog']);
  }

  ionViewWillEnter() {
    this.api.pageName = 'BingoPage';
  }



}
