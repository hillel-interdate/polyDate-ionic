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

  payUser;
  vipUser;
  params: {list: string};
  shortUser: ShortUser;

  ngOnInit() {

    this.params = {list: ''};
    this.shortUser = {
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
    let myUser;
    if (this.api.usersCache[this.api.userId]) {
      myUser = this.api.usersCache[this.api.userId];
      this.setUser(myUser);
    } else {

      // @ts-ignore
      // tslint:disable-next-line:no-shadowed-variable
      this.api.http.get(this.api.apiUrl + '/users/' + this.api.userId, this.api.header).subscribe((myUser: User) => {
        this.setUser(myUser);
      });
    }



    console.log(this.vipUser);
  }


  setUser(user: User) {
    console.log(user);
    this.shortUser.age = user.age;
    this.shortUser.canWriteTo = user.canWriteTo;
    this.shortUser.isAddBlackListed = user.isAddBlackListed;
    this.shortUser.isAddFavorite = user.isAddFavorite;
    this.shortUser.isAddLike = user.isAddLike;
    this.shortUser.isOnline = user.isOnline;
    this.shortUser.isVerify = user.isVerify;
    this.shortUser.isNew = user.isNew;
    this.shortUser.username = user.username;

    this.shortUser.photo = this.api.url + user.photos[0].face;

    this.shortUser.distance = user.form.distance;
    if (typeof user.form.region_name.value === 'string') {
      this.shortUser.region_name = user.form.region_name.value;
    }


    this.shortUser.isPaying = true;
    this.payUser = this.shortUser;

    this.shortUser.isVip = true;
    this.vipUser = this.shortUser;
  }

  close(isVip: boolean) {
    this.modalCtrl.dismiss(isVip);
  }

}
