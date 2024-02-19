import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'
import * as Ably from 'ably';
import { HttpClient } from '@angular/common/http';
import { IsLoadingService } from './is-loading.service';

interface Prefix {
  prefix: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _realtime: Ably.Realtime
  private start= new Subject<void>()
  public $start = this.start.asObservable()

  private stateChange = new Subject<Ably.Types.ConnectionStateChange>()
  public $stateChange = this.stateChange.asObservable()

  public prefix: string

  get realtime() {
    return this._realtime
  }

  maintainConnection() {
    var that = this
    this._realtime = null
    var tryingToReconnect = true

		function connect() {
      that._realtime = new Ably.Realtime({ authUrl: '/api/live/auth' });

			that._realtime.connection.on(function(stateChange) {
        that.stateChange.next(stateChange)

				if (stateChange.current === 'closed') {
					that._realtime = null
				}

				if (stateChange.current === 'connected' && tryingToReconnect) {
          that.start.next()
          tryingToReconnect = false
				}
			})
		}

		var interval = 1000
		setInterval(function() {
			if (that._realtime === null) {
				connect()
			}
		}, interval)
  }


  constructor(private http: HttpClient, private isLoadingService: IsLoadingService) {
    this.isLoadingService.fetching()
    this.http.get<Prefix>('/api/live/prefix').subscribe(
      prefix => {
        this.prefix = prefix.prefix
        this.maintainConnection()
        this.isLoadingService.fetched()
      },
      error => {
        console.log(error)
      }
    )    
  }
}
