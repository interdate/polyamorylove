import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {ActivationPageModule} from "./activation/activation.module";

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: '/',
  //   pathMatch: 'full'
  // },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'list',
    loadChildren: () => import('./list/list.module').then(m => m.ListPageModule)
  },
  {
    path: 'login',
    canLoad: [],
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'password-recovery',
    loadChildren: () => import('.//password-recovery/password-recovery.module').then( m => m.PasswordRecoveryPageModule)
  },
  {
    path: 'registration',
    loadChildren: () => import('./registration/registration.module').then( m => m.RegistrationPageModule)
  },
  {
    path: 'select-modal',
    loadChildren: () => import('./select-modal/select-modal.module').then( m => m.SelectModalPageModule)
  },
  {
    path: 'page',
    loadChildren: () => import('./page/page.module').then( m => m.PagePageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then( m => m.SearchPageModule)
  },
  {
    path: 'dialog',
    loadChildren: () => import('./dialog/dialog.module').then( m => m.DialogPageModule)
  },
  {
    path: 'advanced-search',
    loadChildren: () => import('./advanced-search/advanced-search.module').then( m => m.AdvancedSearchPageModule)
  },
  {
    path: 'full-screen-profile',
    loadChildren: () => import('./full-screen-profile/full-screen-profile.module').then( m => m.FullScreenProfilePageModule)
  },
  {
    path: 'bingo',
    loadChildren: () => import('./bingo/bingo.module').then( m => m.BingoPageModule)
  },
  {
    path: 'arena',
    loadChildren: () => import('./arena/arena.module').then( m => m.ArenaPageModule)
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./contact-us/contact-us.module').then( m => m.ContactUsPageModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('./faq/faq.module').then( m => m.FaqPageModule)
  },
  {
    path: 'freeze-account',
    loadChildren: () => import('./freeze-account/freeze-account.module').then( m => m.FreezeAccountPageModule)
  },
  {
    path: 'inbox',
    loadChildren: () => import('./inbox/inbox.module').then( m => m.InboxPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'item-details',
    loadChildren: () => import('./item-details/item-details.module').then( m => m.ItemDetailsPageModule)
  },
  {
    path: 'change-photos',
    loadChildren: () => import('./change-photos/change-photos.module').then( m => m.ChangePhotosPageModule)
  },
  {
    path: 'change-password',
    loadChildren: () => import('./change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'change-password',
    loadChildren: () => import('./change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  },
  {
    path: 'show-photo',
    loadChildren: () => import('./show-photo/show-photo.module').then( m => m.ShowPhotoPageModule)
  },
  {
    path: 'activation',
    loadChildren: () => import('./activation/activation.module').then( m => m.ActivationPageModule)
  },
];
// { path: 'subscription', loadChildren: './subscription/subscription.module#SubscriptionPageModule' },

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
