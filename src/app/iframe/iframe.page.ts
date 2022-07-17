import { Component, OnInit } from '@angular/core';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import * as $ from "jquery";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-iframe',
  templateUrl: './iframe.page.html',
  styleUrls: ['./iframe.page.scss'],
})
export class IframePage implements OnInit {

  url: SafeUrl;

  constructor(public route: ActivatedRoute,
              public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
  }


  ionViewWillEnter() {
    this.route.queryParams.subscribe((data: any) => {
      console.log(data)
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(data.url)
      console.log(this.url)
    });

    $('.banner').css({'display':'none'});
  }

  ionViewWillLeave() {
    $('.banner').css({'display':'block'});
  }
}
