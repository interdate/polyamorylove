import {Component, OnInit, ViewChild} from '@angular/core';
import {ApiQuery} from '../api.service';
import {Router} from '@angular/router';
import {AlertController, IonContent} from '@ionic/angular';
import * as $ from 'jquery';
import {AnimationBuilder, Mode} from "@ionic/core";
import {AlertButton, AlertInput} from "@ionic/core/dist/types/components/alert/alert-interface";
import {present} from "@ionic/core/dist/types/utils/overlays";

/*
 Generated class for the FreezeAccount page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-freeze-account',
  templateUrl: 'freeze-account.page.html',
  styleUrls: ['freeze-account.page.scss']
})
export class FreezeAccountPage implements OnInit {
  @ViewChild(IonContent, {static: false}) content: IonContent;

  public form: any = {text: {value: ''}, description: ''};

  public err: any = {status: '', text: ''};

  data: any;

  allfields = '';

  constructor(public api: ApiQuery,
              public router: Router,
              public alertCtrl: AlertController) {}



  ngOnInit() {
    this.api.http.get(this.api.apiUrl + '/freeze', this.api.header).subscribe((data: any) => {
      this.form.description = data.description;
      this.err.text = data.error;
      this.data = data;
    });
  }

  submit() {

    if (this.form.text.value == '') {
      this.allfields = 'Enter please your frozen reason';
    } else {
        this.alertCtrl.create({
          header: this.data.pop.header,
          message: this.data.pop.message,
          buttons: [
            {
              text: this.data.pop.btns.agree,
              handler:  () => {
                  const params = JSON.stringify({
                      'freeze_account_reason': this.form.text.value
                  });
                  this.api.http.post(this.api.apiUrl + '/freezes', params, this.api.header).subscribe((data:any) => this.validate(data));
                  this.api.data['_id'] = 'logout';
                  this.router.navigate(['/login']);
              }
            },
            {
              text: this.data.pop.btns.cancel,
              role: 'cancel'
            }
          ],
        }).then(alert => alert.present());


    }

  }

  onOpenKeyboard() {
    $('.footerMenu').hide();
    setTimeout( () => {
      this.content.scrollToBottom(100);
    }, 300 );
  }

  onCloseKeyboard() {
    $('.footerMenu').show();
  }

  validate(response) {
    console.log(response);
  }

  ionViewWillEnter() {
    this.api.pageName = 'FreezeAccountPage';
  }

}
