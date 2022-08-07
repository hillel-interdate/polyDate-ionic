import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasswordRecoveryPhonePageRoutingModule } from './password-recovery-phone-routing.module';

import { PasswordRecoveryPhonePage } from './password-recovery-phone.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasswordRecoveryPhonePageRoutingModule
  ],
  declarations: [PasswordRecoveryPhonePage]
})
export class PasswordRecoveryPhonePageModule {}
