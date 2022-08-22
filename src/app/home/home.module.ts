import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';
import {ShortComponentModule} from "../components/short-profile/short-component.module";
import {ScrollDispatcher, ScrollingModule, ViewportRuler} from "@angular/cdk/scrolling";
import {Platform} from "@angular/cdk/platform";


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
    RouterModule.forChild(routes),
    ScrollingModule
  ],
  exports: [],
  declarations: [HomePage],
  providers: [ScrollDispatcher, Platform, ViewportRuler]
})
export class HomePageModule {}
