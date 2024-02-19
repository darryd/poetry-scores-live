import { Component, Input, OnInit } from '@angular/core';
import { Scores } from '../scores'
import { MinutesAndSeconds, TimeFormat } from '../time-format';

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.css']
})
export class TimeComponent implements OnInit {

  @Input() minutes: number;
  @Input() seconds: number;
  @Input() scores: Scores;

  timeFormat = new TimeFormat()
  
  constructor() { }

  ngOnInit() {}
  

  ngOnChanges() {
    var seconds = this.seconds || 0
    var minutes = this.minutes || 0

    this.scores.seconds = seconds
    this.scores.minutes = minutes

    var minutesAndSeconds = <MinutesAndSeconds> {}
    minutesAndSeconds.minutes = minutes
    minutesAndSeconds.seconds = seconds

    this.timeFormat.minutesAndSeconds = minutesAndSeconds
  }

}
