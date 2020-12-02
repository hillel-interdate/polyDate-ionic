import {Component, ViewChild, OnInit} from '@angular/core';
import {AlertController, Events, IonContent} from '@ionic/angular';
import {ApiQuery} from '../api.service';
import {Router, NavigationExtras} from '@angular/router';
import * as $ from 'jquery';

import { ChangeDetectorRef } from '@angular/core';

declare var Peer;

@Component({
  selector: 'page-dialog',
  templateUrl: 'dialog.page.html',
  styleUrls: ['dialog.page.scss']
})

export class DialogPage implements OnInit{
  @ViewChild(IonContent, {static: false}) content: IonContent;

  user: any = {};
  users: Array<{ id: string, isOnline: string, nick_name: string, image: string }>;
  texts: any = {a_conversation_with: '', title: '', photo: ''};
  message: any;
  messages: any = [];
  checkChat: any;
  notReadMessage: any = [];
  deleteMyMess: boolean;
  page: any = 1;
  addMoreMessages: any;
  messData: any;
  allowedToReadMessage: any;
  showUl: any = false;
  quickMessages: [];
  checkedQm: number;
  cantWrite = false;
  contactWasChecked = false;
  cantWriteAlert: any;
  cantWriteMessage: any;

  peerConnection: any;
  peerjs: any;
  peerConnectionApp: any;

  peerToUser: string;
  peerToUserApp: string;
  myPeer;

  constructor(public api: ApiQuery,
              public router: Router,
              public changeRef: ChangeDetectorRef,
              public events: Events,
              public alertCtrl: AlertController,
              ) {}


  ngOnInit() {
    this.api.back = false;
    this.user = this.api.data['user'];
    this.getMessages();
    this.checkIfCanWrite();

    this.myPeer = 'polyApp' + this.api.userId + '_' + this.user.id;
    this.peerToUser = 'poly' + this.user.id + '_' + this.api.userId;
    this.peerToUserApp = 'polyApp' + this.user.id + '_' + this.api.userId;
    const that = this;
    setTimeout( () => {
      that.peerInit();
    }, 1000);
  }
    getMessages() {
      console.log(this.user['id']);
      this.api.http.get(this.api.apiUrl + '/dialogs/' + this.user['id'] + '?per_page=30&page=' + this.page, this.api.setHeaders(true)).subscribe((data:any) => {
        //alert(1)
          $('.footerMenu').hide();
          // console.log(data);
          this.user = data.dialog.contact;
          this.user.contactImage = data.contactImage;
          this.texts = data.texts;
          this.messages = data.history;
          this.allowedToReadMessage = true; // data.allowedToReadMessage;
          this.quickMessages = data.quickMessages;
          for (let i = 0; i < this.messages.length; i++) {
              if(this.messages[i].isRead == false) {
                  this.notReadMessage.push(this.messages[i].id);
                //alert(2)
              }
          }
        this.scrollToBottom(500, 0);
        this.addMoreMessages = this.messages.length < 30 ? false : true;
        // console.log(this.addMoreMessages);
      }, err => {
          console.log("Oops!");
      });
  }

  scrollToBottom(t, s = 300) {
    ////alert(1);
     const that = this;
     setTimeout( () => {
      // console.log('will scroll');
      that.content.scrollToBottom(s);
      $('.messages').scrollTop(99999);
   }, t );
  }




  peerInit() {
    // alert(this.myPeer);
    if (!this.api.peerjs[this.myPeer]) {
      // alert(1)
      console.log('PEERJS');
      console.log(this.api.peerjs);
      this.api.peerjs[this.myPeer] = new Peer(this.myPeer, {
        host: 'peerjs.wee.co.il',
        port: 9000,
        secure: true,
        path: '/peerjs',
        // debug: 3
      });
    }

    this.waitPeer();
    let that = this;
    setTimeout(() => {
      that.start();
    }, 500);
  }

