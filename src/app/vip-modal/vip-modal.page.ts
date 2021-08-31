import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-vip-modal',
  templateUrl: './vip-modal.page.html',
  styleUrls: ['./vip-modal.page.scss'],
})
export class VipModalPage implements OnInit {

  constructor(
      private modalCtrl: ModalController
  ) { }

  @Input('vipTexts') vipTexts;

  ngOnInit() {

  }



  close(isVip: boolean) {
    this.modalCtrl.dismiss(isVip);
  }

}
