import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CommData } from '../communication-lights/communication-lights.component';
import { MyTurnService } from '../my-turn.service';
import { PreviousRoundsService } from '../previous-rounds.service';
import { TimeFormat } from '../time-format';

@Component({
  selector: 'app-update-round',
  templateUrl: './update-round.component.html',
  styleUrls: ['./update-round.component.css']
})
export class UpdateRoundComponent implements OnInit {

  isCumulative: boolean;
  removeMinAndMaxScores: boolean

  @Input() round
  
  @Input() index
  @Input() rows
  @Input() first
  @Input() last

  sendDataMinMax = new Subject<CommData>()
  $sendDataMinMax = this.sendDataMinMax.asObservable()

  sendDataCumulative = new Subject<CommData>()
  $sendDataCumulative = this.sendDataCumulative.asObservable()

  previousRound_id
  sendDataPreviousRound = new Subject<CommData>()
  $sendDataPreviousRound = this.sendDataPreviousRound.asObservable()

  constructor(private myTurn: MyTurnService, public prs: PreviousRoundsService) { }


  ngOnInit() {
 
    this.isCumulative = this.round.object.isCumulative
    this.removeMinAndMaxScores = this.round.object.removeMinAndMaxScores
    this.previousRound_id = this.round.object.previousRound

    this.prs.enterCompetition(this.round.object.competition)
  }

  getTimeString(seconds) {

    var timeFormat = new TimeFormat()
    timeFormat.seconds = seconds

    return timeFormat.timeString
  }
  
  ngOnChanges() {
  }
  ngOnDestroy() {
    this.prs.exitCompetition()
  }

  close() {
    this.myTurn.turnId = ''
  }

  updateRemoveMinAndMaxScores() {
    var commData = <CommData> {}
    this.removeMinAndMaxScores = !this.removeMinAndMaxScores

    commData.url = '/api/round'
    commData.httpVerb = 'patch'
    commData.body = {  _id: this.round._id, 
                            value: this.removeMinAndMaxScores,
                            field: 'removeMinAndMaxScores'}

    this.sendDataMinMax.next(commData)
  }

  updateIsCumulative() {
    var commData = <CommData> {}
    this.isCumulative = !this.isCumulative

    commData.url = '/api/round'
    commData.httpVerb = 'patch'
    commData.body = {  _id: this.round._id, 
                            value: this.isCumulative,
                            field: 'isCumulative'}

    this.sendDataCumulative.next(commData)
  }

  updatePreviousRound() {
    var commData = <CommData> {}

    commData.url = '/api/round'
    commData.httpVerb = 'patch'
    commData.body = {  _id: this.round._id, 
                            value: this.previousRound_id,
                            field: 'previousRound'}

    this.sendDataPreviousRound.next(commData)
  }

}