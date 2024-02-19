import { Component, Input, OnInit } from '@angular/core';
import { Scores } from '../scores'

@Component({
  selector: 'app-penalty',
  templateUrl: './penalty.component.html',
  styleUrls: ['./penalty.component.css']
})
export class PenaltyComponent implements OnInit {

  @Input() penalty: number;
  @Input() scores: Scores;
  constructor() { }

  ngOnInit() {}  
  ngOnChanges() {
  	this.scores.penalty = this.penalty
  }

}
