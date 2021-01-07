import { Component, OnInit } from '@angular/core';
import {NavigationExtras, Router} from "@angular/router";

@Component({
  selector: 'app-new-users',
  templateUrl: './new-users.page.html',
  styleUrls: ['./new-users.page.scss'],
})
export class NewUsersPage implements OnInit {

  constructor(
      public router: Router
  ) { }

  ngOnInit() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        params: JSON.stringify({
          filter: 'new',
          page: 1,
          action: 'search',
        })
      }
    };
    this.router.navigate(['/home'], navigationExtras);
  }

}
