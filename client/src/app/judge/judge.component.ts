import { Component, OnInit, Input } from '@angular/core';
import { Score } from '../score';

@Component({
  selector: 'app-judge',
  templateUrl: './judge.component.html',
  styleUrls: ['./judge.component.css']
})
export class JudgeComponent implements OnInit {

  @Input() score: Score;
  scoreFormated: string;

  constructor() { }

  formatScore() {
    if (this.score.score === undefined) {
      return ''
    }
    if (this.score.score === 10) {
      return '10'
    } else {
      return `${this.score.score}`
    }
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.scoreFormated = this.formatScore()
  }

}
