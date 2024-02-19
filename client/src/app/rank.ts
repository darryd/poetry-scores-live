import { Subject } from "rxjs"

export interface PoetScore {
    poet: string,
    _id: string,
    total: number
}

export interface Ranking {
    poetScores: PoetScore[],
    rank: number,
    total: number
}

export class Rank {

    private ranks: Ranking[] = []

    private bell = new Subject<void>()
    bell$ = this.bell.asObservable()

    private rankingUpdate = new Subject<Ranking[]>()
    rankingUpdate$ = this.rankingUpdate.asObservable()    
    
    private scores: PoetScore[]

    constructor(public title: string) {}


    ringBell() {
        this.scores = []
        this.bell.next()
    }

    inbox(poetScore: PoetScore) {
        this.scores = this.scores || []
        this.scores.push(poetScore)
        this.rankScores()
    }

    getQualifyingPoets(incomingRank: number) {
        var qualifyingPoets = []

        var rankNumber = incomingRank ? incomingRank : Infinity

        this.ranks.forEach(rank => {
            if (rank.rank <= rankNumber) {
                var poets = rank.poetScores.map(poetScore => poetScore.poet)
                qualifyingPoets = qualifyingPoets.concat(poets)
            }
        })

        return qualifyingPoets
    }

    getScore(poet) {
        if (this.scores) {

            var score = this.scores.find(s => s.poet === poet)
            if (score) {
                return score.total
            }

            return 0
        }

        return 0
    }

    private rankScores() {
        this.ranks = []
        this.scores.forEach(score => {
            var rank = this.ranks.find(rank => {
                return rank.total === score.total
            })
            if (rank !== undefined) {
                rank.poetScores.push(score)
            } else {
                var rank = <Ranking>{}
                rank.total = score.total
                rank.poetScores = [score]
                this.ranks.push(rank)
            }
        })
        this.ranks.sort((a, b) => {
            return b.total - a.total
        })

        var i = 0
        this.ranks.forEach((rank: Ranking) => {
            rank.rank = i + 1
            i += rank.poetScores.length
        })
        this.rankingUpdate.next(this.ranks)
    }
} 
