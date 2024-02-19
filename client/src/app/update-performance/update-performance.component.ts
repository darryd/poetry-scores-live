import { Component, Input, OnInit } from '@angular/core';
import { MyTurnService } from '../my-turn.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-update-performance',
  templateUrl: './update-performance.component.html',
  styleUrls: ['./update-performance.component.css']
})
export class UpdatePerformanceComponent implements OnInit {

  @Input() performance: any
  canAdvance = new Subject<number>()
  canAdvance$ = this.canAdvance.asObservable()

  @Input() index
  @Input() rows
  @Input() first
  @Input() last

  constructor(private myTurn: MyTurnService) { }

  ngOnInit() {
  }

  ngOnChanges() {
  }

  close() {
    this.myTurn.turnId = ''
  }
}
