import { NgModule } from '@angular/core';
import {ShortProfileComponent} from './short-profile.component';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: '123/dfg',
        component: ShortProfileComponent
    }
];
@NgModule({
    declarations: [ShortProfileComponent],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes)
    ],
    exports: [ShortProfileComponent],

})

export class ShortComponentModule {}
