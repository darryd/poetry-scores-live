import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { CommData } from '../communication-lights/communication-lights.component';
import { MyTurnService } from '../my-turn.service';
import { Rank } from '../rank';
import { Scores } from '../scores';
 
@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css']
})
export class PerformanceComponent implements OnInit {

  @Input() isAuthorized: boolean
  @Input() performance
  @Input() rows
  @Input() i
  @Input() first
  @Input() last
  @Input() removeMinAndMaxScores: boolean
  @Input() rank: Rank
  @Input() incomingRank: Rank
  scores = new Scores()
  @Input() round 

  isInitiallyInEditMode = false
  isEditMode = this.isInitiallyInEditMode
  deleteCommData = <CommData> {}
  turnId: string;
  myTurnId = `${Math.random()}`
  myTurnSub: any;
  isDarry: boolean;
  authSub: any;

  constructor(private http: HttpClient, 
              private myTurn: MyTurnService,
              private oktaAuth: OktaAuthService) { }

  setEditMode(isEditMode) {
    this.isEditMode = isEditMode
    if (isEditMode) {
      this.myTurn.turnId = this.myTurnId
    }
  }

  async checkIfDarry() {
    this.isDarry = false
    return
    /*
    if (await this.oktaAuth.isAuthenticated()) {
      var user = await this.oktaAuth.getUser()

      if (user.email === 'darry.d@gmail.com' || user.email === 'cips@vancouverpoetryhouse.com')
      {
        this.isDarry = true
      }
    }
    */
  }
  async authentication() {

    this.checkIfDarry()

    this.authSub = this.oktaAuth.$authenticationState.subscribe(
      async (isAuthenticated) => {
        this.checkIfDarry()
      })
  }
  ngOnInit() {
    this.authentication()
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

  ngOnDestroy() {
    if (this.myTurnSub) {
      this.myTurnSub.unsubscribe()
    }
    this.authSub.unsubscribe()
  }

  ngOnChanges() {
    this.deleteCommData.url = `/api/performance/${this.performance._id}`
    this.deleteCommData.httpVerb = 'delete'
  }

  deletePerformance() {
    const url = `/api/performance/${this.performance.object._id}`
    this.http.delete(url).subscribe(
      data => {}, error => console.error(error)
    )
  }
}
