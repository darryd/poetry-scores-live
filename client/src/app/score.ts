export class Score {
    public name: number;
    public score: number;
    public isHigh: boolean;
    public isLow: boolean;

    constructor(name: number, score: number) {
        this.name = name;
        this.score = score;
    }
}