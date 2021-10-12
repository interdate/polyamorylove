import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'home/:id',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'he/payment/subscribe',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'list',
    loadChildren: () => import('./pages/list/list.module').then(m => m.ListPageModule)
  },
  {
    path: 'login',
    canLoad: [],
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'password-recovery',
    loadChildren: () => import('./pages//password-recovery/password-recovery.module').then( m => m.PasswordRecoveryPageModule)
  },
  {
    path: 'registration',
    loadChildren: () => import('./pages/registration/registration.module').then( m => m.RegistrationPageModule)
  },
  {
    path: 'select-modal',
    loadChildren: () => import('./pages/select-modal/select-modal.module').then( m => m.SelectModalPageModule)
  },
  {
    path: 'page',
    loadChildren: () => import('./pages/page/page.module').then( m => m.PagePageModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./pages/search/search.module').then( m => m.SearchPageModule)
  },
  {
    path: 'dialog',
    loadChildren: () => import('./pages/dialog/dialog.module').then( m => m.DialogPageModule)
  },
  {
    path: 'advanced-search',
    loadChildren: () => import('./pages/advanced-search/advanced-search.module').then( m => m.AdvancedSearchPageModule)
  },
  {
    path: 'full-screen-profile',
    loadChildren: () => import('./pages/full-screen-profile/full-screen-profile.module').then( m => m.FullScreenProfilePageModule)
  },
  {
    path: 'bingo',
    loadChildren: () => import('./pages/bingo/bingo.module').then( m => m.BingoPageModule)
  },
  {
    path: 'arena',
    loadChildren: () => import('./pages/arena/arena.module').then( m => m.ArenaPageModule)
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./pages/contact-us/contact-us.module').then( m => m.ContactUsPageModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('./pages/faq/faq.module').then( m => m.FaqPageModule)
  },
  {
    path: 'freeze-account',
    loadChildren: () => import('./pages/freeze-account/freeze-account.module').then( m => m.FreezeAccountPageModule)
  },
  {
    path: 'inbox',
    loadChildren: () => import('./pages/inbox/inbox.module').then( m => m.InboxPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'item-details',
    loadChildren: () => import('./pages/item-details/item-details.module').then( m => m.ItemDetailsPageModule)
  },
  {
    path: 'change-photos',
    loadChildren: () => import('./pages/change-photos/change-photos.module').then( m => m.ChangePhotosPageModule)
  },
  {
    path: 'change-password',
    loadChildren: () => import('./pages/change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./pages/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'change-password',
    loadChildren: () => import('./pages/change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  },
  {
    path: 'show-photo',
    loadChildren: () => import('./pages/show-photo/show-photo.module').then( m => m.ShowPhotoPageModule)
  },
  {
    path: 'activation',
    loadChildren: () => import('./pages/activation/activation.module').then( m => m.ActivationPageModule)
  },
  {
    path: 'new-users',
    loadChildren: () => import('./pages/new-users/new-users.module').then( m => m.NewUsersPageModule)
  },
  {
    path: 'nearme-users',
    loadChildren: () => import('./pages/nearme-users/nearme-users.module').then( m => m.NearmeUsersPageModule)
  },
  {
    path: 'online-users',
    loadChildren: () => import('./pages/online-users/online-users.module').then( m => m.OnlineUsersPageModule)
  },
  {
    path: 'subscription',
    loadChildren: () => import('./pages/subscription/subscription.module').then( m => m.SubscriptionPageModule)
  },
  {
    path: 'messenger-notifications',
    loadChildren: () => import('./pages/messenger-notifications/messenger-notifications.module').then( m => m.MessengerNotificationsPageModule)
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
