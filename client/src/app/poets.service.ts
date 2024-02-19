import { Injectable } from '@angular/core';
import { SyncArrayService } from './sync-array.service';
import { SyncArray } from './sync-array'
import { PoetScore, Rank } from './rank';

export type RankFunc = (rank: Rank) => void

interface RoundRankFunc {
  round_id: string,
  rankFunc: RankFunc
}

@Injectable({
  providedIn: 'root'
})
export class PoetsService {
  private syncPoets: SyncArray;
  private subs = []
  private changedEvent: any;
  private roundRankFuncs: RoundRankFunc[];
  private cacheRoundRank: {[key: string]: Rank}
  private signupRank: Rank;
  private syncRounds: SyncArray;
  private roundsChanged: any;

  constructor(private syncArrayService: SyncArrayService) { }

  private sendRankFromCache(round: any) {

    var roundRankFunc: RoundRankFunc = this.roundRankFuncs.find(r => r.round_id === round._id)

    if (roundRankFunc) {
      var rankFunc = roundRankFunc.rankFunc
      if (!round.previousRound) {
        rankFunc(this.signupRank)
      } else if (this.cacheRoundRank[round.previousRound]) {
        rankFunc(this.cacheRoundRank[round.previousRound])
      }
    }
  }

  registerRound(round: any, rankFunc: RankFunc) {
    this.roundRankFuncs.push({round_id: round._id, rankFunc})
    this.sendRankFromCache(round)
  }

  unregisterRound(round_id) {
    this.roundRankFuncs = this.roundRankFuncs.filter(roundRank => roundRank.round_id != round_id)
    delete this.cacheRoundRank[round_id]
  }

  private sendRankToRound(round_id: string, rank: Rank) {
      var roundRank = this.roundRankFuncs.find(r => r.round_id === round_id)
      if ( roundRank ) {
        roundRank.rankFunc(rank)
      }
  }

  inbox(round_id: string, rank: Rank) {

    this.cacheRoundRank[round_id] = rank

    // Find all rounds that are getting their poets from round_id.
    var round_ids = this.getSubsequentRounds(round_id)
    round_ids.forEach(_id => {
      this.sendRankToRound(_id, rank)
    })
  }

  private getRoundsWithNoPreviousRounds() {
    var round_ids = []

    if (this.syncRounds.keepUpToDate && this.syncRounds.keepUpToDate.rows) {

      var rounds = this.syncRounds.keepUpToDate.rows.filter(round => !round.previousRound)

      rounds.forEach(round => round_ids.push(round._id))
    }
    return round_ids
  }
  
  private sendSignupRank() {
    var round_ids = this.getRoundsWithNoPreviousRounds()
    round_ids.forEach(round_id => this.sendRankToRound(round_id, this.signupRank))
  }

  private getSubsequentRounds(round_id: string) {
    var round_ids = []

    if (this.syncRounds.keepUpToDate && this.syncRounds.keepUpToDate.rows ) {

      this.syncRounds.keepUpToDate.rows.forEach(round => { 

        if (round.previousRound === round_id) {
          round_ids.push(round._id)
        }
      })
    }
    return round_ids
  }

  exitCompetition() {
    this.roundRankFuncs = []
    this.cacheRoundRank = {}
    this.subs.forEach(sub => sub.unsubscribe())
    this.subs = []
  }

  enterCompetition(_id: string) {

    this.exitCompetition()
    this.syncPoets = this.syncArrayService.getSync(`api/signup/competition/${_id}`)
    this.syncRounds = this.syncArrayService.getSync(`api/round/competition/${_id}`)
    this.signupRank = new Rank('signed poets')

    this.changedEvent = this.syncPoets.$changed.subscribe(
      () => {
        this.updateSignupRank()
      }
    )

    this.roundsChanged = this.syncRounds.$changed.subscribe(
      () => {
        // Perhaps a previousRound changed for one of the rounds. We don't know what changed since 
        // SyncArray doesn't tell us what got updated. Perhaps that could be something worth adding
        // to SyncArray. On the other hand, a competition will likely only have fewer than 4 rounds,
        // so this won't be a big deal in terms of using too much unnecessary cpu by iterating through 
        // every round on the off-chance that its previousRound changed.

        this.syncRounds.keepUpToDate.rows.forEach(round => this.sendRankFromCache(round))
      }
    )

    this.subs.push(this.syncPoets, this.syncRounds, this.roundsChanged, this.changedEvent)
  }
  private updateSignupRank() {
    this.signupRank = new Rank('signed poets')
    this.syncPoets.keepUpToDate.rows.forEach(poet => {
      var poetScore = <PoetScore>{}

      poetScore._id = poet._id
      poetScore.poet = poet.poet
      poetScore.total = 0

      this.signupRank.inbox(poetScore)
    })
    this.sendSignupRank()
  }

}
