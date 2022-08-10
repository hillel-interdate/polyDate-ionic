import {Component, Input, OnInit} from '@angular/core';
import {ApiQuery} from '../../api.service';
import {NavigationExtras} from '@angular/router';
import {Events} from '@ionic/angular';
import {ShortUser} from '../../interfaces/short-user';

@Component({
  selector: 'app-short-profile',
  templateUrl: './short-profile.component.html',
  styleUrls: ['./short-profile.component.scss'],
})
export class ShortProfileComponent implements OnInit {

  @Input('user') user: ShortUser;
  @Input('params') params;
  @Input('texts') texts;

  constructor(
      public api: ApiQuery,
      private events: Events,
  ) { }

  ngOnInit() {
    // console.log('params');
    // console.log(this.params);
  }

  itemTapped(user: ShortUser) {
    // console.log(user);
    // if (this.scrolling == false) {
    user.url = user.photo;
    const navigationExtras: NavigationExtras = {
      queryParams: {
        data: JSON.stringify({
          user
        })
      }
    };
    this.api.route.navigate(['/profile'], navigationExtras);
      // this.router.navigate(['/activation']);
    // }
  }


}
