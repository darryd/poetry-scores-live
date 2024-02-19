import { Subject } from 'rxjs';
import { Score } from './score';

export class Scores {

    private sumChanged = new Subject<number>()
    sumChanged$ = this.sumChanged.asObservable()

    sum: number;
    scores: Score[];
    private _removeMaxAndMin = false
    private _penalty = 0
    private _minutes = 0
    private _seconds = 0
    private _timeLimit = 0
    private _grace = 0
    timePenalty = 0
    
    multiplyer = 100 

    set removeMinAndMaxScores(removeMaxAndMin: boolean) {
        this._removeMaxAndMin = removeMaxAndMin || false
        if (!this._removeMaxAndMin) {
            this.clearHighLow()
        }
        this.calculate()
    }

    set minutes(minutes: number) {
	    this._minutes = minutes || 0
        this._minutes *= this.multiplyer
	    this.calculate()
    }

    set seconds(seconds: number) {
        this._seconds = seconds || 0
        this._seconds *= this.multiplyer
        this.calculate()
    }

    set penalty(penalty: number) {
	    this._penalty = penalty || 0
        this._penalty *= this.multiplyer
	    this.calculate()
    }

    set timeLimit(timeLimit: number) {
	    this._timeLimit = timeLimit || 0
        this._timeLimit *= this.multiplyer
	    this.calculate()
    }

    set grace(grace: number) {
	    this._grace = grace || 0
        this._grace *= this.multiplyer
	    this.calculate()
    }

    calculateTimePenalty() {

	    var overTime

	    var totalSeconds = this._minutes * 60 + this._seconds

	    if (totalSeconds <= this._timeLimit + this._grace) {
		    this.timePenalty = 0
		    return 0
	    }

	    var timeLimit = this._timeLimit + this._grace

	    overTime = totalSeconds - timeLimit
	    overTime = Math.ceil(overTime / (10 * this.multiplyer)) * 5 * this.multiplyer / 10 // TODO HELP!

	    this.timePenalty = overTime
	    return this.timePenalty
    }

    calculate() {
        var oldSum = this.sum

        this.removeMaxAndMInIfRequired();
        this.sum = 0;

        if (this.scores) {

            this.scores.map(score => {

                if (!(score.score === undefined || score.isHigh || score.isLow)) {
                    this.sum += score.score * this.multiplyer;
                }
            })
            this.sum -= this.calculateTimePenalty()
            this.sum -= this._penalty

            this.sum = Math.round(this.sum) // Avoid getting someting like 26.59999999999999994 

            if (oldSum !== this.sum) {
                this.sumChanged.next(this.sum)
            }
        }

    }

    removeMaxAndMInIfRequired() {
        if (!this._removeMaxAndMin) {
            return;
        }

        this.clearHighLow();
        this.findMin();
        this.findMax();
    }
    clearHighLow() {
        if (this.scores) {
            this.scores.map(score => {
                score.isLow = false;
                score.isHigh = false;
            })
        }
    }

    findMax() {


        if (!this.scores) {
            return
        }

        let foundMax: Number = -Infinity;
        let maxScore: Score;

        for (let i = 0; i < this.scores.length; i++) {
        
            const score: Score = this.scores[i];

            score.isHigh = false;

            if (foundMax < score.score && !score.isLow) {

                if (maxScore !== undefined) {
                    maxScore.isHigh = false;
                }

                maxScore = score;
                foundMax = score.score;
                score.isHigh = true;
            }
        }
    }

    findMin() {

        if (!this.scores) {
            return
        }

        let foundMin: Number = Infinity;
        let minScore: Score;

        for (let i = 0; i < this.scores.length; i++) {

            const score: Score = this.scores[i];

            score.isLow = false;

            if (foundMin > score.score && !score.isHigh) {

                if (minScore !== undefined) {
                    minScore.isLow = false;
                }

                minScore = score;
                foundMin = score.score;
                score.isLow = true;
            }
        }
    }
}
