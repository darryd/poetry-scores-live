import { Component, Input, OnInit } from '@angular/core';
import { CommData } from '../communication-lights/communication-lights.component';

@Component({
  selector: 'app-add-performance',
  templateUrl: './add-performance.component.html',
  styleUrls: ['./add-performance.component.css']
})
export class AddPerformanceComponent implements OnInit {

  @Input() round
  @Input() poets
  constructor() { }

  ngOnInit() {
  }

  getCommData(poet: string) {

    var commData = <CommData> {}

    commData.url = '/api/performance'
    commData.body = {round_id: this.round._id, poet}
    commData.httpVerb = "post"


    return commData
  }
  hasPoetEnteredRound(poet) {
    var result = this.round.children['Performance'].followRows.find((row) => {
      if (!(row.object || row.object.poet)) 
        return false

      return row.object.poet === poet
    })

    return result !== undefined 
  }
}
