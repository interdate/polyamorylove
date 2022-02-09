import {Component, OnInit} from '@angular/core';
import {ApiQuery} from '../../api.service';
import {ActionSheetController, AlertController} from '@ionic/angular';
import {Router, ActivatedRoute} from '@angular/router';
import {ChangeDetectorRef} from '@angular/core';
import * as $ from 'jquery';
import {Camera, CameraOptions} from '@awesome-cordova-plugins/camera/ngx';

@Component({
    selector: 'page-change-photos',
    templateUrl: 'change-photos.page.html',
    styleUrls: ['change-photos.page.scss'],
    providers:[Camera]

})
export class ChangePhotosPage implements OnInit {

    image: any;
    photos: any;
    imagePath: any;
    username: any;
    password: any;
    new_user = false;
    checkImages: any;
    dataPage: { noPhoto: any, texts: any, photos: Array<{ _id: string, face: string, isValid: string, isMain: boolean, url: any, isPrivate: boolean, statusText: string }> };
    description: any;
    showOnHomepage: boolean;

    constructor(public actionSheetCtrl: ActionSheetController,
                public api: ApiQuery,
                public router: Router,
                public route: ActivatedRoute,
                public alertCtrl: AlertController,
                private camera: Camera,
                public changeRef: ChangeDetectorRef) {
    }


    ngOnInit() {

    }

    ionViewWillEnter() {
        this.api.pageName = 'ChangePhotosPage';
        this.route.queryParams.subscribe((params: any) => {
            this.new_user = params.new_user ? true : false;
            setTimeout(() => {
                this.api.storage.get('user_data').then(userData => {
                    if (userData) {
                        this.username = userData.username;
                        this.password = userData.password;
                    }
                });
            }, this.new_user ? 0 : 1000);
        });
        const data = this.api.data;
        this.getPageData();
        this.image = data['images'];
    }


    ionViewWillLeave() {
    }


