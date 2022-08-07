import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasswordRecoveryPhonePage } from './password-recovery-phone.page';

const routes: Routes = [
  {
    path: '',
    component: PasswordRecoveryPhonePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasswordRecoveryPhonePageRoutingModule {}
