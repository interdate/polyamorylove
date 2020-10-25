import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebrtcProvider {
  // public peer: Peer;
  public myStream: MediaStream;
  public myEl: HTMLMediaElement;
  public partnerEl: HTMLMediaElement;
  public chatId: any = 0;
  public partnerId: any = 0;

  stun = 'stun.l.google.com:19302';
  // mediaConnection: Peer.MediaConnection;
  // options: Peer.PeerJSOption;
  stunServer: RTCIceServer = {
    urls: 'stun:' + this.stun,
  };
  public callLive: any;

  constructor() {

    // this.options = {  // not used, by default it'll use peerjs server
    //   key: '069e621462555bb064344b8c239818d879822396',
    //   secure: true,
    //   debug: 3
    // };
  }

  getMedia() {
    if(this.myStream){
      this.myStream = null;
    }
    navigator.getUserMedia({ audio: true, video: true }, (stream) => {
      this.handleSuccess(stream);
    }, (error) => {
      this.handleError(error);
    });
  }

  async init(userId: string, myEl: HTMLMediaElement, partnerEl: HTMLMediaElement) {
    await this.createPeer(userId);
    this.myEl = myEl;
    this.partnerEl = partnerEl;
    if(!this.myStream) {
      try {
        let that = this;
        setTimeout(function () {
          that.getMedia();
        }, 500);
      } catch (e) {
        this.handleError(e);
      }
    }
  }

  async createPeer(userId: string) {
    // this.peer = new Peer(userId);
  }

  call() {
    // this.partnerId = partnerId;
    // this.callLive = this.peer.call(this.partnerId, this.myStream);
    let that = this;
    setTimeout(function () {
      that.callLive.on('stream', (stream) => {
        that.partnerEl.srcObject = stream;
      });
    },200);
  }

  wait() {
    console.log('wait');
    // this.peer.on('call', (call) => {
    //   call.on('stream', (stream) => {
    //     this.partnerEl.srcObject = stream;
    //   });
    //   this.callLive = call;
    //   if(this.myStream) {
    //     this.callLive.answer(this.myStream);
    //   }else{
    //     this.answer();
    //   }
    //
    // });
  }

  answer(){
    if(this.myStream) {
      this.callLive.answer(this.myStream);
      this.call(); // this.partnerId
    } else {
      let that = this;
      setTimeout(function () {
        that.answer();
      },200);
    }
  }

  handleSuccess(stream: MediaStream) {
    this.myStream = stream;
    this.myEl.srcObject = stream;
  }

  handleError(error: any) {
    if (error.name === 'ConstraintNotSatisfiedError') {
      //const v = constraints.video;
      // this.errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
      this.errorMsg(`The resolution px is not supported by your device.`);
    } else if (error.name === 'PermissionDeniedError') {
      this.errorMsg('Permissions have not been granted to use your camera and ' +
          'microphone, you need to allow the page access to your devices in ' +
          'order for the demo to work.');
    }
    this.errorMsg(`getUserMedia error: ${error.name}`, error);
  }

  errorMsg(msg: string, error?: any) {
    const errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += `<p>${msg}</p>`;
    if (typeof error !== 'undefined') {
      console.error(error);
    }
  }

}
