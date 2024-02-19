import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-poets',
  templateUrl: './poets.component.html',
  styleUrls: ['./poets.component.css']
})
export class PoetsComponent implements OnInit {

  @Input() poets
  totalPoets: any;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
  }
}
