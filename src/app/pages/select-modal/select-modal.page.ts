import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {IonInfiniteScroll} from '@ionic/angular';
import * as $ from 'jquery';
import {timer} from "rxjs";

@Component({
    selector: 'app-select-modal',
    templateUrl: 'select-modal.page.html',
    styleUrls: ['./select-modal.page.scss']
})
export class SelectModalPage implements OnInit {

    @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

    constructor(
        public modalCtrl: ModalController,
    ) {
    }

    choices = [];
    title;
    @Input('choseNow') choseNow;
    options: any = [];
    page: any = 1;
    count: any = 50;
    optAdd = true;
    search = false;
    allChoices = [];
    @Input('multiple') multiple;

    ngOnInit() {
        this.addOption();
    }


    getItem(item) {
        if (!item.isSelected) {
            this.selectItem(item);
        } else {
            this.deselectItem(item)
        }
    }

    private selectItem(item) {
        item.isSelected = true;
        if (this.multiple) {
            this.allChoices.push(item);
        } else {
            timer(300).subscribe(() =>
                this.modalCtrl.dismiss(item).then());
        }
    }

    private deselectItem(item) {
        item.isSelected = false;
        if (this.multiple) {
            const i = this.allChoices.indexOf(item);
            this.allChoices.splice(i, 1);
        }
    }

    moreItems(event) {
        this.page++;
        this.addOption();
        event.target.complete();
    }

    close() {
        if (this.multiple && this.allChoices.length > 0) {
            this.modalCtrl.dismiss(this.allChoices);
        } else {
            this.modalCtrl.dismiss('');
        }
    }

    getItems(ev: any) {
        this.options = this.choices;
        const val = ev.target.value;

        if (val && val.trim() != '') {
            this.optAdd = false;
            this.options = this.options.filter((item) => {
                return (item.label.toLowerCase().indexOf(val.toLowerCase()) > -1);
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
            let i: any = start;

            while (i < finish) {
                this.options.push(this.choices[i]);
                this.choices[i].isSelected = false;
                if ((this.multiple && this.choseNow.includes(this.choices[i].value)) || (!this.multiple && this.choseNow == this.choices[i].value)) {
                    this.choices[i].isSelected = true;
                    this.allChoices.push(this.choices[i]);
                }
                i++;
            }

            // for (const opt of this.choices) {
            //   // console.log(item);
            //   // alert(i >= start && i < finish);
            //   if (i >= start && i < finish) {
            //     this.options.push(opt);
            //     console.log('opt: ');
            //     console.log(opt);
            //     opt.isSelected = false;
            //     if (this.choseNow.includes(opt.value)) {
            //       opt.isSelected = true;
            //       this.allChoices.push(opt);
            //     }
            //     // if (opt.isSelected) {
            //     //   this.allChoices.push(opt);
            //     // }
            //   }
            //   i++;
            // }
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
