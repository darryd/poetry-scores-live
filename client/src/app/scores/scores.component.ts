import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PoetScore, Rank, Ranking } from '../rank';
import { Score } from '../score';
import { Scores } from '../scores';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.css']
})
export class ScoresComponent implements OnInit, OnChanges {

  //scores: Scores = new Scores();
  @Input() performance
  @Input() scores: Scores
  @Input() score // data
  @Input() rank: Rank
  @Input() incomingRank: Rank
  @Input() round
  @Input() removeMinAndMaxScores

  ranking: number
  isTied = false
  arrayScores = []
  editModeSubscription: any;
  subscriptions: any[] = [];
  tiedWithStr: string;
  scoresChangedSub: any;
  timer: any;
  total: number;
  incomingTotal: number;

  constructor() { }

  trackByFn(_index, score) {
    return score.name;
  }

  getTies(rank: Ranking) {
    this.isTied = rank && rank.poetScores.length > 1
    this.tiedWithStr = ''

    if (this.isTied) {
      if (this.performance && this.performance.object) {
        var poet = this.performance.object.poet

        var tiedWith: string[] = []

        rank.poetScores.forEach(poetScore => {
          if (poetScore.poet !== poet) {
            tiedWith.push(poetScore.poet)
          }
        })
        this.tiedWithStr = tiedWith.join(', ')
      }
    }
  }

  getRank(rankings: Ranking[]) {
    var rank = rankings.find(ranking => ranking.total === this.total)
    if (rank) {
      this.ranking = rank.rank
    }
    this.getTies(rank)
  }

  updateScores() {
      this.scores.scores = []

      this.score.followRows.forEach((row, i) => {

        if (row.object !== undefined) {
          // row.object will be become undefined if the performace was deleted
          var score = new Score(i + 1, row.object.score)
          this.scores.scores.push(score)

          this.arrayScores = this.scores.scores
        }

      })
      this.scores.timeLimit = this.round.object.timeLimit
      this.scores.grace = this.round.object.grace
      this.scores.removeMinAndMaxScores = this.removeMinAndMaxScores
      this.rank.ringBell()
  }

  followScores() {
    if (this.scoresChangedSub) {
      this.scoresChangedSub.unsubscribe()
    }
    if (this.timer) {
      clearInterval(this.timer)
    }

    this.scoresChangedSub = this.score.changed$.subscribe(() => {
      this.updateScores()
    })

    this.subscriptions.push(this.scoresChangedSub)



    // Mitigating a bug where occationally the scores don't appear.
    this.timer = setInterval(() => this.updateScores(), 1000)


  }

  ngOnInit() {

    if (this.incomingRank) {
      this.subscriptions.push(this.incomingRank.bell$.subscribe(() => {
        this.rank.ringBell()
      }))
    }

    this.subscriptions.push(this.rank.bell$.subscribe(() => {

      //if (!(this.performance?.object?.poet)) {
      if (!this.performance || !this.performance.object || !this.performance.object.poet) {
        return;
      }
    
      this.incomingTotal = this.getIncomingTotal(this.performance.object.poet)
      this.total = this.scores.sum + this.incomingTotal

      var poetScore = <PoetScore>{};
      poetScore._id = this.performance._id;
      poetScore.poet = this.performance.object.poet;
      poetScore.total = this.total;

      this.rank.inbox(poetScore)
    }))

    this.subscriptions.push(this.rank.rankingUpdate$.subscribe(ranking => {
      this.getRank(ranking)
    }))

    this.subscriptions.push(this.scores.sumChanged$.subscribe(
      sum => {
        this.rank.ringBell()
      })
    )
  }
  getIncomingTotal(poet: string) {

    if (this.incomingRank) {
      return this.incomingRank.getScore(poet)
    }

    return 0
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe()
    })
    this.rank.ringBell()

    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.score) {
      this.followScores()
    }

    this.scores.removeMinAndMaxScores = this.removeMinAndMaxScores
  }
}
