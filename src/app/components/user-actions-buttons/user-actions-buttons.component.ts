import {Component, Input, OnInit} from '@angular/core';
import {ApiQuery} from "../../api.service";

@Component({
  selector: 'app-user-actions-buttons',
  templateUrl: './user-actions-buttons.component.html',
  styleUrls: ['./user-actions-buttons.component.scss'],
})
export class UserActionsButtonsComponent implements OnInit {

  @Input('user') public user;
  @Input('params') public params:any = [];

  showVerifyBtn: boolean

  constructor(public api: ApiQuery) {}

  ngOnInit() {
  }

  ngAfterContentChecked() {
    this.showVerifyBtn = this.api.pageName == 'ProfilePage';
  }

  toDialog(user) {
    this.api.data['user'] = user;
    this.api.route.navigate(['/dialog']);
  }

  addLike(user) {

    if (!user.isAddLike) {

      user.isAddLike = true;
      this.api.toastCreate(' עשית לייק ל' + user.username, 2500);

      const params = JSON.stringify({
        toUser: user.id,
      });

      this.api.http.post(this.api.apiUrl + '/likes/' + user.id, params, this.api.setHeaders(true)).subscribe((data: any) => {
        if (data === 'send_me') {
          this.api.canCheckBingo = true;
        }
      }, err => {});
    }
  }

  block(user, bool) {
    let params;

    if (!user.isAddBlackListed && (bool)) {

      user.isAddBlackListed = true;

      params = {
        list: 'Favorite',
        action: 'delete'
      };

    } else if (user.isAddBlackListed && !bool) {

      user.isAddBlackListed = false;

      params = {
        list: 'BlackList',
        action: 'delete'
      };
    }

    // if (this.users.length == 1) {
    //   this.user_counter = 0;
    // }

    // Remove user from list
    user.hide = true;

    this.api.http.post(this.api.apiUrl + '/lists/' + user.id, params, this.api.setHeaders(true)).subscribe((data: any) => {
      // this.loader = true;
      this.api.toastCreate(data.success, 2500);
      // console.log('in there');
      if (data.users.length >= 9) {
        // this.loader = false;
      }
      // alert('page = 1 | 2');
      this.params.page = 1;
    });
  }

  addFavorites(user) {

    const params = {
      list: 'Favorite',
      action: ''
    };

    if (!user.isAddFavorite) {
      user.isAddFavorite = true;
    } else {

      user.isAddFavorite = false;
      params.action = 'delete';

    }

    if (this.params.list === 'favorited') {
      user.hide = true;
    }

    this.api.http.post(this.api.apiUrl + '/lists/' + user.id, params, this.api.setHeaders(true)).subscribe((data: any) => {
      this.api.toastCreate(data.success, 2500);
    });

  }

  addVerify() {
    this.user.isAddVerify = true;
    this.api.http.post(this.api.apiUrl + '/verifies/' + this.user.id, {user: this.user.id}, this.api.header).subscribe((data: any) => {
      console.log(data);
      if (data.success) {
        this.api.toastCreate(data.message).then();
      } else {
        this.user.isAddVerify = false;
      }
    });
  }


}
