import {Component, ViewChild} from '@angular/core';
import { AdvancedSearchPage } from '../advanced-search/advanced-search.page';
import { HomePage } from '../home/home.page';
import { ApiQuery } from '../api.service';
import {Router, NavigationExtras} from "@angular/router";
import {SelectModalPage} from "../select-modal/select-modal.page";
import {ModalController} from "@ionic/angular";
import {IonContent} from "@ionic/angular";
import * as $ from 'jquery';
import {FormService} from "../form.service";

/*
 Generated class for the Search page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-search',
  templateUrl: 'search.page.html',
  styleUrls: ['./search.page.scss']
})
export class SearchPage {

  @ViewChild(IonContent, {static: false}) content: IonContent;

  usersChooses: any = {};

  age: any;
  areas: Array<{ title: any }>;
  ages: Array<{ num: number }> = [];

  type_search: any = "";
  form: any;
  // = {
  //   form: {
  //     username: {},
  //     region: { choices: [[]], },
  //     city: { choices: [[]], },
  //     ageFrom: {choices: [[]], label: ''},
  //     ageTo: {choices: [[]], label: ''},
  //     gender: {choices: [[]], label: ''},
  //     lookingFor: {choices: [[]], label: ''},
  //   }
  // } ;


  ageLower: any = 20;
  ageUpper: any = 50;
  showThereFor = false;

  default_range: any = { lower: this.ageLower, upper: this.ageUpper }

  constructor(
      public router: Router,
      public api: ApiQuery,
      public modalCtrl: ModalController,
      private fs: FormService,
  ) {

    // this.age = {
    //   'lower': this.form.form.ageFrom.value,
    //   'upper': this.form.form.ageTo.value
    // };
    //
    // for (let i = 18; i <= 80; i++) {
    //   this.ages.push({num: i});
    // }

    //this.form.form.ageFrom.value = 20;
    //this.form.form.ageTo.value = 50;
    //console.log(this.form);

    this.getSearchData();
    window.addEventListener('keyboardWillShow', this.onKeyboardShow);
    window.addEventListener('keyboardWillHide', this.onKeyboardHide);

  }

  getSearchData(){
    this.api.http.get( this.api.apiUrl + '/search?advanced=0', this.api.setHeaders(true) ).subscribe((data: any) => {
      this.showThereFor = data.showThereFor;
      // alert(this.showThereFor)
      this.form = data;
      this.form.ageFrom.label = 'גיל מ';
      this.form.ageTo.label = 'גיל עד';
      // this.form.form.heightFrom.label = 'גובה מ';
      // this.form.form.heightTo.label = 'גובה עד';

      // this.form.form.gender.label = '';
      console.log(this.form);

    },err => {
      console.log("Oops!");
    });
  }

  onKeyboardShow() {
    $('.footerMenu').hide();
    $('.search-container').css({
      'max-height': 'calc(100% + 70px)'
    });
    setTimeout(()=>{
      this.content.scrollToBottom(100);
    }, 300);
  }

  onKeyboardHide() {
    $('.search-container').css({
      'max-height': 'calc(100% - 60px)'
    });
    $('.footerMenu').show();
  }

  SeachForm1(search_type) {
    console.log(this.form);
    this.toSearchResultsPage('search-form-1');
  }


  ionViewDidLoad() {
    this.type_search = 'search-1';
    $('.input-wrapper').delegate('.search-1','click', function() {
    });
  }

  async openSelect2(fieldTitle) {

    this.fs.openSelect2(this.form, fieldTitle, this.usersChooses).then(data => console.log(data));

  }

  toSearchResultsPage(search_type) {
    let params;
    if ( search_type == 'search-form-1' ) {
      console.log(this.ageLower);
      console.log(this.ageUpper);

      params = JSON.stringify({
        action: 'search',
        filter: 'lastActivity',
        quick_search: {
          region: this.form.region.value,
          city: this.form.city.value,
          ageFrom: this.form.ageFrom.value,
          ageTo: this.form.ageTo.value,
          gender: this.form.gender.value,
          lookingFor: this.form.lookingFor.value,
        }
      });
      //this.api.data['params'] = params;
      //this.router.navigate(['/home']);
    }else{
      params = JSON.stringify({
        action: 'search',
        filter: "lastActivity",
        quick_search: {
          username: this.form.username.value
        }
      });
      //this.api.data['params'] = params;
      //this.router.navigate(['/home']);
    }

    let navigationExtras: NavigationExtras = {
      queryParams: {
        params: params
      }
    };
    this.router.navigate(['/home'], navigationExtras);
  }



  getAgeValues(event) {
    if( event.value.upper != 0) {
      this.ageUpper = event.value.upper;
    }
    if( event.value.lower != 0) {
      this.ageLower = event.value.lower;
    }
  }

  showFooter() {
    $('.footerMenu').show();
  }

  hideFooter() {
    $('.footerMenu').hide();
  }


  toAdvancedPage() {
    this.router.navigate(['/advanced-search']);
  }

  selectLookingFor() {
    $('.selectLookingFor').click();
  }

  ionViewWillEnter() {
    this.getSearchData();
    this.api.pageName = 'SearchPage';
  }

  ionViewWillLeave() {
    $('.footerMenu').show();
    window.removeEventListener('keyboardWillShow', this.onKeyboardShow);
    window.removeEventListener('keyboardWillHide', this.onKeyboardHide);
  }

}
