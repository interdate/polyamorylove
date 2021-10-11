import { Component, OnInit } from '@angular/core';
import {NavigationExtras, Router} from "@angular/router";

@Component({
  selector: 'app-nearme-users',
  templateUrl: './nearme-users.page.html',
  styleUrls: ['./nearme-users.page.scss'],
})
export class NearmeUsersPage implements OnInit {

  constructor(
      private router: Router
  ) { }

  ngOnInit() {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          params: JSON.stringify({
            filter: 'distance',
            page: 1,
            action: 'search',
          })
        }
      };
      this.router.navigate(['/home'], navigationExtras);
  }

}
