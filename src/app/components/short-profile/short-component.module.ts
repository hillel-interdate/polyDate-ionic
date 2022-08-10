import { NgModule } from '@angular/core';
import {ShortProfileComponent} from './short-profile.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {RouterModule, Routes} from '@angular/router';
import {UserActionsButtonsComponent} from "../user-actions-buttons/user-actions-buttons.component";

// const routes: Routes = [
//     {
//         path: 'vcfg',
//         component: ShortProfileComponent
//     }
// ];‎
@NgModule({
    declarations: [ShortProfileComponent, UserActionsButtonsComponent],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule
    ],
    exports: [ShortProfileComponent, UserActionsButtonsComponent],

})

export class ShortComponentModule {}
