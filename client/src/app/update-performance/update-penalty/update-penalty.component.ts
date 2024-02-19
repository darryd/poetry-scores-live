import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CommData } from '../../communication-lights/communication-lights.component';

@Component({
  selector: 'app-update-penalty',
  templateUrl: './update-penalty.component.html',
  styleUrls: ['./update-penalty.component.css']
})
export class UpdatePenaltyComponent implements OnInit {

  @Input() penalty: number
  @Input() performance_id
  @Input() object
  newPenalty: number

  sendData = new Subject<CommData>()
  sendData$ = this.sendData.asObservable()

  constructor() { }

  ngOnInit() {
    //this.newPenalty = this.penalty
  }

  updatePenalty() {
    var commData = <CommData> {}

    commData.url = '/api/performance/'
    commData.httpVerb = 'patch'
    commData.body = { _id: this.performance_id, field: 'penalty', value: this.newPenalty}

    this.sendData.next(commData)
  }

}
