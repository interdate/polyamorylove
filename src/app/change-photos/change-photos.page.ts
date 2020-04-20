import {Component, OnInit} from '@angular/core';
import {ApiQuery} from '../api.service';
import {PagePage} from '../page/page.page';
import {ImagePicker, ImagePickerOptions} from '@ionic-native/image-picker/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import {ActionSheetController, AlertController} from "@ionic/angular";
import {Router, ActivatedRoute} from "@angular/router";
import { ChangeDetectorRef } from '@angular/core';
import * as $ from 'jquery';
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
  dataPage: { noPhoto: any, texts: any, photos: Array<{ _id: string, face: string, isValid: string, isMain: boolean, url: any, isPrivate: boolean}> };
  description: any;

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
      this.api.storage.get('user_data').then(data => {
         if (data) {
             this.username = data.username;
             this.password = data.password;
         }
      });

    this.route.queryParams.subscribe((params: any) => {
      console.log(params);
      this.new_user = params.new_user ? true : false;
    });

    let data = this.api.data;

    this.getPageData();
    this.image = data['images'];


  }

  ionViewWillEnter() {
    this.api.pageName = 'ChangePhotosPage';
    this.checkImages = setInterval( () => {
      this.getPageData();
    }, 10000);
  }


  ionViewWillLeave() {
    clearInterval(this.checkImages);
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
    this.api.http.get(this.api.url + '/api/v2/he/photos/json.json', this.api.setHeaders(true)).subscribe((data: any) => {
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
      this.changeRef.detectChanges();
      $(window).resize();

      if (this.dataPage.photos) {

        const valid = [];
        let main = false;

        for (const img of this.dataPage.photos) {
          console.log(img);
          if (img.isMain) {
            main = true;
          }
          if (img.isValid) {
            valid.push(img);
          }
        }
        if (!main && valid.length > 0) {
          console.log(valid);
          console.log(valid[0].id);
          console.log(this.photos);
          const position = this.dataPage.photos.indexOf(valid[0]);
          this.dataPage.photos[position].isMain = true;
          this.postPageData('mainImage', valid[0]);
        }
      }

      if (afterUpload) {
        this.api.hideLoad();
      }
    }, err => {
      console.log("Oops!" + err);
      this.api.toastCreate('error');
    });
  }


  getPage(id) {
    this.api.data['id'] = id;
    this.router.navigate(['/page']);
  }


  postPageData(type, params) {// not active
    console.log('POstpageData active', params);
    if (type == 'privateImage') {
      params.isPrivate = true;
      var data = JSON.stringify({setPrivate: params.id});
    } else if (type == 'mainImage') {
      console.log('Param', params);
      var data = JSON.stringify({setMain: params.id});

    } else if ('deletePage') {
      this.api.showLoad();
      var data = JSON.stringify({
        delete: params.id
      });
    }

    this.api.http.post(this.api.url + '/api/v2/he/photos.json', data, this.api.setHeaders(true, this.username, this.password)).subscribe((data:any) => {
      this.dataPage = data;
      this.photos = Object.keys(this.dataPage.photos);
      this.api.hideLoad();
      console.log(this.photos);
    }, err => {
      console.log("Oops!");
      this.api.hideLoad();
    });
  }



   edit(photo) {

    let mainOpt = [];

    console.log(photo);
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
        console.log('Cancel clicked');
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
    console.log(this.checkIfMax());
    if (this.checkIfMax())  return;
    //alert('in open gallery');
    let options: ImagePickerOptions = {
      maximumImagesCount: 1,
      width: 600,
      height: 600,
      quality: 100
    };
    //alert(JSON.stringify(options));
    // this.imagePicker.getPictures(options).then((results) => {alert(results)});


     this.imagePicker.getPictures({ maximumImagesCount: 1}).then(
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
    if (this.checkIfMax()) return;

    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      cameraDirection: this.camera.Direction.FRONT,

      targetWidth: 900,
      targetHeight: 600,
      allowEdit: true,
      sourceType: 1
    };

    this.camera.getPicture(options).then((imageData) => {
      console.log('image data: ' + imageData);
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      // let base64Image = 'data:image/jpeg;base64,' + imageData;
     // alert(base64Image);
     // alert(imageData);
      this.api.showLoad();
      this.uploadPhoto(imageData);
    }, (err) => {
      console.log('image data error: ' + err );
    });
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
      this.api.showLoad();
      let options: FileUploadOptions = {
        fileKey: "photo",
        fileName: 'test.jpg',
        chunkedMode: false,
        mimeType: "image/jpg",
        headers: {Authorization: "Basic " + btoa(encodeURIComponent(this.username) + ":" + this.password), version: this.api.version}/*@*/
      };

      const fileTransfer: FileTransferObject = this.transfer.create();
     // alert(options);
      fileTransfer.upload(url, encodeURI(this.api.url + '/api/v2/he/photos.json'), options).then((entry: any) => {
        console.log(entry);
        if (entry.response.errorMessage) {
          this.api.toastCreate(entry.response.errorMessage);
          this.api.hideLoad();
        } else {
          this.getPageData(true);
        }

      }, (err) => {
        console.log('uploadPhoto error: ' + JSON.stringify(err));
        this.api.hideLoad();
      });
  }

  setPrivate(userPhoto) {
    console.log(userPhoto);
    const data = {
      action: userPhoto.isPrivate ? 'private' : 'unprivate',
      photo: userPhoto.id,
    };
    this.api.http.get(this.api.url + '/api/v2/he/photos/privates',  this.api.header).subscribe((data: any) => {
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

}
