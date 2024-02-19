import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CommData } from 'src/app/communication-lights/communication-lights.component';
import { TimeFormat } from 'src/app/time-format';

@Component({
  selector: 'app-update-time-limit',
  templateUrl: './update-time-limit.component.html',
  styleUrls: ['./update-time-limit.component.css']
})
export class UpdateTimeLimitComponent implements OnInit {
  type: string;
  width: string;
  newMinutes: string
  newSeconds: string

  sendData = new Subject<CommData>()
  sendData$ = this.sendData.asObservable()
  @Input() round_id: string
  
  constructor() { }

  ngOnInit() {

  }
  ngOnChanges() {

      this.type = 'number'
      this.width = '50px'
  }

  update() {

    var minutes = parseFloat(this.newMinutes) || 0
    var seconds = parseFloat(this.newSeconds) || 0

    var timeFormat = new TimeFormat()
    timeFormat.minutesAndSeconds = {minutes, seconds}

    timeFormat.seconds

    var communicationData: CommData = {
      url: `api/round/`,
      httpVerb: 'patch', 
      body: { _id: this.round_id , field: 'timeLimit', value: timeFormat.seconds }
    }

    this.sendData.next(communicationData)
  }
}


