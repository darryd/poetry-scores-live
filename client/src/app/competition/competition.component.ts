import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommData } from '../communication-lights/communication-lights.component';
import { NumberOfViewersService } from '../number-of-viewers.service';
import { PermissionsService } from '../permissions.service';
import { PoetsService } from '../poets.service';
import { SyncArrayService } from '../sync-array.service';
import { SyncFollow } from '../sync-follow';

@Component({
  selector: 'app-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.css']
})
export class CompetitionComponent implements OnInit {

  paramsSub: any;
  _id: string;

  followCompetition : SyncFollow
  authSub: any;
  changedSub: any;
  club: any;
  competition: any;
  rounds: any;
  roles: string[];
  defaultRound: string;

  constructor(private syncArrayService: SyncArrayService, 
              private activatedRoute: ActivatedRoute,
              public permissionsService: PermissionsService,
              private numberOfViewersService: NumberOfViewersService,
              public poetsService: PoetsService,
              public http: HttpClient
             ) {}

  trackByFn(_index, performance) {
    return performance._id + performance.object.order;
  }
  getCreateCommDataFunctionScorekeeper(that=this) {

    return function (email: string) {
      var commData = <CommData>{}

      commData.url = '/api/scorekeeper'
      commData.httpVerb = 'post'
      commData.body = { competition_id: that._id, email }

      return commData
    }
  }
  getCreateCommDataFunction/*Poet*/(that=this) {

    return function (poet: string) {
      var commData = <CommData>{}

      commData.url = '/api/signup'
      commData.httpVerb = 'post'
      commData.body = { competition_id: that._id, poet }

      return commData
    }
  }

  getDeleteCommDataForScorekeepers(row) {

    var commData = <CommData> {}
    commData.httpVerb = 'delete'
    commData.url = `/api/scorekeeper/${row._id}`

    return commData
  }
  getDeleteCommDataForPoets(row) {

    var commData = <CommData> {}
    commData.httpVerb = 'delete'
    commData.url = `/api/signup/${row._id}`

    return commData
  }



  newOwner() {

    try {
      var body = {newOwnerEmail: 'darry.danzig@gmail.com', club_id: this.club._id}
      var result = this.http.patch('api/club/owner', body).toPromise()

    } catch (error) {
      console.log(error)
    }

  }

  async lock() {
    var body  = {_id: this._id}
    var result = await this.http.patch('api/competition/lock', body).toPromise()
    console.log(result)
  }

  async unlock() {
    var body  = {_id: this._id}
    var result = await this.http.patch('api/competition/unlock', body).toPromise()
    console.log(result)
  }

  cleanup() {
    if (this.changedSub) {
      this.changedSub.unsubscribe()
    }
  }

  isLocked() {
    return this.competition.object.isLocked
  }

  isOwner() {
    return this.club && this.permissionsService.isMyRole('owner', this.club._id)
  }

  isAdmin() {
    return this.club && this.permissionsService.isMyRole('admin', this.club._id)
  }

  isScorekeeper() {
    return this.permissionsService.isMyRole('scorekeeper', this._id)
  }


  generateRoles() {
      this.roles = [];
      var roleNames = ['Owner', 'Admin', 'Scorekeeper'];

      this.roles = roleNames.map(roleName => {
        if (this[`is${roleName}`]()) {
          return roleName.toLowerCase();
        }
      });
      this.roles = this.roles.filter(role => role);
    }


  // Side effect: generate roles array.
  isAuthorized(): boolean {

    this.generateRoles();

    if (this.isLocked())
      return false

    return this.isOwner() || this.isAdmin() || this.isScorekeeper()
  }


  getDefaultRound() {

    var that = this

    return () => {
      var commData = <CommData> {}
      commData.url = '/api/round'
      commData.httpVerb = 'post'
      commData.body = that.getDefaultSettingForNewRound()
      
      return commData
    }
  }


  getDefaultSettingForNewRound() {

    var competition_id = this._id
    var title = 'Untitled Round'
    var numJudges = 5
    var removeMinAndMaxScores = true
    var timeLimit = 180
    var grace = 10

    if (this.competition.children.Round.followRows.length > 0) {

      var length = this.competition.children.Round.followRows.length
      var lastRound = this.competition.children.Round.followRows[length - 1]

      numJudges = lastRound.object.numJudges
      removeMinAndMaxScores = lastRound.object.removeMinAndMaxScores
      timeLimit = lastRound.object.timeLimit
      grace = lastRound.object.grace
    }

    return {competition_id, title, numJudges, removeMinAndMaxScores, timeLimit, grace}
  }

  followChanges() {


    function followRounds(competition) {

      // TODO clean up subscription.
      competition.children.Round.changed$.subscribe(
        () => {
          var rounds = competition.children.Round.followRows
          
          rounds.sort((a: any, b: any) => {
            return a.object.order - b.object.order
          })
        }
      )
    }


    this.changedSub = this.followCompetition.changed$.subscribe(
      () => {
        this.competition = this.followCompetition.followRow
        this.club = this.competition.object.club


        followRounds(this.competition)
      }
    )
  }

  ngOnInit() {
    this.paramsSub = this.activatedRoute.params.subscribe(async params => {
      this._id = params['_id']
      this.followCompetition = this.syncArrayService.getSyncFollow(this._id, 'Competition', `api/competition/${this._id}`)

      this.numberOfViewersService.competition_id = this._id
      this.poetsService.enterCompetition(this._id)

      this.cleanup()
      this.followChanges()
    })
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
    this.followCompetition.unfollow()
    this.cleanup()
    this.poetsService.exitCompetition()

    this.numberOfViewersService.competition_id = null
  }
}
