import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VipModalPage } from './vip-modal.page';

const routes: Routes = [
  {
    path: '',
    component: VipModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VipModalPageRoutingModule {}
