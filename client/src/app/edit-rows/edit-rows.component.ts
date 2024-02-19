import { Component, Input, OnInit } from '@angular/core';
import { CommData } from '../communication-lights/communication-lights.component';

@Component({
  selector: 'app-edit-rows',
  templateUrl: './edit-rows.component.html',
  styleUrls: ['./edit-rows.component.css']
})
export class EditRowsComponent implements OnInit {

  @Input() title
  @Input() rows
  @Input() fieldName
  @Input() isString: boolean
  @Input() fnGetDeleteCommData: (row: any) => CommData
  @Input() fnGetCreateCommData: (value: string | number) => CommData
  isVisible = false

  constructor() { }

  callFunc(func: (arg: any) => any, arg: any) {

    if (func) {
      return func(arg)
    }

    return undefined
  }

  getCreateCommData(value: string) {

  }

  getUpdateCommData(row: any) {

  }

  getDeleteCommData(row) {
    return this.callFunc(this.fnGetDeleteCommData, row) 
  }

  getValue(row) {

    const keys = this.fieldName.split('.')
    
    var value = row
    for (var i=0; i<keys.length; i++) {
      value = value[keys[i]]
    }

    return value
  }


  ngOnInit() {
  }

}
