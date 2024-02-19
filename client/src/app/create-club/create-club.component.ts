import { Component, OnInit } from '@angular/core';
import { CommData } from '../communication-lights/communication-lights.component';

@Component({
  selector: 'app-create-club',
  templateUrl: './create-club.component.html',
  styleUrls: ['./create-club.component.css']
})
export class CreateClubComponent implements OnInit {
  url: string;
  title: string;
  commDataFunc = this.generateCommDataFunc()

  constructor() { }

  ngOnInit() {
  }

  generateCommDataFunc() {
    return () => {

      var commData = <CommData>{}

      commData.url = '/api/club'
      commData.httpVerb = 'post'
      commData.body = { name: this.url, title: this.title }

      return commData
    }
  }
}
