import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { KeepUpToDate } from './keep-up-to-date';
import { Subject } from 'rxjs';
import { EventMessage } from './keep-up-to-date'
import { IsLoadingService } from './is-loading.service';
import { WatchParentsService } from './watch-parents.service';
import { MaintainConnection } from './maintain-connection';

interface SyncData {
  channelName: string,
  rows: any[]
}

export class SyncArray {
  
  private changed = new Subject<void>()
  $changed = this.changed.asObservable()
  
  maintainConnection: MaintainConnection

  keepUpToDate: KeepUpToDate = new KeepUpToDate()
  private channelName: string;
  url: string
  listener;
  watcherId: any;

  private unsubscribed = new Subject<any>()
  unsubscribed$ = this.unsubscribed.asObservable()
  idField: string;

  getListener(that=this) {
    return function(msg) {
      var eventMessage : EventMessage = msg.data

      if (eventMessage.url === that.url) {
        that.keepUpToDate.processEvent(eventMessage)
        that.changed.next()
      }
    }
  }

  constructor(private http: HttpClient, 
              private notifications: NotificationService,
              private isLoadingService: IsLoadingService,
              private watchParentsService: WatchParentsService) 
  {
    this.maintainConnection = new MaintainConnection(this.notifications)                
  }

  private fetchArray() {

    return new Promise((resolve, reject)  => {

      this.isLoadingService.fetching()
      this.http.get<SyncData>(this.url).subscribe(
        syncData => {
          this.isLoadingService.fetched()
          this.channelName = syncData.channelName
          this.keepUpToDate.rows = <any[]>syncData.rows
          this.keepUpToDate.updateRow()

          this.changed.next()
          resolve(this.channelName)
        },
        error => {
          console.log(error)
          reject(error)
      }
      )
    })
  }

  unsubscribe() {

    this.maintainConnection.unsubscribe()


    this.watchParentsService.unregister(this.watcherId)
    this.unsubscribed.next()
  }

  getNameAndId(url: string) {
    
    var parts = url.split('/')
    var length = parts.length

    var name = parts[length -2]
    name = name[0].toUpperCase() + name.substring(1)

    var _id = parts[length -1]

    return {name, _id}
  }

  async init(url: string, doNotWatchParents=false, idField='_id') {
    this.listener = this.getListener()
    this.url = url
    this.idField = idField

    if (!doNotWatchParents) {
      this.watcherId = this.watchParentsService.register(url, this.listener, idField)
    }

    await this.fetchArray() // this gets called before we know channelName
    this.maintainConnection.init(this.channelName, (msg) => this.listener(msg), () => this.fetchArray() )
  }
}
