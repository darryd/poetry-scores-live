import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CommData } from '../communication-lights/communication-lights.component';
import { TimeFormat } from '../time-format';

@Component({
  selector: 'app-button-with-comm-light',
  templateUrl: './button-with-comm-light.component.html',
  styleUrls: ['./button-with-comm-light.component.css']
})
export class ButtonWithCommLightComponent implements OnInit {

  @Input() commData: CommData
  @Input() buttonLabel: string
  @Input() commDataFunc: () => CommData
  @Input() isUncertain: boolean
  @Input() onClickCallback: ()=>void

  timeout = 10
  timeLeft = 0
  sendData = new Subject<CommData>()
  sendData$ = this.sendData.asObservable()
  isTimerRunning: boolean;
  hasLights: boolean;
  clickEventSub: any;

  constructor() { }


  getTimeString(seconds) {

    var timeFormat = new TimeFormat()
    timeFormat.seconds = seconds

    return timeFormat.timeString
  }

  sleep(interval: number) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(interval), interval)
    })
  }

  async startTimer() {

    while (this.isTimerRunning) {
      this.timeLeft = 0 // stop the other startTimer from running
      await this.sleep(100)
    }
    
    this.isTimerRunning = true
    this.timeLeft = this.timeout
    while (this.timeLeft > 0) {
      await this.sleep(1000)
      if (this.timeLeft > 0) this.timeLeft--
    }
    this.isTimerRunning = false
  }

  ngOnInit() {
  }

  ngOnChanges() {
    // No comm data. No need for lights.
    this.hasLights = (this.commData || this.commDataFunc) !== undefined
  }

  ngOnDestroy() {
  }

  sendRequest() {
    
      if (this.commData) {
        this.sendData.next(this.commData)
      }
      if (this.commDataFunc) {
        this.sendData.next(this.commDataFunc())
      }

      if (this.onClickCallback) {
        this.onClickCallback()
      }
    
  }

  yes() {
    this.timeLeft = 0

    var that = this
    setTimeout( ()=> that.sendRequest(), 100)

  }

  no() {
    this.timeLeft = 0
  }

  onClick() {

    if (this.isTimerRunning) {
      // this prevents a weird bug when the user presses repeatedly on the button
      return
    }
    if (!this.isUncertain) {
      this.sendRequest()
    } else {
      this.startTimer()
    }
  }

}
