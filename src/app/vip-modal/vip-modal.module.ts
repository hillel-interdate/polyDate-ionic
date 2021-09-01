import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VipModalPageRoutingModule } from './vip-modal-routing.module';

import { VipModalPage } from './vip-modal.page';
import {ShortComponentModule} from '../components/short-profile/short-component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VipModalPageRoutingModule,
    ShortComponentModule
  ],
  declarations: [VipModalPage]
})
export class VipModalPageModule {}
