import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CommData } from 'src/app/communication-lights/communication-lights.component';

@Component({
  selector: 'app-update-incoming-rank',
  templateUrl: './update-incoming-rank.component.html',
  styleUrls: ['./update-incoming-rank.component.css']
})
export class UpdateIncomingRankComponent implements OnInit {

  type: string;
  width: string;
  isAllPoets: boolean
  newIncomingRank: string

  sendData = new Subject<CommData>()
  sendData$ = this.sendData.asObservable()
  @Input() round: any
  
  constructor() { }

  ngOnInit() {

    // This is backwards but the checkbox is checked when isAllPoets if false!
    this.isAllPoets = true 
    
    if (this.round.object.incomingRank) {
      this.isAllPoets = false
    }

  }
  ngOnChanges() {

      this.type = 'number'
      this.width = '50px'
  }

  async updateIsAllPoets() {


    this.isAllPoets = !this.isAllPoets

    if (this.isAllPoets) {
      this.newIncomingRank = ''

      if (this.round.object.incomingRank) {
        this.update()
      }

    }
    else {

      // Allow the input box to be added to the DOM.
      await new Promise<void>((resolve) => {
        setTimeout(()=> {
          resolve()
        }, 0)
      })

      var doc = <any> document.querySelector('#IncomingRank')
      doc.focus()
    }

  }

  update() {


    var incomingRank = parseFloat(this.newIncomingRank) || 0
    this.isAllPoets = incomingRank == 0 

    var communicationData: CommData = {
      url: `api/round/`,
      httpVerb: 'patch', 
      body: { _id: this.round._id , field: 'incomingRank', value: incomingRank }
    }

    this.sendData.next(communicationData)
  }

}
