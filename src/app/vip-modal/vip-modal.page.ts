import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {ApiQuery} from '../api.service';
import {ShortUser} from '../interfaces/short-user';
import {User} from "../interfaces/user";
import {Observable} from "rxjs";

@Component({
  selector: 'app-vip-modal',
  templateUrl: './vip-modal.page.html',
  styleUrls: ['./vip-modal.page.scss'],
})
export class VipModalPage implements OnInit {

  constructor(
      private modalCtrl: ModalController,
      private api: ApiQuery,
  ) { }

  @Input('vipTexts') vipTexts;
  @Input('payment') payment;
  @Input('vipPricePerMonth') vipPricePerMonth;

  payUser: ShortUser;
  vipUser: ShortUser;
  params: {list: string};


  ngOnInit() {
    this.setDefaults();

    let myUser;
    if (this.api.usersCache[this.api.userId]) {
      myUser = this.api.usersCache[this.api.userId];
      this.setUser(myUser);
      this.setUser(myUser);
    } else {

      // @ts-ignore
      // tslint:disable-next-line:no-shadowed-variable
      this.api.http.get(this.api.apiUrl + '/users/' + this.api.userId, this.api.header).subscribe((myUser: User) => {
        this.setUser(myUser);
        this.setUser(myUser);
      });
    }
  }


  setUser(user: User) {
    // console.log(user);
    this.payUser.age = user.age;
    this.payUser.canWriteTo = user.canWriteTo;
    this.payUser.isAddBlackListed = user.isAddBlackListed;
    this.payUser.isAddFavorite = user.isAddFavorite;
    this.payUser.isAddLike = user.isAddLike;
    this.payUser.isOnline = user.isOnline;
    this.payUser.isVerify = user.isVerify;
    this.payUser.isNew = user.isNew;
    this.payUser.username = user.username;
    this.payUser.photo = this.api.url + user.photos[0].face;
    this.payUser.distance = user.form.distance;
    if (typeof user.form.region_name.value === 'string') {
      this.payUser.region_name = user.form.region_name.value;
    }
    this.payUser.isPaying = true;
    this.payUser.isVip = false;
    console.log(this.payUser);

    this.vipUser.age = user.age;
    this.vipUser.canWriteTo = user.canWriteTo;
    this.vipUser.isAddBlackListed = user.isAddBlackListed;
    this.vipUser.isAddFavorite = user.isAddFavorite;
    this.vipUser.isAddLike = user.isAddLike;
    this.vipUser.isOnline = user.isOnline;
    this.vipUser.isVerify = user.isVerify;
    this.vipUser.isNew = user.isNew;
    this.vipUser.username = user.username;
    this.vipUser.photo = this.api.url + user.photos[0].face;
    this.vipUser.distance = user.form.distance;

    if (typeof user.form.region_name.value === 'string') {
      this.vipUser.region_name = user.form.region_name.value;
    }

    this.vipUser.isPaying = true;
    this.vipUser.isVip = true;
    console.log(this.payUser);
  }

  close(isVip: boolean) {
    if (isVip) {
      this.payment.amount += (this.payment.period * 29);
    }
    this.payment.isVip = isVip;
    // console.log( this.payment);
    this.modalCtrl.dismiss({newPayment: this.payment});
  }

  setDefaults() {
    this.params = {list: ''};

    this.vipUser = {
      age: 0,
      canWriteTo: false,
      distance: '',
      isAddBlackListed: false,
      isAddFavorite: false,
      isAddLike: false,
      isNew: false,
      isOnline: false,
      isPaying: false,
      isVerify: false,
      isVip: false,
      photo: '',
      region_name: '',
      username: ''
    };

    this.payUser = {
      age: 0,
      canWriteTo: false,
      distance: '',
      isAddBlackListed: false,
      isAddFavorite: false,
      isAddLike: false,
      isNew: false,
      isOnline: false,
      isPaying: false,
      isVerify: false,
      isVip: false,
      photo: '',
      region_name: '',
      username: ''
    };
  }

}
