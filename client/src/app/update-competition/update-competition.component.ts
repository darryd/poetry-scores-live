import { Component, Input, OnInit } from '@angular/core';
import { MyTurnService } from '../my-turn.service';

@Component({
  selector: 'app-update-competition',
  templateUrl: './update-competition.component.html',
  styleUrls: ['./update-competition.component.css']
})
export class UpdateCompetitionComponent implements OnInit {

  @Input() competition: any
  myTurnId = `competition-${Math.random()}`
  isVisible = false
  subs = []

  constructor(private myTurn: MyTurnService) { }


  edit() {
    this.myTurn.turnId = this.myTurnId
  }

  close() {
    this.myTurn.turnId = ''
  }


  ngOnInit() {

    this.subs.push(this.myTurn.turn$.subscribe(
      turnId => {
        this.isVisible = this.myTurnId === this.myTurn.turnId
      }))
  }

  ngOnDestroy() {
    this.subs.map(sub => sub.unsubscribe())
  }

}