  waitPeer() {
    if (typeof this.api.peerjs[this.myPeer] == 'object') {
      if (typeof this.api.peerjs[this.myPeer].on == 'undefined') {
        this.api.peerjs[this.myPeer] = new Peer(this.myPeer, {
          host: 'peerjs.wee.co.il',
          port: 9000,
          path: '/peerjs',
          secure: true,
          // debug: 3
        });
        this.waitPeer();
        this.start();
      } else {
        this.api.peerjs[this.myPeer].on('open', data => {
          console.log('data: ' + data);
          // console.log(this.myPeer);
        });
        this.api.peerjs[this.myPeer].on('connection', (conn) => {

          if (conn.peer == this.peerToUser) {
            this.peerConnection = conn;
          } else if (conn.peer == this.peerToUserApp){
            this.peerConnectionApp = conn;
          }
          console.log(this.peerConnection);
          console.log(this.peerConnectionApp);

          for (const message of this.messages ) {
            message.isRead = true;
          }

          this.peerConnection.on('data', (data) => {
            console.log('Received', data);
            this.peerMessage(data);
          });

          this.peerConnectionApp.on('data', (data) => {
            console.log('Received', data);
            this.peerMessage(data);
          });
        });
        this.api.peerjs[this.myPeer].on('error', (err) => {
          console.log(err.type);
          console.log(err);
          if (err.type == 'disconnected') {
            console.log(this.api.peerjs);
            console.log('will reconnect now');
            this.peerInit();
            this.api.peerjs[this.myPeer].reconnect();
          }
        });
        this.api.peerjs[this.myPeer].on('disconnected', (e) => {
          console.log('diconnect');
          this.peerConnection = null;
          // this.start();
        });
      }
    }
  }


  start() {

    // this.peerConnection = this.api.peerjs.connect('polyApp' + this.user['id'] + this.api.userId);
    // this.peerConnection.on('data', (data) => {
    //   // alert('get message from dialog.page');
    //   console.log('Received', data);
    //   this.events.publish('messages:peerjs', data);
    // });
    //
    // this.peerConnection.on('disconnect', data => {
    //   this.start();
    // });

    // alert('in start');
    console.log(this.peerConnection);
    console.log(this.peerConnectionApp);

    // if (typeof this.peerConnection != 'object') {
      this.peerConnection = this.api.peerjs[this.myPeer].connect(this.peerToUser);

      this.peerConnection.on('data', (data) => {
        console.log('Received from "start"2', data);
        // if (this.peerConnection.open)  {
          this.peerMessage(data);
        // }
      });
    //
    // }


    // if (this.peerConnectionApp != 'object') {
      this.peerConnectionApp = this.api.peerjs[this.myPeer].connect(this.peerToUserApp);

      this.peerConnectionApp.on('data', (data) => {
        console.log('Received from "start1"', data);
        // if (this.peerConnection.open){
          this.peerMessage(data);
        // }
      });

      this.peerConnectionApp.on('disconnected', data => {
        console.log('on disconnected');
        console.log(data);
      });
    // }


  }




  onOpenKeyboard() {
    if (this.cantWrite) {
      this.showCantWriteAlert();
    } else {
      this.scrollToBottom(100);
    }
  }
  onCloseKeyboard() {

  }

  back() {
    $('.footerMenu').show();
    setTimeout(() => {
      $('.scroll-content, .fixed-content').css({'margin-bottom': '57px'});
    }, 500);

    this.api.onBack(true);
   }

  sendPush() {
    this.api.http.post(this.api.apiUrl + '/sends/' + this.user.id + '/pushes', {}, this.api.setHeaders(true)).subscribe(data => {});
  }

  ulToggle() {
    if (this.cantWrite) {
      this.showCantWriteAlert();
    } else {
      this.showUl = !this.showUl;
      if (!this.showUl) {
        this.checkedQm = 0;
      } else {
        this.checkIfCanWrite();
      }
    }
  }

  sendQuickMessage() {
    // alert(1);
    // if (!this.cantWrite) {
    if (this.checkedQm > 0) {
      this.sendMessage(this.checkedQm);
      this.checkedQm = 0;
      this.showUl = false;
    }
      // }
  }

  sendMessage(quickMessage = 0) {
    if (this.message || quickMessage > 0) {
      const params: any = {
        message: this.message,
      };
      if (quickMessage > 0) {
        params.quickMessage = quickMessage;
      }
      this.messData = {
        message: {
          username: this.api.username,
          text: this.message,
          delivered: false,
          messPoss: this.messages.length ? this.messages.length : 0
        }
      };
      // console.log(this.messData);
      this.messages.push(this.messData.message);
      this.message = '';

      this.api.http.post(this.api.apiUrl + '/sends/' + this.user.id + '/messages', params, this.api.setHeaders(true)).subscribe((data: any) => {
        if (data.message) {
          data.message.action = 'new';
          // console.log(data);
          data.message['delivered'] = true;
          this.messages[this.messData.message.messPoss] = data.message;
          this.allowedToReadMessage = true; // data.allowedToReadMessage;
          // alert()
          this.notReadMessage.push(data.message.id);
          this.scrollToBottom(150);
          this.helperSend(JSON.stringify(data.message));
          this.sendPush();
        } else {
          this.api.toastCreate(data.errorMessage);
          this.messages.splice(this.messData.message.messPoss, 1);
        }
      });
    }

  }

