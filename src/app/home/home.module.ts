import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Routes, RouterModule} from '@angular/router';

import {IonicModule} from '@ionic/angular';

import {HomePage} from './home.page';
import {ShortComponentModule} from "../components/short-profile/short-profile.module";

const routes: Routes = [
    {
        path: '',
        component: HomePage,

    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        ShortComponentModule
    ],
    declarations: [HomePage]
})
export class HomePageModule {
}
