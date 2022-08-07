import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import {ApiQuery} from "../api.service";
import {ToastController} from "@ionic/angular";

@Component({
  selector: 'app-password-recovery-phone',
  templateUrl: './password-recovery-phone.page.html',
  styleUrls: ['./password-recovery-phone.page.scss'],
})
export class PasswordRecoveryPhonePage implements OnInit {

  phone: string;
  text: any;
  isClicked = false;
  phone_err: string;
  constructor(
      public api: ApiQuery,
      public toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.api.http.get(this.api.openUrl + '/password/phone', this.api.header).subscribe(data => {
      this.text = data;
    })
  }


  onOpenKeyboard() {
    $('.footerMenu').hide();
  }

  onCloseKeyboard() {
    $('.footerMenu').show();
  }

  formSubmit() {
    if (!this.isClicked) {
      this.isClicked = true;
      this.phone;
      this.api.http.post(this.api.openUrl + '/passwords/phones', {phone: this.phone}, this.api.header)
          .subscribe((res: any) => {
            console.log(res)
            if (res.success) {
              this.toastCtrl.create({
                message: res.success_message,
                showCloseButton: true,
                closeButtonText: 'אישור'
              }).then(toast => toast.present());
            } else {
              this.phone_err = res.err_mess;
            }
            this.isClicked = false;
          }, error => this.isClicked = false)
    }
  }

  ionViewWillEnter() {
    this.api.pageName = 'PasswordRecoveryPhonePage';
  }

}
