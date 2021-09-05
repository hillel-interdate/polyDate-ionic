import { Component, OnInit } from '@angular/core';
import {ApiQuery} from '../api.service';
import {ModalController} from '@ionic/angular';
import {VipModalPage} from '../vip-modal/vip-modal.page';
import {SelectModalPage} from '../select-modal/select-modal.page';



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

  constructor(
      public api: ApiQuery,
      private modalController: ModalController
  ) {
    this.api.http.get(api.apiUrl + '/user/subscribe', this.api.setHeaders(true)).subscribe((data: any) => {
      this.page = data;
      // this.page = false;
    });
  }

  ngOnInit() {
  }

  async subscribe(payment) {

    const modal = await this.modalController.create({
      component: VipModalPage,
      componentProps: {
        vipTexts: this.page.vipTexts,
        payment,
        vipPricePerMonth: this.page.vipPricePerMonth,
      }
    });
    modal.present().then();

    modal.onDidDismiss().then((data: any) => {
      const newPayment = data.data.newPayment;
      console.log(data);
      const payUrl = this.page.url + '&amount=1&payPeriod=' + newPayment.period + '&prc=' + btoa(newPayment.amount)
          + '&coupon=' + this.coupon + '&isVip=' + Number(newPayment.isVip);
      this.browser = this.api.iab.create(payUrl);

      this.checkPaymentInterval = setInterval(() => {
          this.checkPayment();

       }, 10000);

      const that = this;

      setTimeout(() => {
        clearInterval(that.checkPaymentInterval);
      }, 300000); // 300000 = 5 minute

      return false;

    });
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

