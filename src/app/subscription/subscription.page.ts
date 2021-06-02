import { Component, OnInit } from '@angular/core';
import {ApiQuery} from '../api.service';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.page.html',
  styleUrls: ['./subscription.page.scss'],
})
export class SubscriptionPage implements OnInit {

  page: any;
  // iframe: true;
  browser: any;
  checkPaymentInterval: any;

  constructor(public api: ApiQuery) {
    this.api.http.get(api.apiUrl + '/user/subscribe', this.api.setHeaders(true)).subscribe((data: any) => {
      this.page = data;
      // this.page = false;
    });
  }

  ngOnInit() {
  }

  subscribe(payment) {
    this.browser = this.api.iab.create(this.page.url + '&payPeriod=' + payment.period + '&prc=' + btoa(payment.amount));
    this.checkPaymentInterval = setInterval(() => {
      this.checkPayment();
    }, 5000);
    const that = this;
    setTimeout(() => {
      clearInterval(this.checkPaymentInterval);
    }, 300000); // 300000 = 5 minute
    return false;
  }

  ionViewWillEnter() {
    this.api.pageName = 'SubscriptionPage';
  }

  checkPayment() {
    this.api.http.get(this.api.apiUrl + '/user/paying', this.api.header).subscribe((res: any) => {
      if (res.paying) {
        this.browser.close();
        this.api.route.navigate(['/home']);
      }
    });
  }
}
