import {Component, OnInit} from '@angular/core';
import {ApiQuery} from '../api.service';
import {PagePage} from '../page/page.page';
import {ImagePicker, ImagePickerOptions} from '@ionic-native/image-picker/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import {ActionSheetController, AlertController} from '@ionic/angular';
import {Router, ActivatedRoute} from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import * as $ from 'jquery';

// declare var Camera: any;
// declare var navigator: any;
 /*
 Generated class for the ChangePhotos page.
 See http://ionicframework.com/docs/v2/he/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-change-photos',
  templateUrl: 'change-photos.page.html',
  styleUrls: ['change-photos.page.scss'],
  providers: [Camera, FileTransferObject, ImagePicker]

})
export class ChangePhotosPage implements OnInit{

  image: any;
  photos: any;
  imagePath: any;
  username: any;
  password: any;
  new_user = false;
  checkImages: any;
  dataPage: {
    noPhoto: any,
    texts: any,
    photos: Array<{
      _id: string,
      face: string,
      isValid: string,
      isMain: boolean,
      url: any,
      isPrivate: boolean
    }> };
  description: any;
  showOnHomepage: boolean;

  constructor(public actionSheetCtrl: ActionSheetController,
              public api: ApiQuery,
              public router: Router,
              public route: ActivatedRoute,
              public camera: Camera,
              public transfer: FileTransfer,
              public alertCtrl: AlertController,
              public fileTransfer: FileTransferObject,
              public  imagePicker: ImagePicker,
              public changeRef: ChangeDetectorRef){}


  ngOnInit() {

  }

  ionViewWillEnter() {
    this.api.pageName = 'ChangePhotosPage';

    this.route.queryParams.subscribe((params: any) => {
      this.new_user = params.new_user ? true : false;

      const that = this;
      setTimeout(() => {
        this.api.storage.get('user_data').then(userData => {
          if (userData) {
            this.username = userData.username;
            this.password = userData.password;
          }
        });
      }, that.new_user ? 0 : 1000 );

    });





    const data = this.api.data;

    this.getPageData();
    this.image = data['images'];
  }


  ionViewWillLeave() {
    // clearInterval(this.checkImages);
  }


   delete(photo) {
    this.alertCtrl.create({
      header: this.dataPage.texts.deletePhoto,
    //  message: 'This is an alert message.',
      buttons: [{
        text: 'כן',
        handler: () => {
          this.postPageData('deleteImage', photo);
        }
      },
        {
          text: 'לא',
        }]
    }).then(confirm =>  confirm.present());
  }


  getCount(num) {
    return parseInt(num) + 1;
  }


  getPageData(afterUpload = false) {
    this.api.http.get(this.api.apiUrl + '/photos/json.json', this.api.setHeaders(true)).subscribe((data: any) => {
      if (!afterUpload) {
        const currentPhotoCount = this.photos ? this.photos.length : 0;
        const newPhotoCount = data.photos ? data.photos.length : 0;
        if (currentPhotoCount != newPhotoCount) {
          afterUpload = true;
        }
      }

      this.dataPage = data;
      this.description = data.texts.description;
      this.photos = Object.keys(this.dataPage.photos);
      this.showOnHomepage = data.showOnHomepage;
      this.changeRef.detectChanges();


      $(window).resize();

      if (this.photos) {

        const valid = [];
        let main = false;

        for (const img of this.dataPage.photos) {
          if (img.isMain) {
            main = true;
          }
          if (img.isValid) {
            valid.push(img);
          }
        }
        if (!main && valid.length > 0) {
          const position = this.dataPage.photos.indexOf(valid[0]);
          this.dataPage.photos[position].isMain = true;
          this.postPageData('mainImage', valid[0]);
        }
      }

      // if (afterUpload) {
      this.api.hideLoad();
      // }
    }, err => {
      console.log("Oops!" + err);
      this.api.hideLoad();
      this.api.toastCreate('error');
    });
  }


  getPage(id) {
    this.api.data['id'] = id;
    this.router.navigate(['/page']);
  }


  postPageData(type, params) {// not active
    if (type == 'privateImage') {
      params.isPrivate = true;
      var data = JSON.stringify({setPrivate: params.id});
    } else if (type == 'mainImage') {
      var data = JSON.stringify({setMain: params.id});

    } else if ('deletePage') {
      this.api.showLoad();
      var data = JSON.stringify({
        delete: params.id
      });
    }

    this.api.http.post(this.api.apiUrl + '/photos.json', data, this.api.setHeaders(true, this.username, this.password)).subscribe((data:any) => {

      // this.api.hideLoad();

      this.getPageData();
    }, err => {
      console.log("Oops!"+ err);
      this.api.hideLoad();
    });
  }



   edit(photo) {
    let mainOpt = [];
    if (!photo.isMain && photo.isValid) {

      mainOpt.push({
            text: this.dataPage.texts.set_as_main_photo,
            icon: 'contact',
            handler: () => {
              this.postPageData('mainImage', photo);
            }
          }
      );
    }
    mainOpt.push({
      text: this.dataPage.texts.delete,
      role: 'destructive',
      icon: 'trash',
      handler: () => {
        this.delete(photo);
      }
    });
    if (!photo.isMain) {
      mainOpt.push({
        text: !photo.isPrivate ? this.dataPage.texts.setPrivate : this.dataPage.texts.unsetPrivate,
        role: 'destructive',
        icon: 'eye-sharp',
        handler: () => {
          this.postPageData('privateImage', photo);
        }
      });
    }
    mainOpt.push({
      text: this.dataPage.texts.cancel,
      role: 'destructive',
      icon: 'close',
      handler: () => {

      }
    });


    var status = photo.isValid ? this.dataPage.texts.approved : this.dataPage.texts.waiting_for_approval;
    this.lightSheet(mainOpt,status);
   }

  async lightSheet(mainOpt = [], status) {
    let actionSheet = await this.actionSheetCtrl.create({
      header: 'ערוך תמונה',

      subHeader: this.dataPage.texts.status + ': ' + status,

      buttons: mainOpt
    });
   await actionSheet.present();
  }

   add() {

     this.actionSheetCtrl.create({
      header: this.dataPage.texts.add_photo,
      buttons: [
        {
          text: this.dataPage.texts.choose_from_camera,
          icon: 'aperture',
          handler: () => this.openCamera()
        }, {
          text: this.dataPage.texts.choose_from_gallery,
          icon: 'photos',
          handler: () => this.openGallery()
        }, {
          text: this.dataPage.texts.cancel,
          role: 'destructive',
          icon: 'close',
        }
      ]
    }).then(toast => toast.present());

  }


  openGallery() {

    if (this.checkIfMax())  return;
    //alert('in open gallery');
    let options: ImagePickerOptions = {
      maximumImagesCount: 1,
      width: 600,
      height: 600,
      quality: 100
    };
    // alert(JSON.stringify(options));
    // this.imagePicker.getPictures(options).then((results) => {alert(results)});


     this.imagePicker.getPictures(options).then(
        (file_uris) => {
         // alert('in ok');
          this.uploadPhoto(file_uris[0]);
        },

        (err) => {
          console.log(err);
        }
    );
  }


  checkIfMax() {
    if (this.photos.length > 7 || (this.api.isPay && this.photos.length > 15)) {
      const text = this.api.isPay ? 'ניתן לעלות עד 16 תמונות' : 'ניתן לעלות עד 8 תמונות';
      this.api.toastCreate(text);
      return true;
    }
    return false;
  }

  openCamera() {

    // let cameraOptions = {
    //   quality: 100,
    //   destinationType: this.camera.DestinationType.FILE_URI,
    //   sourceType: this.camera.PictureSourceType.CAMERA,
    //   encodingType: this.camera.EncodingType.JPEG,
    //   // targetWidth: 600,
    //   // targetHeight: 600,
    //   // saveToPhotoAlbum: true,
    //   // chunkedMode: true,
    // };
    //
    // this.camera.getPicture(cameraOptions).then((imageData) => {
    //     alert('in then of get picture');
    //   this.uploadPhoto(imageData);
    // }, (err) => {
    //   console.log(err);
    // });
    if (this.checkIfMax()) { return; }


    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      cameraDirection: this.camera.Direction.FRONT,
      correctOrientation: true,
      targetWidth: 900,
      targetHeight: 600,
      allowEdit: false,
      sourceType: this.camera.PictureSourceType.CAMERA,
      saveToPhotoAlbum: true
    };

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
     console.log(base64Image);
      console.log(imageData);
      this.api.showLoad();
      this.uploadPhoto(imageData);
    }, (err) => {
      console.log('image data error: ' + err );
    });
/*
    let options = {
      // Some common settings are 20, 50, and 100
      quality: 90,
      destinationType: Camera.DestinationType.FILE_URI,
      // In this app, dynamically set the picture source, Camera or photo gallery
      sourceType: Camera.PictureSourceType.CAMERA,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      allowEdit: false,
      correctOrientation: true,
      targetWidth: 900,
      targetHeight: 600,
      saveToPhotoAlbum: true
    }

    let that = this;

    navigator.camera.getPicture(function cameraSuccess(imageUri) {
      console.log(imageUri);
      that.uploadPhoto(imageUri);

    }, function cameraError(error) {
      console.debug("Unable to obtain picture: " + error, "app");

    }, options);

     */
  }

  safeHtml(el): any {
    let html = this.description;
    let div: any = document.createElement('div');
    div.innerHTML = html;
    [].forEach.call(div.getElementsByTagName("a"), (a) => {
      var pageHref = a.getAttribute('click');
      if (pageHref) {
        a.removeAttribute('click');
        a.onclick = () => this.getPage(pageHref);
      }
    });
    if(el.innerHTML == '') {
      el.appendChild(div);
    }
  }

  uploadPhoto(url) {
    console.log({url});
      this.api.showLoad();
      const options: FileUploadOptions = {
        fileKey: 'photo',
        fileName: 'test.jpg',
        chunkedMode: false,
        mimeType: 'image/jpg',
        headers: {
          ApiCode: btoa(encodeURIComponent(this.username) + '|357' + encodeURIComponent(this.password)),
          version: this.api.version.toString()
        },
      };
      const fileTransfer: FileTransferObject = this.transfer.create();
      // alert(url);
      fileTransfer.upload(url, encodeURI(this.api.apiUrl + '/photos.json'), options).then((entry: any) => {
        console.log({entry});
        if (entry.response.errorMessage) {
          this.api.toastCreate(entry.response.errorMessage);
          this.api.hideLoad();
        } else {
          this.getPageData(true);
        }

      }, (err) => {
        console.log('uploadPhoto error: ' + JSON.stringify(err));
        this.api.hideLoad();
        this.getPageData(true);
      });
  }

  setPrivate(userPhoto) {
    const data = {
      action: userPhoto.isPrivate ? 'private' : 'unprivate',
      photo: userPhoto.id,
    };
    this.api.http.get(this.api.apiUrl + '/photos/privates',  this.api.header).subscribe((data: any) => {
      if (data.success) {
        this.getPageData();
        // this.dataPage.photos[this.getCount(userPhoto)].isPrivate = true;
      }
    });
    //
  }

  onHomePage() {
    this.router.navigate(['/home']);
  }

  updateShowOnHomepage() {
    this.api.http.get(this.api.apiUrl + '/updates/' + this.showOnHomepage + '/on/homepage', this.api.header).subscribe((res: any) => {

    });
  }

}
