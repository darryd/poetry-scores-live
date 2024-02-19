import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'app-new-year',
  templateUrl: './new-year.component.html',
  styleUrls: ['./new-year.component.css']
})
export class NewYearComponent implements OnInit {

  @Input() competitions
  @Input() index
  year: number;
  month
  constructor() { }

  ngOnInit() {

  }

  monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

  ngOnChanges() {
    this.year = 0
    if (this.index === 0) {
      this.year = new Date(this.competitions[0].createdAt).getFullYear()
      this.month = this.monthNames[new Date(this.competitions[0].createdAt).getMonth()]
    }
    else {
      var yearThisIndex = new Date(this.competitions[this.index].createdAt).getFullYear()
      var yearPreviousIndex = new Date(this.competitions[this.index - 1].createdAt).getFullYear()

      if (yearThisIndex !== yearPreviousIndex) {
        this.year = yearThisIndex
      }

      var monthThisIndex = new Date(this.competitions[this.index].createdAt).getMonth()
      var monthPreviousIndex = new Date(this.competitions[this.index - 1].createdAt).getMonth()

      if (yearThisIndex !== yearPreviousIndex || monthThisIndex !== monthPreviousIndex) {
        this.month = this.monthNames[monthThisIndex]
      }
    }
  }

}
