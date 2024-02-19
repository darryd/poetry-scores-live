import { Component, Input, OnInit } from '@angular/core';
import { CommData } from '../communication-lights/communication-lights.component';

@Component({
  selector: 'app-up-down',
  templateUrl: './up-down.component.html',
  styleUrls: ['./up-down.component.css']
})
export class UpDownComponent implements OnInit {

  constructor() { }
  @Input() rows
  @Input() row
  @Input() url: string

  @Input() index
  @Input() first
  @Input() last

  upFunc = this.moveUpOrDown('up')
  downFunc = this.moveUpOrDown('down')

  moveUpOrDown(direction: 'up' | 'down', that = this) {

    return () => {

      var id_1 = that.row.object._id
      var length = that.rows.length
      var otherIndex = direction === 'up' ? that.index - 1 : that.index + 1
      if (otherIndex >= 0 && otherIndex <= length - 1) {

        var id_2 = that.rows[otherIndex].object._id

        var commData = <CommData>{}
        commData.url = that.url
        commData.httpVerb = 'patch'
        commData.body = { id_1, id_2 }

        return commData
      }
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  ngOnChanges() {
  }

  findIndex() {
    for (var i=0; i<this.rows.length; i++) {
      var row = this.rows[i]
      if (row.object && row.object.order === this.row.object.order) {
        return i
      }
    }
  }
}
