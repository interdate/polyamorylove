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
  coupon = '';
  couponMessage: string;

  constructor(public api: ApiQuery) {
    this.api.http.get(api.apiUrl + '/user/subscribe', this.api.setHeaders(true)).subscribe((data: any) => {
      this.page = data;
      // this.page = false;
    });
  }

  ngOnInit() {
  }

  subscribe(payment) {
    this.browser = this.api.iab.create(this.page.url + '&payPeriod=' + payment.period + '&prc=' + payment.amount
        + '&coupon=' + this.coupon);
    this.checkPaymentInterval = setInterval(() => {
      this.checkPayment();
    }, 100000);
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

  sendCoupon() {
    console.log(this.coupon);
    this.api.http.get(this.api.apiUrl + '/coupon?coupon=' + this.coupon, this.api.header).subscribe((data: any) => {
      console.log(data);
      if (!data.newPayments) {
        alert(data.errorMessage);
        this.coupon = '';
      } else {
        this.page.payments = data.newPayments;
        this.couponMessage = data.successMessage;
      }
    });
  }
}

