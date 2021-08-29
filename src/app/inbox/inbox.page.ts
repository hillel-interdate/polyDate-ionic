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

    users: any;/*Array<{ id: string,
        message: string,
        username: string,
        newMessagesNumber: string,
        faceWebPath: string,
        noPhoto: string,
        photo: string,
        contactIsPaying: boolean,
        date: string
    }>;*/
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
            // this.users = data.messages;
        });

    }


    ionViewWillEnter() {
        if (!this.api.back) {
            // this.api.showLoad();
        } else {
            this.api.back = true;
        }
        // if(this.users) {
        //     this.moreUsers();
        // }else{
            this.getDialogs();
        // }

        //  this.interval = setInterval(() => this.getDialogs(), 10000)


        if(this.chatWith){
            let index = this.users.indexOf(this.chatWith);
            if(this.chatWith.uid == 0){
                this.users.slice(index, 1);
            }else {
                // console.log(this.users.indexOf(this.chatWith));

                this.api.http.get(this.api.apiUrl + '/users/' + this.chatWith.uid + '/inbox', this.api.setHeaders(true)).subscribe((data:any) => {
                    if (data.dialog) {
                        // console.log(index);
                        // console.log(this.users.indexOf(this.users[index]));
                        // console.log(this.users[index]);
                        //this.users[index] = data.res;
                        this.users[index].date = data.dialog.date;
                        this.users[index].message = data.dialog.message;
                        this.users[index].newMessagesNumber = data.dialog.newMessagesNumber;
                        // console.log(this.users[index]);
                    } else {
                        this.users.slice(index, 1);
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
        this.api.http.get(this.api.apiUrl + '/inbox?perPage=' + this.prop.perPage + '&page=' + this.prop.page, this.api.setHeaders(true)).subscribe((data:any) => {
            console.log(data);
            if (data.dialogs.length < this.prop.perPage) {
                this.loader = false;
            }
            //this.users = data.dialogs;
            this.users = [];
            for (let person of data.dialogs) {
                //if(person.visibleMessagesNumber > 0){
                    this.users.push(person);
                //}
            }
            this.texts = data.texts;
            this.notifications = data.notifications;
            console.log(this.notifications);
            this.api.hideLoad();
            let that = this;
            setTimeout(function () {
                if(that.api.pageName == 'InboxPage') {
                    that.moreUsers();
                }
            },1000);
        }, err => this.api.hideLoad());

    }

    moreUsers() {
        if (this.loader) {
            this.prop.page++;

            this.api.http.get(this.api.apiUrl + '/inbox?perPage=' + this.prop.perPage + '&page=' + this.prop.page, this.api.setHeaders(true)).subscribe((data: any) => {
                if (data.dialogs.length < this.prop.perPage) {
                    this.loader = false;
                }
                if(!this.users){
                    this.users = [];
                }
                for (let person of data.dialogs) {
                    //if(person.visibleMessagesNumber > 0 && this.users[this.users.length - 1]['user']['userId'] != person['user']['userId']){
                        this.users.push(person);
                    //}
                }

                let that = this;
                setTimeout(function () {
                    that.moreUsers();
                },1000);

            });

        }
    }

    // checkDialogs() {
    //     this.api.http.get(this.api.apiUrl + '/inbox', this.api.setHeaders(true)).subscribe((data:any) => {
    //         if (data.dialogs.length != this.users.length) {
    //             this.users = data.dialogs;
    //         } else {
    //             for(let x = 0; x < data.dialogs.length; x++) {
    //                 if(this.users[x].message != data[x].message ) {
    //                     this.users[x]. message = data[x].message;
    //                 }
    //             }
    //         }
    //     });
    // }


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
                        this.api.storage.get('user_data').then(user_data => {
                            if (user_data) {
                                const data = {
                                    user_id: user_data.user_id,
                                    contact_id: dialog.id
                                };
                                this.api.showLoad();
                                this.api.http.post(this.api.apiUrl + '/deletes/inboxes.json', data, this.api.header).subscribe((res: any) => {
                                    if (res.deleted) {
                                        this.users.splice(index, 1);
                                        this.ionViewWillEnter();
                                        console.log(this.users);
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
