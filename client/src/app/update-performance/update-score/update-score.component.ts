import { Component, Input, OnInit} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CommData } from '../../communication-lights/communication-lights.component';

@Component({
  selector: 'app-update-score',
  templateUrl: './update-score.component.html',
  styleUrls: ['./update-score.component.css']
})
export class UpdateScoreComponent implements OnInit {

  sendData = new Subject<CommData>()
  sendData$ = this.sendData.asObservable()

  url = "/api/score/"
  @Input() score_id
  @Input() score
  @Input() index
  @Input() canAdvance
  @Input() canAdvance$: Observable<number>
  newScore: number
  lastSentScore: number
  inputId = `score-${Math.random()}`
  advanceSubcription: any;
  communicationState = "blank"

  constructor() { }

  updateScore2() {


    var input: any = document.getElementById(this.inputId)
    var newValue = input.value
    this.newScore = newValue !== '' ? parseFloat(newValue) : undefined

    if (this.newScore !== this.lastSentScore) {
      const commData = <CommData>{}
      commData.url = this.url
      commData.httpVerb = 'put'
      commData.body = { score_id: this.score_id, score: this.newScore }
      this.sendData.next(commData)

      this.lastSentScore = this.newScore
    }

    /*
    if (newValue === '10' || newValue.length === 3) {
      this.canAdvance.next(this.index)
    }
    */
  }

  updateScore() {
      var input:any = document.getElementById(this.inputId)

      var newValue = ''
      for (var i=0; i < input.value.length; i++) {

        if (newValue.length === 3) {
          break
        }

        var char = input.value.charAt(i)
        if (i === 0) {
          if (char === '.') {
            newValue = '0.'
          } else {
            newValue += char
          }
        }

        else if (i === 1) {
          var test = newValue + char
          if (test === '10') {
            newValue = test
            break
          }
          else {
            if (char !== '.') {
              newValue += '.'
            }
            newValue += char
          }
        }
        else {
          newValue += char
        }
      }
      input.value = newValue
      this.newScore = newValue !== '' ? parseFloat(newValue) : undefined

      if (this.newScore !== this.lastSentScore) {
        const commData = <CommData> {}
        commData.url = this.url
        commData.httpVerb = 'put'
        commData.body = {score_id: this.score_id, score: this.newScore }
        this.sendData.next(commData)

        this.lastSentScore = this.newScore
      }

      if (newValue === '10' || newValue.length === 3) {
        this.canAdvance.next(this.index)
      }
  }

  ngAfterViewInit() {
    if (this.index === 0) {
      var input:any = document.getElementById(this.inputId)
      input.focus()
    }
  }

  ngOnInit() {
    if (this.score !== undefined) {
      //this.newScore = this.score
    }
    this.advanceSubcription = this.canAdvance$.subscribe(
      index => {
        if (this.index === index + 1) {
          var input:any = document.getElementById(this.inputId)
          input.focus()
        }
      }
    )
  }
  ngOnDestroy() {
    this.advanceSubcription.unsubscribe()
  }
}
