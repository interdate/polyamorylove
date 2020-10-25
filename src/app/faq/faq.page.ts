import {Component, OnInit} from '@angular/core';
import {ApiQuery} from '../api.service';

/*
 Generated class for the Faq page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */

import * as $ from 'jquery';
import {Router} from "@angular/router";
import {isArray} from "util";


@Component({
  selector: 'page-faq',
  templateUrl: 'faq.page.html',
  styleUrls: ['faq.page.scss']
})
export class FaqPage implements OnInit {

  page: any;

  hightlightStatus: any = [];


  constructor(public api: ApiQuery,
              public router: Router) {}


  status(name, quest) {
    this.hightlightStatus[name][quest] = this.hightlightStatus[name][quest] ? false : true;
  }

  ngOnInit() {
    this.api.http.get(this.api.openUrl + '/faq', this.api.header).subscribe((data: any) => {
      this.page = data.content;
      console.log(this.page);



      /**
       *  set to hightlightStatus a view status of each question by default (false)
       *
       */
      for (const qa of this.page) {
        console.log('qa: ' + JSON.stringify(qa));
        this.hightlightStatus[qa.name] = [];
        console.log('hightlightStatus: ' + this.hightlightStatus);
        if (isArray(qa.faq)) {
          for (const a of qa.faq) {
            console.log(a.q);
            this.hightlightStatus[qa.name][a.q] = false;
            // this.hightlightStatus[qa.name][a].push('false');
          }
        }

      }

      console.log(this.hightlightStatus);
    });
  }

  ionViewWillEnter() {
    this.api.pageName = 'FaqPage';
  }

}
