import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { IsLoadingService } from './is-loading.service';
import { NotificationService } from './notification.service';
import { SyncArray } from './sync-array';
import { WatchParentsService } from './watch-parents.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  private _isAuthenticated
  owner: SyncArray
  scorekeeper: SyncArray
  admin: SyncArray
  subs = []
  authSub: any;

    constructor ( private http: HttpClient, 
                  private notifications: NotificationService,
                  private oktaAuth: OktaAuthService, 
                  private isLoadingService: IsLoadingService,
                  private watchParentsService: WatchParentsService)
    { 
      this.authentication().then(() => {
        
      }).catch(error => {
        console.error(error)
      })
    }

  isMyRole(role: 'owner' | 'scorekeeper' | 'admin', _id) {

    if (!this[role] || !this[role].keepUpToDate) {
      return false
    }

    var rows = this[role].keepUpToDate.rows

    return rows.find((row) => { return row['_id'] === _id }) !== undefined
  }

  isMyClub(_id) {
    return this.isMyRole('owner', _id)
  }

  async authentication() {
    
      var isAuthenticated = await this.oktaAuth.isAuthenticated()
      this.setAuthenticationStatus(isAuthenticated)

      this.authSub = this.oktaAuth.$authenticationState.subscribe(
        isAuthenticated => {
          this.setAuthenticationStatus(isAuthenticated)
        }
      )
    }

    async setAuthenticationStatus (isAuthenticated: boolean) {
        this._isAuthenticated = isAuthenticated

        this.unsync()
        this.sync()
    }

    private async fetchUserId() {

      var accessToken = await this.oktaAuth.getAccessToken()
      let headers = new HttpHeaders();
      headers.append('Authorization', `Bearer ${accessToken}`)

      this.isLoadingService.fetching()
      var data = await this.http.get('api/permissions/user_id', {headers}).toPromise()
      this.isLoadingService.fetched()
      return data['_id']
    }

  private async sync() {


    var that = this
    var userId = await this.fetchUserId()
    
    async function watch(role: string) {
      var url = `api/permissions/${role}/${userId}`;

      that[role] = new SyncArray( that.http, that.notifications, 
                                  that.isLoadingService, 
                                  that.watchParentsService);
      that[role].init(url, true);

      that.subs.push(that[role])
      /*
      that.subs.push(that.owner.$changed.subscribe(
        () => {
        }
      ));
      */
    }

    async function watchPermissions() {
      var roles = ['owner', 'scorekeeper', 'admin']

      roles.forEach(role => watch(role))
    }

    watchPermissions();
  }

    unsync() {
        this.subs.map(sub => sub.unsubscribe())
    }
}
