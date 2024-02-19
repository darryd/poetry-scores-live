import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  @Input() possibleRoles: string[]
  @Input() roles: string[]
  processedRoles = []

  constructor() { }

  processRoles() {

    this.processedRoles = []


    this.possibleRoles.forEach(role => {

      this.processedRoles.push(
        {
          role,
          hasRole: this.roles && this.roles.find(r => {return r.toLowerCase() === role.toLowerCase()})
        }
      )
    })
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.processRoles()
  }

}
