import {Component, OnInit, ViewChild} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {IonInfiniteScroll} from '@ionic/angular';
import * as $ from 'jquery';

@Component({
  selector: 'app-select-modal',
  templateUrl: 'select-modal.page.html',
  styleUrls: ['./select-modal.page.scss']
})
export class SelectModalPage implements OnInit {

  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

  constructor(
     public modalCtrl: ModalController,
  ) { }

  choices = [];
  title;
  choseNow;
  options: any = [];
  page: any = 1;
  count: any = 50;
  optAdd = true;
  search = false;

  ngOnInit() {
    this.addOption();
  }


  getItem(item) {
    this.modalCtrl.dismiss(item);
  }

  moreItems(event) {
    this.page++;
    this.addOption();
    event.target.complete();
  }

  close() {
    this.modalCtrl.dismiss('');
  }
  getItems(ev: any) {
    this.options = this.choices;
    const val = ev.target.value;

    if (val && val.trim() != '') {
      this.optAdd = false;
      this.options = this.options.filter((item) => {
        return (item.label.indexOf(val.toLowerCase()) > -1);
      });
    } else {
      this.optAdd = true;
      this.options = [];
      this.page = 1;
      this.addOption();
    }
  }

  addOption() {
    if (this.optAdd) {
      let start = 0;
      let finish = this.choices.length;
      if (this.page == 1 && finish > this.count) {
        finish = this.count;
      } else {
        start = this.count * (this.page - 1);
        finish = this.count * this.page;
        if (finish > this.choices.length) {
          finish = this.choices.length;
        }
      }
      // if(this.page == 2){
      //   start = 10;
      // }
      // alert(start + ':' + finish);
      let i: any = 0;
      for (const opt of this.choices) {
        // console.log(item);
        // alert(i >= start && i < finish);
        if (i >= start && i < finish) {
          this.options.push(opt);
        }
        i++;
      }
    }
  }

  ionViewWillEnter() {
    $(document).one('backbutton', () => {
      this.close();
    });
  }

  ionViewWillLeave() {
    $(document).off();
  }


}
