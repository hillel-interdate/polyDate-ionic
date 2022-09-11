import {Component, isDevMode, OnInit} from '@angular/core';
import {ApiQuery} from '../api.service';

import {ModalController, Platform} from '@ionic/angular';
import {VipModalPage} from '../vip-modal/vip-modal.page';
import {InAppPurchase} from '@ionic-native/in-app-purchase/ngx';
import {Router} from '@angular/router';

@Component({
    selector: 'app-subscription',
    templateUrl: './subscription.page.html',
    styleUrls: ['./subscription.page.scss'],
})

/*
    Handling app store subscriptions - we open the product, listen for a success, and then send
    the data to the server. Also, we look for existing subscriptions upon opening this page,
    and we do it also when running apiService.sendPhoneId().
 */

export class SubscriptionPage implements OnInit {

    page: any;
    // iframe: true;
    browser: any;
    checkPaymentInterval: any;
    coupon = '';
    couponMessage: string;


    constructor(
        public api: ApiQuery,
        public plt: Platform,
        public iap: InAppPurchase,
        public router: Router,
        private modalController: ModalController
    ) {
        this.api.http.get(api.apiUrl + '/user/subscribe', this.api.setHeaders(true)).subscribe((data: any) => {
            this.page = data;
            // this.page = false;
            if (this.plt.is('ios')) {
                this.iap.getProducts(this.page.productsList)
                    .then(prods => {
                        this.page.payments = prods;
                    }).catch(err => console.log({err}));
            }
        });
    }

    ngOnInit() {
    }

    async subscribe(payment) {

        if (this.plt.is('ios')) {
            this.iap.subscribe(payment.productId).then(async success => {
                console.log('success')
                console.log(success)
                history = await this.iap.restorePurchases();
                if (history) {
                    console.log('history')
                    console.log(history)
                    this.api.http.post(this.api.apiUrl + '/subs',
                        {history, month: 'new'}, this.api.setHeaders(true))
                        .subscribe(data => {
                            console.log('data')
                            console.log(data)
                            this.api.isPay = true;
                            this.router.navigate(['/home']).then();
                        }, err => console.log(err));
                }
            }).catch(err => console.log(err));
        } else {
            if (typeof payment.noVipAmount == 'undefined') {
                payment.noVipAmount = payment.amount;
            }
            const modal = await this.modalController.create({
                component: VipModalPage,
                componentProps: {
                    vipTexts: this.page.vipTexts,
                    payment,
                    vipPricePerMonth: this.page.vipPricePerMonth,
                    texts: this.page.vipTexts.actionButtonsText,
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
    }

    ionViewWillEnter() {
        this.api.pageName = 'SubscriptionPage';
        this.api.http.get(this.api.apiUrl + '/user/subscribe', this.api.setHeaders(true)).subscribe((data: any) => {
            this.page = data;
            // this.page = false;
        });
        if (this.plt.is('ios')) {
            this.iap.restorePurchases().then((history) => {
                // alert(3)
                if (history) {
                    this.api.http.post(this.api.apiUrl + '/subs',
                        {history}, this.api.setHeaders(true))
                        .subscribe((data: any) => {
                            if (!data.canSubscribe) {
                                this.api.isPay = true;
                                this.router.navigate(['/home']).then();
                            } else {
                                return;
                            }
                        }, err => console.log(err));
                }
            });
        }


    }

    checkPayment() {
        this.api.http.get(this.api.apiUrl + '/user/paying', this.api.header).subscribe((res: any) => {
            if (res.paying) {
                this.browser.close();
                clearInterval(this.checkPaymentInterval);
                this.api.route.navigate(['/home']);
            }
        });
    }

    sendCoupon() {
        this.api.http.get(this.api.apiUrl + '/coupon?coupon=' + this.coupon, this.api.header).subscribe((data: any) => {
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

