import {Component, ViewChild, OnInit, ElementRef} from '@angular/core';
import {ToastController, Events, ModalController, IonRouterOutlet, NavController, IonVirtualScroll} from '@ionic/angular';
import {ApiQuery} from '../api.service';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {Router, ActivatedRoute, NavigationEnd, NavigationExtras} from '@angular/router';
import {IonInfiniteScroll} from '@ionic/angular';
import {IonContent} from '@ionic/angular';
import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import * as $ from 'jquery';
import {ChangeDetectorRef} from '@angular/core';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {ShortUser} from '../interfaces/short-user';
import {InAppPurchase} from "@ionic-native/in-app-purchase/ngx";
import {BehaviorSubject} from "rxjs";
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";

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
    @ViewChild(IonVirtualScroll, {static: false}) virtualScroll: IonVirtualScroll;
    @ViewChild(CdkVirtualScrollViewport, {static: false}) viewport: CdkVirtualScrollViewport;

    public options: { filter: any } = {filter: 1};
    list: any;
    action: any;
    offset: any;
    // page_counter: any;
    loader: any = true;
    username: any;
    password: any;
    blocked_img: any = false;
    user_counter: any = 0;
    form_filter: any;
    filter: any = {filter: '', visible: ''};
    users: ShortUser[];
    texts: any;
    params: any = {action: 'online', filter: 'lastActivity', page: 1, list: ''};
    params_str: any;
    scrolling = false;
    clicked: any;
    subscription: any;
    private paramsSubs: any;


    ids: any = [];

    constructor(public api: ApiQuery,
                public route: ActivatedRoute,
                public router: Router,
                public geolocation: Geolocation,
                public events: Events,
                public splashScreen: SplashScreen,
                public platform: Platform,
                public changeRef: ChangeDetectorRef,
                public iab: InAppBrowser,
                public iap: InAppPurchase,
                public navCtrl: NavController) {


        this.api.storage.get('user_data').then((val) => {
            if (val) {
                this.api.setHeaders(true, val.username, val.password, true).then(() => {
                    // alert(123)
                    this.getUsers(true);
                });
            }
        });
    }


    ngOnInit() {
        // alert('ngoninit');
        this.loader = true;
        this.route.queryParams.subscribe((params: any) => {
            // alert(1233333);
            if (params && params.params && !this.api.back) {
                this.params_str = params.params;
                this.params = JSON.parse(params.params);
                this.params.page = parseInt(this.params.page, 10);
                // @ts-ignore
                if (typeof this.params.page !== Number) {
                    this.params.page = 1;
                }
                console.log(this.params);
                this.viewport.scrollToOffset(0)
            } else if (!this.api.back) {
                this.params = {
                    action: 'online',
                    filter: this.api.data.filter ? this.api.data.filter : 'lastActivity',
                    list: '',
                    page: 1
                };
            }

            this.blocked_img = false;
            this.params_str = JSON.stringify(this.params);
            if (this.params.list == 'black' || this.params.list == 'favorited') {
            }

            if (this.api.password && !this.api.back) {
            }

            this.getLocation();

            if (!this.api.checkedPage || this.api.checkedPage === '' || this.api.checkedPage === 'logout') {
                this.api.checkedPage = 'online';
            }
        });
// if not params and not this params => set params and get users;
// if not params but yes this params then ignore;
        this.api.storage.get('deviceToken').then(token => {
            if (token) {
                this.api.sendPhoneId(token);
            }
            this.api.back = false;

            // if (!this.users) {
            // this.getUsers(true);
            // }
        });

        // $('ion-content').resize();


        this.api.storage.get('afterLogin').then((data: any) => {


            if (data != null) {
                this.api.data.user = {id: data.user.id};
                this.router.navigate([data.url]).then(() => {
                    this.api.storage.remove('afterLogin').then(r => {
                    });
                });
            }
        });

    }


    ionViewWillEnter() {

        if (this.platform.is('ios') && this.api.canRequestItunes && !this.api.isPay ) {
            // alert(42)
            this.api.restoreIosPurchase();
        }

        this.paramsSubs = this.route.queryParams.subscribe((params: any) => {
            if ((this.api.pageName === 'LoginPage') || ((params.params) && (params.params.filter !== this.params.filter || this.params.action !== params.params.action))) {

                this.ngOnInit();
                this.getUsers();
            }
        });

        $(document).on('backbutton', () => {
            if (this.router.url === '/home') {

                // tslint:disable-next-line:no-string-literal
                navigator['app'].exitApp();
            } else {
                this.api.onBack();
            }
        });

        this.events.subscribe('logo:click', () => {
            if (this.params.filter === 'online' || this.params.filter === 'search') {
                this.viewport.scrollToOffset(0)

            } else {
                this.blocked_img = false;
                this.params = {
                    action: 'online',
                    page: 1,
                    filter: 'lastActivity',
                    list: ''
                };
                this.loader = true;
                this.getUsers();

            }
        });

        this.events.subscribe('footer:click', (params) => {
            this.params = JSON.parse(params.queryParams.params);
            this.getUsers();
        });


        this.api.pageName = 'HomePage';


    }

    ionViewWillLeave() {
        this.paramsSubs.unsubscribe();
        this.events.unsubscribe('logo:click');
        this.events.unsubscribe('footer:click');
        $(document).off();
    }

    itemTapped(user) {
        if (this.scrolling == false) {
            user.fullPhoto = user.photo;
            const navigationExtras: NavigationExtras = {
                queryParams: {
                    data: JSON.stringify({user})
                }
            };
            this.api.route.navigate(['/profile'], navigationExtras);
        }
    }

    filterStatus() {
        this.options.filter = this.options.filter === 1 ? 0 : 1;
    }

    toDialog(user) {
        this.api.data.user = user;
        this.router.navigate(['/dialog'], {state: {user}});
    }

    checkUnique(needUpdate = false) {

        let stop = false;
        if (needUpdate) {
            this.params.page++;
            this.params_str = JSON.stringify(this.params);
        }
        this.api.http.post(this.api.apiUrl + '/users/results', this.params_str, this.api.setHeaders(true))
            .subscribe((data: any) => {
                if (data.users.length) {
                    for (const user of data.users) {
                        if (stop) {
                            break;
                        }
                        if (this.ids.includes(user.id)) {
                            // alert('!!!!!!!');
                            stop = true;
                        } else {
                            this.ids.push(user.id);
                        }
                    }

                    console.log(this.ids);
                    this.checkUnique(true);
                }
            });
    }

    ClickSortInput() {
        this.clicked = true;
    }

    sortBy() {
        this.params.filter = this.filter;
        this.api.data.filter = this.filter;
        this.loader = this.users.length < 10 ? false : true;
        console.log(this.loader)
        this.params.page = 1;
        this.params_str = JSON.stringify(this.params);
        this.api.showLoad();
        this.api.back = false;
        this.viewport.scrollToOffset(0)
        this.getUsers();
    }

    getUsers(test = false) {
        // alert('getUsers')
        this.splashScreen.hide();
        if (!this.api.back || test === true) {
            if (!this.params.page) {
                this.params.page = 1;
            }
            this.params_str = JSON.stringify(this.params);
            this.api.http.post(this.api.apiUrl + '/users/results', this.params_str, this.api.setHeaders(true)).subscribe((data: any) => {

                this.users = data.users;
                this.texts = data.texts;
                this.user_counter = data.users.length;
                this.form_filter = data.filters;
                this.filter = data.filter;
                if (data.users.length < 10) {
                    console.log(data)
                    this.loader = false;
                } else {
                    this.loader = true;
                }

                this.changeRef.detectChanges();
                this.api.hideLoad();
                this.viewport.scrollToOffset(0)
            }, err => {

                this.api.hideLoad();
            });

        } else {
            this.api.hideLoad();
        }
    }

    getLocation() {
        this.geolocation.getCurrentPosition().then(pos => {
        });

    }


    moreUsers(event = false) {

        // alert('moreUsers')
        if (this.loader) {
            this.params.page++;
            if (!this.params.page && !this.api.back) {
                this.params.page = 2;
            }
            this.params_str = JSON.stringify(this.params);
            this.api.http.post(this.api.apiUrl + '/users/results', this.params_str, this.api.setHeaders(true)).subscribe((data: any) => {
                if (data.users.length < 10) {
                    this.loader = false;
                }

                // this should prevent users from appearing twice
                let newUsers = [];
                data.users.filter(newUser => !this.users.some(existingUser => existingUser.id === newUser.id))
                        .forEach(filteredUser =>  newUsers.push(filteredUser));
                this.changeRef.detectChanges()
                this.users = [...this.users, ...newUsers]
                this.changeRef.detectChanges()
            });
        }
    }

    scrollEvent(): void {

        if (this.viewport.measureScrollOffset('bottom') <= 400) {
            this.moreUsers();
        }

    }

    onScroll(event) {
        this.scrolling = true;
        $('.my-invisible-overlay').show();
    }


    endscroll(event) {
        setTimeout(() => {
            $('.my-invisible-overlay').hide();
            this.scrolling = false;
        }, 4000);

    }

    toVideoChat(user) {
        this.api.openVideoChat({id: user.id, chatId: 0, alert: false, username: user.username});
    }

}