    delete(photo) {
        this.alertCtrl.create({
            header: this.dataPage.texts.deletePhoto,
            buttons: [{
                text: 'Yes',
                handler: () => {
                    this.postPageData('deleteImage', photo);
                }
            },
                {
                    text: 'No',
                }]
        }).then(confirm => confirm.present());
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
            this.api.hideLoad();

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


    postPageData(type, params) {
        let data;
        if (type == 'privateImage') {
            params.isPrivate = true;
            data = JSON.stringify({setPrivate: params.id});
        } else if (type == 'mainImage') {
            data = JSON.stringify({setMain: params.id});

        } else if ('deletePage') {
            this.api.showLoad();
            data = JSON.stringify({
                delete: params.id
            });
        }

        this.api.http.post(this.api.apiUrl + '/photos.json', data, this.api.setHeaders(true, this.username, this.password)).subscribe((data: any) => {
            this.getPageData();
        }, err => {
            console.log("Oops!");
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
        this.lightSheet(mainOpt, status);
    }

    async lightSheet(mainOpt = [], status) {
        let actionSheet = await this.actionSheetCtrl.create({
            header: 'Edit image',
            subHeader: this.dataPage.texts.status + ': ' + status,
            buttons: mainOpt
        });
        await actionSheet.present();
    }

    add() {
        const gallery = document.querySelector('#gallery') as HTMLInputElement;
        const camera = document.querySelector('#camera') as HTMLInputElement;
        this.actionSheetCtrl.create({
            header: this.dataPage.texts.add_photo,
            buttons: [
                {
                    text: this.dataPage.texts.choose_from_camera,
                    icon: 'aperture',
                    // handler: () => this.openCamera()
                    handler: () => this.openCamera()
                }, {
                    text: this.dataPage.texts.choose_from_gallery,
                    icon: 'photos',
                    // handler: () => this.openGallery()
                    handler: () => gallery.click()
                }, {
                    text: this.dataPage.texts.cancel,
                    role: 'destructive',
                    icon: 'close',
                }
            ]
        }).then(toast => toast.present());
    }

    // openGallery() {
    //
    //     if (this.checkIfMax()) return;
    //     let options: ImagePickerOptions = {
    //         maximumImagesCount: 1,
    //         width: 600,
    //         height: 600,
    //         quality: 100
    //     };
    //
    //     this.imagePicker.getPictures({maximumImagesCount: 1}).then(
    //         (file_uris) => {
    //             this.uploadPhoto(file_uris[0]);
    //         },
    //         (err) => {
    //             console.log(err);
    //         }
    //     );
    // }


    checkIfMax() {
        if (this.photos.length > 7 || (this.api.isPay && this.photos.length > 15)) {
            const text = this.api.isPay ? 'You can upload only 16 photos' : 'You can upload only 8 photos';
            this.api.toastCreate(text);
            return true;
        }
        return false;
    }

    openCamera() {
        if (this.checkIfMax()) return;

        const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            cameraDirection: this.camera.Direction.FRONT,

            targetWidth: 900,
            targetHeight: 600,
            allowEdit: false,
            sourceType: 1
        };

        this.camera.getPicture(options).then((imageData) => {
            const blob = this.b64toBlob(imageData, 'image/jpg')
            this.api.showLoad();
            this.uploadPhotoNew(blob);
        }, (err) => {
            console.log('image data error: ' + err);
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
        if (el.innerHTML == '') {
            el.appendChild(div);
        }
    }

    // uploadPhoto(url) {
    //     this.api.showLoad();
    //     const options: FileUploadOptions = {
    //         fileKey: 'photo',
    //         fileName: 'test.jpg',
    //         chunkedMode: false,
    //         mimeType: 'image/jpg',
    //         headers: {
    //             ApiCode: btoa(encodeURIComponent(this.username) + '|357' + encodeURIComponent(this.password)),
    //         },
    //     };
    //     const fileTransfer: FileTransferObject = this.transfer.create();
    //     fileTransfer.upload(url, encodeURI(this.api.apiUrl + '/photos.json'), options).then((entry: any) => {
    //         console.log({entry});
    //         if (entry.response.errorMessage) {
    //             this.api.toastCreate(entry.response.errorMessage);
    //             this.api.hideLoad();
    //         } else {
    //             this.getPageData(true);
    //         }
    //
    //     }, (err) => {
    //         console.log('uploadPhoto error: ' + JSON.stringify(err));
    //         this.api.hideLoad();
    //         this.getPageData(true);
    //     }).catch(err => console.log(err));
    // }

    setPrivate(userPhoto) {
        const data = {
            action: userPhoto.isPrivate ? 'private' : 'unprivate',
            photo: userPhoto.id,
        };
        this.api.http.get(this.api.apiUrl + '/photos/privates', this.api.header).subscribe((data: any) => {
            if (data.success) {
                this.getPageData();
            }
        });
    }

    onHomePage() {
        this.router.navigate(['/home']);
    }

    updateShowOnHomepage() {
        this.api.http.get(this.api.apiUrl + '/updates/' + this.showOnHomepage + '/on/homepage', this.api.header).subscribe((res: any) => {
        });
    }

    async uploadPhotoNew($event: Event | Blob) {
        this.api.showLoad();
        let input: Blob;
        if ($event instanceof Event) {
            const elem = $event.target as HTMLInputElement;
            input = await this.resizeImg(elem.files[0]);
        } else {
            input = $event;
        }
        const fd = new FormData();
        fd.append('photo', input, 'test.jpg')
        // const fileTransfer: FileTransferObject = this.transfer.create();
        const headers = this.api.setFormHeaders(this.username, this.password);
        this.api.http.post(this.api.apiUrl + '/photos.json', fd, headers).subscribe((res: any) => {
            if (res.response && res.response.errorMessage) {
                this.api.toastCreate(res.response.errorMessage);
                this.api.hideLoad();
            } else {
                this.getPageData(true);
            }
        }, (err) => {
            console.log('uploadPhoto error: ' + JSON.stringify(err));
            this.api.hideLoad();
            this.getPageData(true);
        })
    }

    // this resize solution is taken from:
    // https://stackoverflow.com/questions/10333971/html5-pre-resize-images-before-uploading/51828753#51828753
    private async resizeImg(file: File): Promise<Blob> {
        let img = document.createElement("img");
        img.src = await new Promise<any>(resolve => {
            let reader = new FileReader();
            reader.onload = (e: any) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
        await new Promise(resolve => img.onload = resolve)
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        let MAX_WIDTH = 600;
        let MAX_HEIGHT = 900;
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        let result = await new Promise<Blob>(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.95);
        });
        return result;
    }

    //and this is taken from:
    //https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
    private b64toBlob(b64Data, contentType = '', sliceSize = 512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }
}
