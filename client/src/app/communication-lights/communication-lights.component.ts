import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FuncQueue } from '../func-queue';

export interface CommData {
  httpVerb: string,
  url: string,
  body: any
}

@Component({
  selector: 'app-communication-lights',
  templateUrl: './communication-lights.component.html',
  styleUrls: ['./communication-lights.component.css']
})
export class CommunicationLightsComponent implements OnInit {

  status: string
  statusId: string;
  @Input() sendData$: Observable<CommData>
  sendDataSub: any;
  funcQueue = new FuncQueue()
  @Input() stateEvent: Subject<string>

  @Input() sentFunc : (data?: any) => void
  @Input() errorFunc: (error) => void

  constructor(private http: HttpClient) { }

  getHttpObservable(data: CommData) {
    switch (data.httpVerb) {
      case 'get':
        return this.http.get(data.url)
      case 'post':
        return this.http.post(data.url, data.body)
      case 'put':
        return this.http.put(data.url, data.body)
      case 'patch':
        return this.http.patch(data.url, data.body)
      case 'delete':
        return this.http.delete(data.url)
    }
    return undefined
  }

  sendDataFunc(data: CommData) {
    return () => {
      return new Promise((resolve) => {
        var observable = this.getHttpObservable(data)
        this.chooseLight('sending')
        observable .subscribe( 
          data => {
            this.chooseLight("sent")
            resolve(null)
            if (this.sentFunc) {
              this.sentFunc(data)
            }
          },
          error => {
            console.error(error)
            this.chooseLight("error")
            resolve(null)
            if (this.errorFunc) {
              this.errorFunc(error)
            }
          }
        )
      })
    }
  }

  sendData(data: CommData) {
    this.funcQueue.addFunction(this.sendDataFunc(data))
  }

  ngOnInit() {
    this.chooseLight("blank")
    if (this.sendData$) {
      this.sendDataSub = this.sendData$.subscribe(
        (data) => {
          this.sendData(data)
        }
      )
    }
  }

  ngOnDestroy() {
    if (this.sendDataSub) {
      this.sendDataSub.unsubscribe()
    }
  }

  setStatus(status: string, timeout?) {
    this.status = status
    var statusId = `${Math.random()}`
    this.statusId = statusId
    if (timeout) {
      setTimeout(()=> {
        if (this.statusId === statusId) {
          this.status = '⚫'
        }
      }, timeout)
    }
  }

  blinkStatus(status: string, interval=250) {
    
    this.status = status
    var statusId = `${Math.random()}`
    this.statusId = statusId

    var intervalId = setInterval(
      () => {
        if (statusId !== this.statusId) {
          clearInterval(intervalId)
        }
        else {
          if (this.status === status) {
            this.status = '⚫'
          } else {
            this.status = status
          }
        }
      }, interval)
  }

  chooseLight(state) {
    switch (state) {
      case 'blank':
        this.setStatus('⚫')
        break;
      case 'sending':
        this.blinkStatus("🟡")
        break;
      case 'sent':
        this.setStatus("🟢", 2000)
        break;
      case 'error':
        this.setStatus("🔴")
    }
    if (this.stateEvent) {
      this.stateEvent.next(state)
    }
  }
}
