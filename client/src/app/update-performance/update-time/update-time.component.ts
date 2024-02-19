import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CommData } from '../../communication-lights/communication-lights.component';
import { TimeFormat } from '../../time-format';

@Component({
  selector: 'app-update-time',
  templateUrl: './update-time.component.html',
  styleUrls: ['./update-time.component.css']
})
export class UpdateTimeComponent implements OnInit {

  @Input() performance_id
  @Input() object

  newMinutes
  newSeconds

  sendDataSeconds = new Subject<CommData>()
  seconds$ = this.sendDataSeconds.asObservable()

  sendDataMinutes = new Subject<CommData>()
  minutes$ = this.sendDataMinutes.asObservable()

  constructor() { }

  getTimeString(object: any) {
    var timeFormat = new TimeFormat()

    var minutes = object.minutes || 0
    var seconds = object.seconds || 0
    timeFormat.minutesAndSeconds = {minutes, seconds}

    return timeFormat.timeString
  }

  updateMinutes() {
    const commData = <CommData> {}
    commData.url = "/api/performance"
    commData.httpVerb = "patch"
    commData.body = {_id: this.performance_id, field: 'minutes', value: this.newMinutes}
    this.sendDataMinutes.next(commData)
  }

  updateSeconds() {
    const commData = <CommData> {}
    commData.url = "/api/performance"
    commData.httpVerb = "patch"
    commData.body = {_id: this.performance_id, field: 'seconds', value: this.newSeconds}
    this.sendDataSeconds.next(commData)
  }


  ngOnInit() {
  }

}