  moreMessages(event) {

  // console.log('more users run');

  if (this.addMoreMessages) {
    this.page++;
    this.api.http.get(this.api.apiUrl + '/dialogs/' + this.user.id + '?per_page=30&page=' + this.page, this.api.setHeaders(true)).subscribe((data: any) => {
      // console.log(data);
      // $('.messages').css('overflow', 'hidden');

      for (const message of data.history) {
        this.messages.unshift(message);
      }
      // console.log(this.messages);
      this.addMoreMessages = data.history.length < 30 ? false : true;
    });
  }


  event.target.complete();

  }

  // getNewMessages() {
  //
  //   let myLastMess = this.notReadMessage.slice(-1)[0] ? this.notReadMessage.slice(-1)[0] : false;
  //   console.log('not read messages');
  //  // let messageData = JSON.stringify(this.notReadMessage);
  //   // var notReadMessageStr = '?messages=['+messagesIds+']';
  //   let messageData = '';
  //   for (let i = 0; i < this.notReadMessage.length; i++) {
  //     messageData +=  messageData == '' ? this.notReadMessage[i] : ', ' + this.notReadMessage[i];
  //   }
  //
  //   console.log(this.notReadMessage);
  //
  //  // this.api.http.get(this.api.apiUrl + '/chats/' + this.user.id + '/new/messages' + notReadMessageStr, this.api.setHeaders(true)).subscribe((data:any) => {
  //  // this.api.http.get(this.api.apiUrl + '/chats/' + this.user.id + '/new/messages?lastMess=' + myLastMess, this.api.setHeaders(true)).subscribe((data:any) => {
  //   this.api.http.get(this.api.apiUrl + '/chats/' + this.user.id + '/new/messages?notReadMess=' + messageData, this.api.setHeaders(true)).subscribe((data:any) => {
  //
  //     if (data.lastIsRead) {
  //       let ids = [];
  //       ids.push(data.lastIsRead.map((vel) => {
  //         console.log(vel[0]);
  //         return vel.MessageId;
  //       }));
  //
  //       this.messages.filter((obj) => {
  //         if (ids[0].includes(obj.id)) {
  //           obj.isRead = true;
  //           console.log(obj.isRead);
  //           this.notReadMessage.splice(this.notReadMessage.indexOf(obj.id), 1);
  //
  //         }
  //       });
  //
  //     }
  //
  //   //  alert(0);
  //     if (data.newMessages && data.newMessages.length > 0) {
  //       // alert(1);
  //       let isRead = '';
  //       for (let message of data.newMessages) {
  //         isRead += message.id + ', ';
  //         if (this.allowedToReadMessage) {
  //           for (let y = this.messages.length - 1, x = 0; x < this.notReadMessage.length; x++, y--) {
  //
  //             this.messages[y].isRead = true;
  //             console.log(this.messages);
  //           }
  //          // alert('notReadMessage will be empty');
  //           this.notReadMessage = [];
  //         }
  //         this.messages.push(message);
  //         // alert(300)
  //         this.scrollToBottom(300);
  //
  //       }
  //      // if (this.allowedToReadMessage) {
  //        let params = JSON.stringify({
  //          messages_id: isRead
  //        });
  //       // alert(isRead);
  //        this.api.http.post(this.api.apiUrl + '/reads/' + this.user.id + '/messages', params, this.api.setHeaders(true)).subscribe((data: any) => {
  //          // alert(5);
  //        });
  //      // }
  //     }
  //
  //   });
  //
  // }

  setMessageAsRead(messageId) {
     this.api.http.post(this.api.apiUrl + '/reads/' + this.user.id + '/messages', {messages_id: messageId}, this.api.setHeaders(true))
         .subscribe((data: any) => {
           // alert(5);
     });
  }


  deleteMessage(message, index) {

    // this.api.showLoad();
   // console.log(message);
    this.api.storage.get('user_data').then(user_data => {

      if(user_data){
        // console.log('in if data');
         this.deleteMyMess = message.from == user_data.user_id ? true : false;
      }
    //  console.log(this.deleteMyMess);
      let data = {
        messageId: message.id,
        deleteFrom: this.deleteMyMess,
        userId: user_data.user_id,
        contactId: this.user.id
      };
      this.api.http.post(this.api.apiUrl + '/deletes/messages.json', data, this.api.header).subscribe(data => {
        if (data) {

          // console.log(index);
          this.messages.splice(index, 1);
          // console.log(this.messages);
          this.api.hideLoad();
        } else {
          this.api.hideLoad();
        }
      });
    });

  }

