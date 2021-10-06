import {Component, OnInit} from '@angular/core';

import {ApiQuery} from '../api.service';

import {NavigationExtras, Router} from "@angular/router";
import {AlertController, Events} from "@ionic/angular";
import {notifications} from "ionicons/icons";


/*
 Generated class for the Inbox page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    selector: 'page-inbox',
    templateUrl: './inbox.page.html',
    styleUrls: ['inbox.page.scss']
})
export class InboxPage {

    dialogs: any;
    texts: any; /*{ no_results: string };*/
    interval: any;

    notifications: any;
    prop: any = {
        perPage: 20,
        page: 1
    };

    chatWith: any;
    loader:any = true;


    constructor(public router: Router,
                public alertCtrl: AlertController,
                public api: ApiQuery,
                public events: Events) {
        this.events.subscribe('messages:new', (data) => {
            // alert(1);
            // this.moreUsers();
            // this.dialogs = data.messages;
        });

    }


    ionViewWillEnter() {
        if (!this.api.back) {
            // this.api.showLoad();
        } else {
            this.api.back = true;
        }
        // if (this.dialogs) {
        //     this.moreUsers();
        // } else {
        this.getDialogs();
        // }

        //  this.interval = setInterval(() => this.getDialogs(), 10000)


        if (this.chatWith) {
            const index = this.dialogs.indexOf(this.chatWith);
            if (this.chatWith.uid == 0) {
                this.dialogs.slice(index, 1);
            } else {
                // console.log(this.dialogs.indexOf(this.chatWith));

                this.api.http.get(this.api.apiUrl + '/users/' + this.chatWith.uid + '/inbox', this.api.setHeaders(true)).subscribe((data:any) => {
                    if (data.dialog) {
                        // console.log(index);
                        // console.log(this.dialogs.indexOf(this.dialogs[index]));
                        // console.log(this.dialogs[index]);
                        // this.dialogs[index] = data.res;
                        this.dialogs[index].date = data.dialog.date;
                        this.dialogs[index].message = data.dialog.message;
                        this.dialogs[index].newMessagesNumber = data.dialog.newMessagesNumber;
                        // console.log(this.dialogs[index]);
                    } else {
                        this.dialogs.slice(index, 1);
                    }
                });
            }
        }
        this.api.pageName = 'InboxPage';
    }

    ionViewWillLeave() {
        this.events.unsubscribe('messages:new');
    }


    openNotificationsDialog() {
        const navigationExtras: NavigationExtras = {
            state: {
                notifications: this.notifications
            }
        };
        this.api.route.navigate(['/messenger-notifications'], navigationExtras);
    }

    getDialogs() {
        this.prop.page = 1;
        this.api.http.get(this.api.apiUrl + '/inbox?perPage=' + this.prop.perPage + '&page=' + this.prop.page, this.api.setHeaders(true)).subscribe((data: any) => {
            console.log(data);
            if (data.dialogs.length < this.prop.perPage) {
                this.loader = false;
            }
            // this.dialogs = data.dialogs;
            this.dialogs = [];
            for (const person of data.dialogs) {
                // if(person.visibleMessagesNumber > 0){
                    this.dialogs.push(person);
                // }
            }
            this.texts = data.texts;
            this.notifications = data.notifications;
            console.log(this.notifications);
            this.api.hideLoad();
            const that = this;
            setTimeout(() => {
                if (that.api.pageName === 'InboxPage') {
                    that.moreUsers();
                }
            }, 1000);
        }, err => this.api.hideLoad());

    }

    moreUsers() {
        if (this.loader) {
            this.prop.page++;
            const url = this.api.apiUrl + '/inbox?perPage=' + this.prop.perPage + '&page=' + this.prop.page;

            this.api.http.get(url, this.api.setHeaders(true)).subscribe((data: any) => {
                if (data.dialogs.length < this.prop.perPage) {
                    this.loader = false;
                }
                if (!this.dialogs) {
                    this.dialogs = [];
                }
                for (const person of data.dialogs) {
                    // if(person.visibleMessagesNumber > 0 && this.dialogs[this.dialogs.length - 1]['user']['userId'] != person['user']['userId']){
                        this.dialogs.push(person);
                    // }
                }

                const that = this;
                setTimeout(() => {
                    that.moreUsers();
                }, 1000);

            });

        }
    }

    toDialogPage(user) {
        console.log(user);
        // user.id = user.fromUser;
        this.chatWith = user;
        this.api.data['user'] = user;
        this.router.navigate(['/dialog']);
    }

    deleteDialog(dialog, index) {
        console.log(dialog);
        this.alertCtrl.create({
            header: 'מחיקת שיחה עם ' + dialog.username,
            message: ' ?למחוק את השיחה',
            buttons: [
                {
                    text: 'כן',
                    handler: () => {
                        this.api.storage.get('user_data').then(userData => {
                            if (userData) {
                                const data = {
                                    user_id: userData.user_id,
                                    contact_id: dialog.id
                                };
                                this.api.showLoad();
                                this.api.http.post(this.api.apiUrl + '/deletes/inboxes.json', data, this.api.header).subscribe((res: any) => {
                                    if (res.deleted) {
                                        this.dialogs.splice(index, 1);
                                        this.ionViewWillEnter();
                                        console.log(this.dialogs);
                                        this.api.hideLoad();
                                    } else {
                                        this.api.hideLoad();
                                    }
                                }, err => this.api.hideLoad());
                            }

                        });
                    }
                },
                {
                    text: 'לא',
                    role: 'cancel',
                    // handler: () => {}
                }
            ]
        }).then( alert => alert.present() );
    }


}
