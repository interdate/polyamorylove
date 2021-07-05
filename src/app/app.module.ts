import { NgModule , CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy} from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage';
import { HttpClientModule } from '@angular/common/http';
import {SelectModalPageModule} from './select-modal/select-modal.module';
import { Market } from '@ionic-native/market/ngx';

import { LoadingController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import {Push} from '@ionic-native/push/ngx';
import {FileTransfer} from '@ionic-native/file-transfer/ngx';
// import { HttpModule } from '@angular/http';
import {ImagePicker} from '@ionic-native/image-picker/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import {SocialComponent} from "./components/social/social.component";
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';

@NgModule({
    declarations: [AppComponent, SocialComponent],
  entryComponents: [],
  imports: [
    // HttpModule,
    BrowserModule,
    IonicModule.forRoot({
      animated: true,
      scrollAssist: true,
    }),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot(),
    SelectModalPageModule,
  ],
  providers: [
    Push,
    StatusBar,
    SplashScreen,
    LoadingController,
    Geolocation,
    Market,
    FileTransfer,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ImagePicker,
    InAppBrowser,
    AndroidPermissions,
    LocalNotifications,
    Deeplinks,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}





