import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { SyncArray } from './sync-array';
import { SyncFollow } from './sync-follow';
import { IsLoadingService } from './is-loading.service';
import { WatchParentsService } from './watch-parents.service';

@Injectable({
  providedIn: 'root'
})
export class SyncArrayService {

  constructor(private http: HttpClient, 
              private notifications: NotificationService, 
              private isLoadingService: IsLoadingService,
              private watchParentsService: WatchParentsService) {}

  getSync(url: string, doNotWatchParents=false, idField='_id') {
    var sync = new SyncArray(this.http, this.notifications, this.isLoadingService, this.watchParentsService)
    sync.init(url, doNotWatchParents, idField)
    return sync
  }  
  getSyncFollow(id: any, name, url) {
    var follow = new SyncFollow(this.http, this, this.isLoadingService)
    follow.follow(id, name, url)
    return follow
  }
}