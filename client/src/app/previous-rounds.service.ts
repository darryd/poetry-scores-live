import { Injectable } from '@angular/core';
import { SyncArray } from './sync-array';
import { SyncArrayService } from './sync-array.service';

/*

A previous round B of round A must be in the same competition
as round A. 

A previous round B may not have round A as its previous round. 
Also, if you follow the chain of previous rounds starting from 
round B, round A may not be present in the chain. In other words, 
no looping is allowed. 

*/


@Injectable({
  providedIn: 'root'
})
export class PreviousRoundsService {

  private _previousRounds = {}
  private subs = []
  syncRounds: SyncArray;
  constructor(private syncArrayService: SyncArrayService) { }

  get previousRounds() {
    return this._previousRounds
  }


  getRound(round_id: string) {

    if (!this.syncRounds) {
      return null
    }

    return this.syncRounds.keepUpToDate.rows.find(r => r._id === round_id)
  }

  enterCompetition(_id: string) {
    this.exitCompetition()
    this.syncRounds = this.syncArrayService.getSync(`api/round/competition/${_id}`)
    var roundsChanged = this.syncRounds.$changed.subscribe(
      () => {
        this.generatePreviousRounds()
      }
    )

    this.subs.push(this.syncRounds, roundsChanged)
  }

  private isBInPreviousRoundChainofA(roundA: any, roundB_id: string) {

    if (!roundA) {
      return false
    }

    if (roundA._id === roundB_id) {
      return true
    }

    var previousRound = this.syncRounds.keepUpToDate.rows.find(row => row._id === roundA.previousRound)
    return this.isBInPreviousRoundChainofA(previousRound, roundB_id)

  }

  private generatePreviousRounds() {
    this._previousRounds = {}

    this.syncRounds.keepUpToDate.rows.forEach(round => { 

      this._previousRounds[round._id] = [{_id: undefined, title: 'None'}]

      this.syncRounds.keepUpToDate.rows.forEach(possiblePreviousRow => {

        if (!this.isBInPreviousRoundChainofA(possiblePreviousRow, round._id)) {
          this._previousRounds[round._id].push(possiblePreviousRow)
        }
      })
    })
  }

  exitCompetition() {
    this.subs.forEach(sub => sub.unsubscribe())
    this.subs = []
  }
}
