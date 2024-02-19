import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { IsLoadingService } from './is-loading.service';

@Injectable({
  providedIn: 'root'
})
export class IsAuthenticatedService {

  private _isAuthenticated
  private _accessToken: string;
  private _user
  private _id
  private _sync

  get isAuthenticated() {
    return this._isAuthenticated
  }

  get accessToken() {
    return this._accessToken
  }

  get user() {
    return this._user
  }

  getUserId() {

    this._id = undefined
  }

  fetchUserId() {
    return new Promise((resolve, reject) => {
      this.isLoadingService.fetching()
      this.http.get('api/permissions/user_id').subscribe(
        data => {
          this.isLoadingService.fetched()
          resolve(data['_id'])
        },
        error => reject(error)
      )
    })
  }

  async setStatus(isAuthenticated: boolean) {
    this._isAuthenticated = isAuthenticated
    try {
      this._accessToken = await this.oktaAuth.getAccessToken()
      this._user = await this.oktaAuth.getUser()

    } catch (error) {
      console.error(error)
    }

    //this.getUserId()
  }

  constructor(private oktaAuth: OktaAuthService, 
              private http: HttpClient, 
              private isLoadingService: IsLoadingService/*, private notificationService: NotificationService*/,
              /*private permissionsService: PermissionsService*/) {
    this.oktaAuth.$authenticationState.subscribe(
      async (isAuthenticated: boolean) => this.setStatus(isAuthenticated)
    )
    this.oktaAuth.isAuthenticated().then(async (isAuthenticated) => this.setStatus(isAuthenticated))
  }
}