  readMessagesStatus() {
    if (this.notReadMessage.length > 0) {
      const params = JSON.stringify({
        messages: this.notReadMessage
      });

      this.api.http.post(this.api.apiUrl + '/checks/messages', params, this.api.setHeaders(true)).subscribe((data:any) => {

        for (let i = 0; i < this.messages.length; i++) {
          if (data.readMessages.indexOf(this.messages[i].id) !== '-1') {
          this.messages[i].isRead = 1;
          }
        }
        for (let e = 0; this.notReadMessage.length; e++) {
          if (data.readMessages.indexOf(this.notReadMessage[e]) !== '-1') {
          delete this.notReadMessage[e];
          }
        }
      });
    }
  }

  subscription() {
    this.router.navigate(['/subscription']);
  }

  ionViewWillLeave() {
    clearInterval(this.checkChat);
    // this.events.unsubscribe('messages:new');
    // this.api.peerjs = this.peerConnection = this.peerConnectionApp = null;
    // this.events.unsubscribe('messages:peerjs');
    this.api.peerjs[this.myPeer].disconnect();
    // this.peerConnectionApp = this.peerConnection = null;
    $('.footerMenu').show();
    $(document).off();
  }

  toProfilePage() {
    // this.api.data['user'] = this.user;
    const navigationExtras: NavigationExtras = {
      queryParams: {
        data: JSON.stringify({
          user: this.user
        })
      }
    };
    this.router.navigate(['/profile'], navigationExtras);
  }

  ionViewWillEnter() {

    $(document).one('backbutton', () => {
      this.api.onBack(true);
    });

    this.api.pageName = 'DialogPage';
    $('.footerMenu').hide();
    this.scrollToBottom(400);
    const that = this;
    // this.checkChat = setInterval(() => {
    //   that.getNewMessages();
    // }, 10000);

    $('button').click(() => {
      $('textarea').val('');
    });

  }




  peerMessage(message) {
    const newMessage = JSON.parse(message);
    if (newMessage.action === 'new') {
      const messagesLength = this.messages.length - 1;
      let canAdd = true;

      for (let i = messagesLength; i > 0; i--) {
        if (this.messages[i].id === newMessage.id) {
          canAdd = false;
          break;
        }

        if (canAdd) {
          this.messages.push(newMessage);
          this.scrollToBottom(300);
          this.setMessageAsRead(newMessage.id);
          newMessage.action = 'read';
          this.helperSend(JSON.stringify(newMessage));
        }
      }
    } else {
      const messagesLength = this.messages.length;
      for (let i = 1; i < messagesLength; i++) {
        if ( this.messages[i].id == newMessage.id) {
          this.messages[i].isRead = true;
          break;
        }
      }
    }
  }

  helperSend(message) {

    if (typeof this.peerConnection == 'object') {
      console.log(this.peerConnection);
      // if ( this.peerConnection.open) {
      console.log('send message in @helper send@ from peerConnection');
      this.peerConnection.send(message);
       // } // else {
      //   this.start();
      //   this.helperSend(message);
      // }
    } else {
      this.start();
      this.helperSend(message);
    }

    if (typeof this.peerConnectionApp == 'object') {
      if (this.peerConnectionApp.send && typeof this.peerConnectionApp.send != 'undefined') {
        console.log('send message in @helper send@ from peerConnectionApp');
        this.peerConnectionApp.send(message);
      } else {
        this.start();
        this.helperSend(message);
      }
    } else {
      this.start();
      this.helperSend(message);
    }

  }

  useFreePointToReadMessage(message) {
    let index = this.api.functiontofindIndexByKeyValue(this.messages, 'id', message.id);
    this.api.http.get(this.api.apiUrl + '/chats/' + message.id + '/use/free/point/to/read/message.json', this.api.setHeaders(true)).subscribe((data:any) => {
      this.messages[index].text = data.messageText;
      //this.setMessagesAsRead([message.id]);
      if (!data.userHasFreePoints) {
        // Update page
        //this.messages = [];
        //this.getMessages();
        for (let i = 0; i < this.messages.length; i++) {
          this.messages[i].hasPoints = 0;
        };
      }
    });
  }

  checkIfCanWrite() {
    if (!this.contactWasChecked) {
      this.api.http.get(this.api.apiUrl + '/writes/' + this.user.id, this.api.header).subscribe((res: any) => {
        if (!res.canContact) {
          this.cantWrite = true;
          this.cantWriteMessage = res.message;
          this.showCantWriteAlert();
        }
      });
      this.contactWasChecked = true;
    }
  }

  showCantWriteAlert() {
    this.alertCtrl.create({
      header: this.cantWriteMessage.messageHeader,
      message: this.cantWriteMessage.messageText,
      backdropDismiss: false,
      buttons: [
        {
          text: this.cantWriteMessage.btns.ok,
        }
      ]
    }).then(alert => alert.present());
  }


  ionViewDidLoad() { }
}