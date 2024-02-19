import { Component, OnInit } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { PermissionsService } from '../permissions.service';
import { SyncArray } from '../sync-array';
import { SyncArrayService } from '../sync-array.service';

@Component({
  selector: 'app-clubs',
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css']
})
export class ClubsComponent implements OnInit {
  clubsSyncArray: SyncArray;
  isAuthenticated: boolean;
  subs = []

  constructor(private syncArrayService: SyncArrayService,
              private oktaAuth: OktaAuthService,
              public permissionsService: PermissionsService) {}


  async ngOnInit() {

    this.clubsSyncArray = this.syncArrayService.getSync('/api/club', true)
    this.subs.push(this.clubsSyncArray)

    this.isAuthenticated = await this.oktaAuth.isAuthenticated()

    this.subs.push(this.oktaAuth.$authenticationState.subscribe(
      (isAuthenticated: boolean) => {
        this.isAuthenticated = isAuthenticated
      }
    ))
  }

  ngOnDestroy() {
    this.subs.map((sub) => sub.unsubscribe())
  }
}
