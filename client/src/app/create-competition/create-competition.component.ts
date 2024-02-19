import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-competition',
  templateUrl: './create-competition.component.html',
  styleUrls: ['./create-competition.component.css']
})
export class CreateCompetitionComponent implements OnInit {

  title: string
  isFormVisible = false
  @Input() club_id: string

  constructor(private http: HttpClient) { }

  create() {
    const url = '/api/competition'
    const body = {club_id: this.club_id, title: this.title}
    this.http.post(url, body).subscribe(
      data => {
        this.hideForm()
      },
      error => {
        console.error(error)
      }
    )
  }

  showForm() {
    this.isFormVisible = true
  }

  hideForm() {
    this.isFormVisible = false
  }

  ngOnInit() {
  }
}
