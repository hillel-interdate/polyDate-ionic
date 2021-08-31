import {Component, OnInit} from '@angular/core';
import {ApiQuery} from '../api.service';

@Component({
    selector: 'app-safety',
    templateUrl: './safety.page.html',
    styleUrls: ['./safety.page.scss'],
})
export class SafetyPage implements OnInit {
    public page: [{type: string, content: string| [{type: string, content: string}]}];

    constructor(public api: ApiQuery) {
    }

    ngOnInit() {

        this.api.showLoad().then();
        this.api.http.get(this.api.openUrl + '/safety', this.api.setHeaders(true)).subscribe((data: any) => {
            this.page = data.page;
            this.api.hideLoad().then();
        }, () => {
            this.api.hideLoad().then();
            this.page = [{type: 'p', content: 'לא היה ניתן לטעון את העמוד'}];
        });

    }
    ionViewWillEnter() {
        this.api.pageName = 'SafetyPage';
    }
}
