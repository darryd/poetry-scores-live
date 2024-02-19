import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MyTurnService {

  private turn = new Subject<string>()
  turn$ = this.turn.asObservable()
  private _turnId: string;
  
  constructor() { }

  get turnId () {
    return this._turnId
  }

  set turnId(turnId: string) {
    this._turnId = turnId
    this.turn.next(this._turnId)
  }
}
