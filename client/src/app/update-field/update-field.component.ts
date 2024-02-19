import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { CommData } from '../communication-lights/communication-lights.component';

@Component({
  selector: 'app-update-field',
  templateUrl: './update-field.component.html',
  styleUrls: ['./update-field.component.css']
})
export class UpdateFieldComponent {

  @Input() url: string
  @Input() _id: string
  @Input() httpVerb: string
  @Input() field: string
  @Input() isString: boolean
  // Or alternatively
  @Input() fnGetCommData: (value: string | number) => CommData
  @Input() isUncertain: boolean 

  newValue: string

  sendData = new Subject<CommData>()
  sendData$ = this.sendData.asObservable()
  type: string;
  width: string;

  constructor() { }

  dataSentFunc(that=this) {
    return () => {
      that.newValue = ''
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.isString) {
      this.type = !this.isString ? 'number' : ''
      this.width = !this.isString ? '50px' : '200px'
    }
  }


  getOnClickCallback() {
    //var that=this

    return () => {

      var value: string | number
      if (this.isString) {
        value = this.newValue.trim()
      }
      else {
        value = parseFloat(this.newValue)
      }

      var defaultCommData: CommData = {
        url: this.url,
        httpVerb: this.httpVerb,
        body: { _id: this._id, field: this.field, value }
      }

      var communicationData = this.fnGetCommData ? this.fnGetCommData(value) : defaultCommData

      this.sendData.next(communicationData)
    }
  }

  update() {
  }
}
