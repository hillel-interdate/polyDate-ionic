import {Component, ViewChild, OnInit, ElementRef} from '@angular/core';
import {ToastController, Events, ModalController, IonRouterOutlet} from '@ionic/angular';
import {ApiQuery} from '../api.service';
import {Geolocation } from '@ionic-native/geolocation/ngx';
import {Router, ActivatedRoute, NavigationEnd, NavigationExtras} from '@angular/router';
import {IonInfiniteScroll} from '@ionic/angular';
import {IonContent} from '@ionic/angular';
import {Platform} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import * as $ from 'jquery';
import { ChangeDetectorRef } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import {ShortUser} from '../interfaces/short-user';




@Component({
  selector: 'page-home',
  styleUrls: ['./home.page.scss'],
  templateUrl: 'home.page.html',
  providers: [Geolocation]
})
export class HomePage implements OnInit {

    @ViewChild(IonContent, {static: false}) content: IonContent;
    @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;
    @ViewChild(IonRouterOutlet, {static: false}) routerOutlet: IonRouterOutlet;

    public options: { filter: any } = {filter: 1};
    list: any;
    action: any;
    offset: any;
    //page_counter: any;
    loader: any = true;
    username: any;
    password: any;
    blocked_img: any = false;
    user_counter: any = 0;
    form_filter: any;
    filter: any = {filter: '', visible: ''};
    users: ShortUser[];
    texts: any;
    params: any = {action: 'online', filter: '', page: 1, list: ''};
    params_str: any;
    scrolling = false;
    clicked: any;
    subscription: any;


    constructor(public api: ApiQuery,
                public route: ActivatedRoute,
                public router: Router,
                public geolocation: Geolocation,
                public events: Events,
                public splashScreen: SplashScreen,
                public platform: Platform,
                public changeRef: ChangeDetectorRef,
                public iap: InAppBrowser) {

        // this.api.audioCall = new Audio();
        // this.api.audioCall.src = 'https://www.richdate.co.il/phone_ringing.mp3';
        // this.api.audioCall.loop = true;
        // this.api.audioCall.load();
        // this.api.audioWait = new Audio();
        // this.api.audioWait.src = 'https://www.richdate.co.il/landline_phone_ring.mp3';
        // this.api.audioWait.loop = true;
        // this.api.audioWait.load();

        // alert(2)
        this.api.storage.get('user_data').then((val) => {

            if (val) {
                this.api.setHeaders(true, val.username, val.password, true).then(data => {
                    this.getUsers();
                });
            }
        });
    }


    ngOnInit() {
        this.loader = true;
        // this.params.page = 1;
        this.route.queryParams.subscribe((params: any) => {
            if (params && params.params && !this.api.back) {
                // alert(111);
                this.params_str = params.params;
                this.params = JSON.parse(params.params);
                console.log(this.params);
                this.params.page = parseInt(this.params.page, 10);
                // this.content.scrollToTop(0);
            } else  if (!this.api.back) {
                // alert(22);
                this.params =  {
                    action: 'online',
                    filter: this.api.data['filter'] ? this.api.data['filter'] : 'lastActivity',
                    list: '',
                    page: 1
                };
            }

            this.blocked_img = false;
            this.params_str = JSON.stringify(this.params);
            if (this.params.list == 'black' || this.params.list == 'favorited') {
                // this.blocked_img = true;
            }

            console.log(this.api.back);


            //this.api.back = false;
            if(this.api.password && !this.api.back){
                this.users = [];
                this.getUsers(true);
            }
            console.log('users run from constructor');
            // this.getLocation();

            if (!this.api.checkedPage || this.api.checkedPage == '' || this.api.checkedPage == 'logout') {
                this.api.checkedPage = 'online';
            }
            // alert(this.api.checkedPage);
        });
// if not params and not ths params => set params and get users;
// if not params but yes this params then ignore;
        this.api.storage.get('deviceToken').then(token => {
            console.log(token);
            if (token) {
                this.api.sendPhoneId(token);
            }
            this.api.back = false;
            if(!this.users) {
                this.getUsers(true);
            }
        });

        $('ion-content').resize();


        this.api.storage.get('afterLogin').then((data: any) => {
            console.log('afterLogin data in home:');
            console.log(data);
            if ( data != null ){
                this.api.data['user'] = {id: data.user.id};

                this.router.navigate([data.url]).then(() => {
                    this.api.storage.remove('afterLogin');
                });
            }
        });

    }



