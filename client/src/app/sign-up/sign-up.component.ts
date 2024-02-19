import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  registrationLink: any;

  constructor() { }

  ngOnInit() {
  }
  
  ngAfterViewChecked()	
  {
    if (!this.registrationLink) {
      this.registrationLink = document.querySelector('.registration-link')
      if (this.registrationLink) {
        this.registrationLink.click()
      }
    }
  }
}
