export interface MinutesAndSeconds {
    minutes: number,
    seconds: number
}


export class TimeFormat {

    private _seconds: number

    constructor() {
        this._seconds = 0
    }

    get minutesAndSeconds() {

        var minutesAndSeconds = <MinutesAndSeconds> {}

        minutesAndSeconds.minutes = Math.floor(this._seconds / 60)
        minutesAndSeconds.seconds = this._seconds % 60

        return minutesAndSeconds
    }

    get timeString() {

        var seconds = this.minutesAndSeconds.seconds
        var minutes = this.minutesAndSeconds.minutes
        
        return `${minutes}:${seconds < 10 ? 0 : ''}${seconds}`
    }

    set minutesAndSeconds(minutesAndSeconds: MinutesAndSeconds) {
        this._seconds = minutesAndSeconds.seconds 
                        + minutesAndSeconds.minutes * 60
    }

    set seconds(seconds: number) {
        this._seconds = seconds
    }

    get seconds() {
        return this._seconds
    }
}
