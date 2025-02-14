import {Storage} from '@ionic/storage';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {Component, Injectable} from '@angular/core';
import {AlertController, Events, LoadingController, Platform, ToastController} from '@ionic/angular';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {Location} from '@angular/common';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';

import * as $ from 'jquery';
import {Keyboard} from '@ionic-native/keyboard/ngx';
import {reject} from 'q';
import {Route, Router} from '@angular/router';
import {InAppPurchase} from "@ionic-native/in-app-purchase/ngx";
import {error} from "util";


@Injectable({
    providedIn: 'root'
})

export class ApiQuery {

    userId: any;
    videoShow: any = false;
    data: any = {};
    url: any;
    headers: any;
    response: any;
    username: any = 'noname';
    password: any = 'nopass';
    version;
    header: any;
    status: any = '';
    back = false;
    storageRes: any;
    footer: any;
    pageName: any = false;
    loading: any;
    usersChooses: any = {};
    firstOpen: boolean;
    isLoading = false;
    isPay: any;
    isActivated: boolean;
    openUrl: string;
    apiUrl: string;
    callAlertShow: any = false;
    videoChat: any = null;
    videoTimer: any = null;
    callAlert: any;
    audioCall: any;
    audioWait: any;
    checkedPage: string;
    thereForComplete = true;
    alertPresent = false;
    timeouts: any;
    isMan: boolean;
    peerjs: any = [];
    usersCache: any = [];
    location: any;
    canCheckBingo: boolean;
    canRequestItunes = true;

    constructor(public storage: Storage,
                public loadingCtrl: LoadingController,
                public toastCtrl: ToastController,
                public alertCtrl: AlertController,
                public http: HttpClient,
                public platform: Platform,
                public navLocation: Location,
                public geolocation: Geolocation,
                public route: Router,
                private sanitizer: DomSanitizer,
                public iab: InAppBrowser,
                public iap: InAppPurchase,
                public events: Events,
    ) {

        this.url = 'https://polydate.co.il';


        // this.apiUrl = 'https://polydate.co.il/app_dev.php/api/v5/he';
        // this.openUrl = 'https:/polydate.co.il/app_dev.php/open_api/v5/he';
        //
        this.apiUrl = 'https://polydate.co.il/api/v5/he';
        this.openUrl = 'https://polydate.co.il/open_api/v5/he';

        this.footer = true;
        this.version = this.platform.is('android') ? 17 : 3;

    }

    getLocation() {
        this.geolocation.getCurrentPosition().then(pos => {
            if (pos) {
                this.location = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
            }
        });
    }

    safeHtml(html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
        // return this.sanitizer.bypassSecurityTrustScript(html);
    }

    sendPhoneId(idPhone) {
         // alert('in send id , api page, id: ' + JSON.stringify(idPhone));
        // alert('in send phone id from api page  ,will send this: ' + idPhone);
        const data = JSON.stringify({phone_id: idPhone});
        this.http.post(this.apiUrl + '/phones', data, this.setHeaders(true)).subscribe(data => {
            // alert('data after send id: ' + JSON.stringify(data));
        }), err => console.log('error was in send phone: ' + err);


    }

    restoreIosPurchase() {
        // alert(432)
        this.iap.restorePurchases().then(history => {
            if (history) {
                this.http.post(this.apiUrl + '/subs',
                    {history}, this.setHeaders(true))
                    .subscribe((subscription: any) => {
                        if (subscription.payment) {
                            this.isPay = true;
                        }
                    })
            }

        }, err => {
            console.log('in error')
            console.log(err);
            console.log((err.errorCode));
            // console.log((JSON.parse(err).errorCode));
            // err = JSON.parse(err)
            if (err.errorCode == 2) {
                this.canRequestItunes = false;
            }
        });
    }


    functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
        for (let i = 0; i < arraytosearch.length; i++) {
            if (arraytosearch[i][key] == valuetosearch) {
                return i;
            }
        }
        return null;
    }

    async toastCreate(mess, duration = 60000) {
        const toast = await this.toastCtrl.create({
            message: mess,
            showCloseButton: duration == 60000 ? true : false,
            closeButtonText: 'אישור',
            duration,
            animated: true
        });
        await toast.present();
    }

    async showLoad(text = 'אנא המתן...') {
        if (!this.isLoading) {
            this.isLoading = true;
            return await this.loadingCtrl.create({
                message: text,
            }).then(a => {
                a.present().then(() => {
                    if (!this.isLoading) {
                        a.dismiss();
                    }
                });
            });
        }
    }

    async hideLoad() {
        if (this.isLoading) {
            this.isLoading = false;
            return await this.loadingCtrl.dismiss();
        }
    }

    setUserData(data) {
        this.setStorageData({label: 'username', value: data.username});
        this.setStorageData({label: 'password', value: data.password});
    }


    setStorageData(data) {
        this.storage.set(data.label, data.value);
    }

    getStorageData(data) {
        /*
         this.storage.get(data).then((res) => {
         console.log(this.storageRes);
         this.storageRes = res;
         });
         setTimeout(function(){
         console.log(this.storageRes);
         return this.storageRes;
         },2000);
         */
    }

    setHeaders(is_auth = false, username = '', password = '', promise = false) {

        if (username !== '') {
            this.username = decodeURIComponent(username);
        }
        if (password !== '') {
            this.password = decodeURIComponent(password);
        }

        let myHeaders: HttpHeaders = new HttpHeaders();
        myHeaders = myHeaders.append('Content-type', 'application/json; charset=UTF-8');
        // myHeaders = myHeaders.append('Accept', '*/*');
        myHeaders = myHeaders.append('Access-Control-Allow-Origin', '*');
        myHeaders = myHeaders.append('version', this.version.toString());
        myHeaders = myHeaders.append('Access-Control-Allow-Credentials', 'true');

        if (is_auth == true) {
            // alert(1);
            myHeaders = myHeaders.append('ApiCode', btoa(encodeURIComponent(this.username) + '|357' + encodeURIComponent(this.password)));
        }
        this.header = {
            headers: myHeaders
        };
        // alert(JSON.stringify(this.header));
        if (promise) {
            return new Promise((resolve) => {
                return resolve({
                    header: this.header
                });

            });
        }
        return this.header;
    }


    ngAfterViewInit() {
        this.storage.get('user_data').then(data => {
            if (data.username) {
                this.username = data.username;
                this.password = data.password;
            }
        });

    }

    setLocation() {
        this.geolocation.getCurrentPosition().then(pos => {
            const params = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
            };

            this.http.post(this.apiUrl + '/locations', params, this.setHeaders(true)).subscribe(data => {
            });
        });
    }

    onBack(set = false) {
        this.back = set;
        this.navLocation.back();
    }

    openVideoChat(param) {
        // alert('in open video chat');
        console.log(param);
        this.storage.get('user_data').then((data) => {
            console.log(this.callAlert);

            if (this.callAlert && this.callAlert != null) {
                // alert(2);
                this.callAlert.dismiss();
                this.callAlert = null;
            }
            this.playAudio('call');

            this.http.post(this.apiUrl + '/calls/' + param.id, {
                message: 'call',
                id: param.chatId
            }, this.setHeaders(true)).subscribe((res: any) => {
                // alert(3);
                // this.stopAudio();
                console.log('init');
                console.log(res);
                if (res.error != '') {
                    this.toastCtrl.create({
                        message: res.error,
                        showCloseButton: true,
                        closeButtonText: 'אישור'
                    }).then(toast => toast.present());

                } else {
                    // /user/call/push/
                    // alert(5);
                    if (res.call.sendPush) {
                        this.http.post(this.url + '/calls/' + param.id + '/push/' + param.id, {}, this.setHeaders(true)).subscribe((data: any) => {

                        });
                    }
                    param.chatId = res.call.callId;
                    $('#close-btn,#video-iframe').remove();
                    const closeButton = document.createElement('button');
                    closeButton.setAttribute('id', 'close-btn');
                    closeButton.style.backgroundColor = 'transparent';
                    closeButton.style.margin = '0 10px';
                    closeButton.style.width = '40px';
                    closeButton.style.height = '40px';
                    closeButton.style['font-size'] = '0px';
                    closeButton.style['text-align'] = 'center';
                    closeButton.style.background = 'url(https://m.richdate.co.il/assets/img/video/buzi_b.png) no-repeat center';
                    closeButton.style['background-size'] = '100%';
                    closeButton.style.position = 'absolute';
                    closeButton.style.bottom = '10px';
                    closeButton.style.left = 'calc(50% - 25px)';
                    closeButton.style.zIndex = '9999';
                    closeButton.onclick = (e) => {
                        // alert(7);
                        console.log('close window');
                        $('#close-btn,#video-iframe').remove();
                        this.http.post(this.apiUrl + '/calls/' + param.id, {
                            message: 'close',
                            id: param.chatId
                        }, this.setHeaders(true)).subscribe((data: any) => {
                            // let res = data.json();
                        });
                        this.videoChat = null;
                    };

                    // alert(9);
                    this.videoChat = document.createElement('iframe');
                    this.videoChat.setAttribute('id', 'video-iframe');
                    // alert(JSON.stringify(data));
                    this.videoChat.setAttribute('src', 'https://m.richdate.co.il/video.html?id=' + data.user_id + '&to=' + param.id);
                    this.videoChat.setAttribute('allow', 'camera; microphone');
                    this.videoChat.style.position = 'absolute';
                    this.videoChat.style.top = '0';
                    this.videoChat.style.left = '0';
                    this.videoChat.style.boxSizing = 'border-box';
                    this.videoChat.style.width = '100vw';
                    this.videoChat.style.height = '101vh';
                    this.videoChat.style.backgroundColor = 'transparent';
                    this.videoChat.style.zIndex = '999';
                    this.videoChat.style['text-align'] = 'center';

                    document.body.appendChild(this.videoChat);
                    document.body.appendChild(closeButton);

                    if (param.alert == false) {
                        this.checkVideoStatus(param);
                    }
                }
            }, error => {
                this.stopAudio();
            });


        });
    }

    playAudio(audio) {
        if (this.callAlertShow == false) {
            this.showLoad();
        }
        if (audio == 'call') {
            this.audioCall.play();
            this.audioCall.loop = true;
        } else {
            this.audioWait.play();
            this.audioWait.loop = true;
        }
    }

    stopAudio() {
        this.audioCall.pause();
        this.audioCall.currentTime = 0;
        this.audioWait.pause();
        this.audioWait.currentTime = 0;
        this.hideLoad();
    }

    checkVideoStatus(param) {
        console.log('check call');
        console.log(param);
        this.http.get(this.url + '/user/call/status/' + param.chatId, this.setHeaders(true)).subscribe((res: any) => {
            // let res = data.json();
            console.log('check');
            console.log(res);
            this.status = res.status;
            if (res.status == 'answer') {

            }
            if (res.status == 'close' || res.status == 'not_answer') {


                this.stopAudio();
                if (this.videoChat != null || this.callAlert != null) {

                    this.toastCtrl.create({
                        message: (this.status == 'not_answer' && this.videoChat && this.videoChat != null) ? ('השיחה עם ' + param.username + ' נדחתה') : 'השיחה הסתיימה',
                        showCloseButton: true,
                        closeButtonText: 'אישור'
                    }).then(toast => toast.present);
                }
                if (this.callAlert && this.callAlert != null) {
                    this.callAlert.dismiss();
                    this.callAlert = null;
                }
                if (this.videoChat && this.videoChat != null) {
                    $('#close-btn,#video-iframe').remove();
                    this.videoChat = null;
                }
            }

            if (this.videoChat != null || this.callAlert != null) {
                const that = this;
                setTimeout(() => {
                    that.checkVideoStatus(param);
                }, 3000);
            }
        });

    }

    getThereForPopup() {
        const that = this;
        if (this.pageName !== 'EditProfilePage' && !this.alertPresent) {
            this.http.get(this.apiUrl + '/update/user/information', this.header).subscribe((res: any) => {
                if (res.needPopup) {
                    this.alertCtrl.create({
                        message: res.texts.message,
                        backdropDismiss: false,
                        buttons: [{
                            text: res.texts.btns.link,
                            handler: () => {
                                that.route.navigate(['/edit-profile']);
                            }
                        }]
                    }).then(alert => {
                        alert.present();
                    });
                } else {
                    console.log('from api wiill set there for complete as true');
                    this.thereForComplete = true;
                    console.log(this.thereForComplete);
                }
            });
        }

        // }
    }

}
