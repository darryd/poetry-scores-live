import { Component, OnInit, Input} from '@angular/core';
import { MyTurnService } from '../my-turn.service';
import { PoetsService } from '../poets.service';
import { Rank } from '../rank';

@Component({
  selector: 'app-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class RoundComponent implements OnInit {


  @Input() index
  @Input() rows
  @Input() first
  @Input() last

  @Input() round
  @Input() isAuthorized: boolean

  isEditMode = false
  incomingPoets: string[]
  incomingRank: Rank

  rank : Rank

  performances = []
  subscription: any;
  turnId: string;
  myTurnSub: any;
  myTurnId = `${Math.random()}`

  constructor(private poetsService: PoetsService,
              private myTurn: MyTurnService) { }

  trackByFn(_index, item) {
    return item._id
  }

  getTimeLimitFormated() {
    return `${this.getTimeLimitMinutes()}:${this.getFormatedSeconds()}`
  }

  getFormatedSeconds() {

    var secondsFormated = `${this.getTimeLimitSeconds()}`

    return secondsFormated.length === 1 ? `0${secondsFormated}` : secondsFormated 
  }

  getTimeLimitMinutes(){
    return Math.floor(this.round.object.timeLimit / 60)
  }
  getTimeLimitSeconds() {
    return this.round.object.timeLimit % 60
  }

  ngOnInit() {

    this.rank = new Rank(this.round.object.title)

    var that = this
    //if (that.round.object.isCumulative) debugger
    this.poetsService.registerRound(this.round.object, (rank: Rank) => {
      that.incomingRank = rank
      that.incomingPoets = rank.getQualifyingPoets(this.round.object.incomingRank)
    })

    this.rank.rankingUpdate$.subscribe(() => {
      this.poetsService.inbox(this.round._id, this.rank)
    })

    this.turnId = this.myTurn.turnId
    this.myTurnSub = this.myTurn.turn$.subscribe(
      turnId => {
        this.turnId = turnId
        if (this.turnId !== this.myTurnId) {
          this.isEditMode = false
        }
      }
    )
  }

  setEditMode(isEditMode) {
    this.isEditMode = isEditMode
    if (isEditMode) {
      this.myTurn.turnId = this.myTurnId
    }
  }
  ngOnChanges() {
    if (this.round && this.round.children && this.round.children['Performance']) {

      this.subscription = this.round.children['Performance'].changed$.subscribe(
        () => {
          this.rank.ringBell()
          this.performances = this.round.children['Performance'].followRows

          this.performances.sort((a: any, b: any) => {
            return a.object.order - b.object.order
          })
        })
    }

  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    this.poetsService.unregisterRound(this.round._id)
    if (this.myTurnSub) {
      this.myTurnSub.unsubscribe()
    }
  }

}
