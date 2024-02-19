import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CommData } from '../communication-lights/communication-lights.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  @Input() competition_id
  poet: string

  sendData = new Subject<CommData>()
  sendData$ = this.sendData.asObservable()

  stateEvent = new Subject<string>()
  stateEvent$ = this.stateEvent.asObservable()

  subs = [] // subscriptions

  constructor() { }

  signup() {
    var commData = <CommData> {}
    commData.url = '/api/signup'
    commData.body = {competition_id: this.competition_id, poet: this.poet}
    commData.httpVerb = 'post'

    this.sendData.next(commData)
  }

  ngOnInit() {
    this.subs.push(this.stateEvent$.subscribe(
      state => { 
        if (state === 'sent') {
          this.poet = ''
        }
      }
    ))
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe())
  }

}
