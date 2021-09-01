import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import {ShortComponentModule} from "../components/short-profile/short-component.module";
// import {ShortProfileComponent} from '../components/short-profile/short-profile.component';
// import {ShortComponentModule} from "../components/short-profile/short-component.module";


const routes: Routes = [
  {
    path: '',
    component: HomePage,

  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShortComponentModule,
    RouterModule.forChild(routes)
  ],
  exports: [],
  declarations: [HomePage]
})
export class HomePageModule {}