    ionViewWillEnter() {
        this.api.pageName = 'HomePage';
        console.log(this.api.userId);
        this.events.subscribe('logo:click', () => {
            // alert(5)
            //
            // alert(this.params.filter);
            if(this.params.filter == 'online' || this.params.filter == 'search') {
                this.content.scrollToTop(200);
            } else {
                this.blocked_img = false;
                this.params = {
                    action: 'online',
                    page: 1,
                    list: ''
                };
                // this.router.navigate(['/home', this.params]);
                this.params_str = JSON.stringify(this.params);
                // alert(this.params_str);
                this.loader = true;
                this.getUsers();

            }
        });

        this.events.subscribe('footer:click', (params) => {
            this.params = JSON.parse(params.queryParams.params);
            console.log(this.params);
            this.getUsers();
        });

    }

    ionViewWillLeave() {
        this.events.unsubscribe('logo:click');
    }



    filterStatus() {
       this.options.filter = this.options.filter === 1 ? 0 : 1;

        // if(this.options.filter == 1) {
        //     this.options.filter = 0;
        //     // $('.ion-list').css({
        //     //     'height': '97%'
        //     // });
        // } else {
        //     this.options.filter = 1;
        //     // $('.ion-list').css({
        //     //     'height': '95%'
        //     // });
        // }

    }

    toDialog(user) {
        this.api.data['user'] = user;
        this.router.navigate(['/dialog'], {state: {user: user}});
    }




    ClickSortInput() {
        this.clicked = true;
    }

    sortBy() {
        this.params.filter = this.filter;
        this.api.data['filter'] = this.filter;
        this.loader = this.users.length < 10 ? false : true;
        this.params.page = 1;
        this.params_str = JSON.stringify(this.params);
        // alert('in sirtby');
        //if (this.clicked) {
            // alert('clicked');
        this.api.showLoad();
        this.api.back = false;
            this.content.scrollToTop(500);
            console.log('users run from sort');
           // alert('clickes');
            this.getUsers();
        //    this.clicked = false;
        //}

    }

    getUsers(test = false) {
        // console.log(this.params);
        // console.log(test);
        this.splashScreen.hide();
        if ( !this.api.back || test === true) {
            if (!this.params.page) {
                this.params.page = 1;
                this.params_str = JSON.stringify(this.params);
            }
            console.log(this.params_str);
            //console.log(test);
            this.api.http.post(this.api.apiUrl + '/users/results', this.params_str, this.api.setHeaders(true)).subscribe((data: any) => {

                this.users = data.users;
                this.texts = data.texts;
                this.user_counter = data.users.length;
                this.form_filter = data.filters;
                this.filter = data.filter;
                if (data.users.length < 10) {
                    this.loader = false;
                } else {
                    this.loader = true;
                }

                this.changeRef.detectChanges();
                // alert(3);
                this.api.hideLoad();
                this.content.scrollToTop(0);


            }, err => {
                // alert( 'getUsers data error: '  + JSON.stringify(err));
                if(err.status == 403) {
                    // this.api.setHeaders(false, null, null);
                    // // Removing data storage
                    // this.api.storage.remove('user_data');
                    // this.router.navigate(['/login']);
                }
                this.api.hideLoad();
            });

        } else {
            this.api.hideLoad();
        }

    }

    getLocation() {

    }


    moreUsers(event) {
        console.log('more users run');
        // this.content.scrollToTop(0);
        if (this.loader) {
            this.params.page++;
            if (!this.params.page && !this.api.back) {
                this.params.page = 2;
            }
            this.params_str = JSON.stringify(this.params);
            this.api.http.post(this.api.apiUrl + '/users/results', this.params_str, this.api.setHeaders(true)).subscribe((data: any) => {
                console.log('user data');
                console.log(data);
                if (data.users.length < 10) {
                    this.loader = false;
                }

                for (let person of data.users) {
                    this.users.push(person);
                }
            });
        }
        event.target.complete();
    }


    onScroll(event) {
        this.scrolling = true;
        $('.my-invisible-overlay').show();
    }


    endscroll(event) {
        console.log('in end scroll');
        // this.moreUsers();
        var that = this;
        setTimeout(function () {
            $('.my-invisible-overlay').hide();
            that.scrolling = false;
        }, 4000);

    }

    toVideoChat(user) {
        this.api.openVideoChat({id: user.id, chatId: 0, alert: false, username: user.username});
    }

  }
