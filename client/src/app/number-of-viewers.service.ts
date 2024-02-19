import { Injectable } from '@angular/core';
// Borrowed code from: https://stackoverflow.com/a/23176223


@Injectable({
  providedIn: 'root'
})
export class NumberOfViewersService {

  private ws: WebSocket
  private _isCompeitionIdSent: boolean
  private _competition_id

  public numberOfWatchers

  private sendCompetitionId(that = this) {
 
    if (that.ws.readyState === that.ws.OPEN && !that._isCompeitionIdSent) {

      var message = JSON.stringify({competitionId: that._competition_id})
      that.ws.send(message)
      that._isCompeitionIdSent = true
    }

    if (!that._isCompeitionIdSent) {
      setTimeout(that.sendCompetitionId, 1000, that)
    }
  }

  set competition_id(competition_id) {
    this.numberOfWatchers = undefined
    this._isCompeitionIdSent = false
    this._competition_id = competition_id
    this.sendCompetitionId()
  }

  constructor() {
    this.connect()
  }

  private connect() {
    var that = this
    this.ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);
    this.ws.onopen = function () {
      //console.log('Connected to socket.')
      if (that._competition_id && !that._isCompeitionIdSent) {
        that.sendCompetitionId()
      }
    };

    this.ws.onmessage = function (e) {
      //console.log('Message:', e.data);
      that.numberOfWatchers = e.data
    };

    var that = this
    this.ws.onclose = function (e) {
      //console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      that._isCompeitionIdSent = false
      that.numberOfWatchers = undefined
      setTimeout(function () {
        that.connect();
      }, 1000);
    };

    this.ws.onerror = function (err: any) {
      //console.error('Socket encountered error: ', err.message, 'Closing socket');
      that.ws.close();
    };
  }
}
