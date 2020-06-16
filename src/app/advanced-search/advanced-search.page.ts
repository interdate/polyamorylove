import {Component, OnInit} from '@angular/core';
import { ApiQuery } from '../api.service';
import { HomePage } from '../home/home.page';
import {Router, NavigationExtras} from "@angular/router";
import {SelectModalPage} from "../select-modal/select-modal.page";
import {ModalController} from "@ionic/angular";
import {forEach} from "@angular-devkit/schematics";

/*
 Generated class for the AdvancedSearch page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-advanced-search',
  templateUrl: 'advanced-search.page.html',
  styleUrls: ['advanced-search.page.scss']
})
export class AdvancedSearchPage implements OnInit {

  form:any;
  fromCache:any;
  formKeys: any;
  usersChooses: any = {};

  ageLower: any = 20;
  ageUpper: any = 50;

  ages: Array<{ num: number }> = [];

  default_range: any = { lower: this.ageLower, upper: this.ageUpper };

  constructor(
      //public navCtrl: NavController,
      public modalCtrl: ModalController,
      public router: Router,
      public api: ApiQuery
  ) {}


  ngOnInit() {
    this.api.storage.get('searchParams').then(params => {
     // console.log(params);
      if (params) {
        this.fromCache = true;
        this.form = params.form;
        this.usersChooses = params.chooses;
        this.formKeys = this.getKeys(params.form);
      } else {
        this.fromCache = false;
        this.api.http.get( this.api.url + '/api/v2/he/search?advanced=1', this.api.setHeaders(true) ).subscribe(data => {
          console.log(data);
          this.form = data;
          this.form.ageFrom.label = 'גיל מ';
          this.form.ageTo.label = 'גיל עד';
          this.form.heightFrom.label = 'גובה מ';
          this.form.heightTo.label = 'גובה עד';
          for (let i = 18; i <= 80; i++) {
            this.ages.push({num: i});
          }
          this.formKeys = this.getKeys(data);
          if(this.api.isLoading) {
            this.api.hideLoad();
          }
        },err => {
          console.log("Oops!");
        });

      }

    });


  }
  async openSelect2(field, fieldTitle) {

   // console.log(field);
    const modal = await this.modalCtrl.create({
      component: SelectModalPage,
      componentProps: {
        choices: field.choices,
        title: field.label,
        choseNow: this.usersChooses[fieldTitle]
      }
    });
    await modal.present();

    modal.onDidDismiss().then(data => {
     // console.log(data);

      this.form[fieldTitle].value = data.data.value;
      this.usersChooses[fieldTitle] = data.data.label;
      //console.log(this.usersChooses);
    });

  }

  resetForm(){
    this.api.storage.remove('searchParams').then(data => {
      //this.router.navigate(['advanced-search']);
      this.usersChooses = [];
      this.api.showLoad();
      this.ngOnInit();
    });
  }


  getKeys(obj) {
    return Object.keys(obj);
  }


  toSearchResultsPage() {

    this.api.storage.set('searchParams', {
      form: this.form,
      chooses: this.usersChooses
    });

    const params = JSON.stringify({
      action: 'search',
      advanced_search: {

        ageFrom: this.form.ageFrom.value,
        ageTo: this.form.ageTo.value,
        body: this.form.body.value,
        lookingFor: this.form.lookingFor.value,
        gender: this.form.gender.value,
        origin: this.form.origin.value,
        filter: this.form.filter.value,
        heightFrom: this.form.heightFrom.value,
        heightTo: this.form.heightTo.value,
        region: this.form.region.value,
        relationshipStatus: this.form.relationshipStatus.value,
        relationshipType: this.form.relationshipType.value,
        sexOrientation: this.form.sexOrientation.value,
        smoking: this.form.smoking.value,
        withPhoto: this.form.withPhoto.value,
        zodiac: this.form.zodiac.value,
      },
    });
    // for (const field in this.form ) {
    //   let arr = {};
    //   arr[]
    // }
    const navigationExtras: NavigationExtras = {
      queryParams: {
        params: params
      }
    };
    this.router.navigate(['/home'], navigationExtras);
  }






  // selectedRegion()
  // {
  //   this.api.http.get(this.api.url+'/api/v2/he/search?advanced=1&advanced_search[region]='+this.form.form.region.value,this.api.setHeaders(true)).subscribe((data => {
  //     this.form.form.area = data.area;
  //     console.log(data);
  //   },err => {
  //     console.log("Oops!");
  //   }));
  // }

  getAgeValues(event) {
    if( event.value.upper != 0) {
      this.ageUpper = event.value.upper;
    }
    if( event.value.lower != 0) {
      this.ageLower = event.value.lower;
    }
  //  console.log(event);
  }

  ionViewDidLoad() {
  //  console.log('ionViewDidLoad AdvancedSearchPage');
  }

  ionViewWillEnter() {
    this.api.pageName = 'AdvancedSearchPage';
  }
}
