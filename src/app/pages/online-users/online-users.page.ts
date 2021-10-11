import { Component, OnInit } from '@angular/core';
import {NavigationExtras, Router} from "@angular/router";

@Component({
  selector: 'app-online-users',
  templateUrl: './online-users.page.html',
  styleUrls: ['./online-users.page.scss'],
})
export class OnlineUsersPage implements OnInit {

  constructor(
      public router: Router
  ) { }

  ngOnInit() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        params: JSON.stringify({
          filter: 'lastActivity',
          page: 1,
          action: 'search',
        })
      }
    };
    this.router.navigate(['/home'], navigationExtras);
  }

}
