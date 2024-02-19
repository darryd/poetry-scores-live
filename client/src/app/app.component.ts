import { ChangeDetectorRef, Component } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import * as Ably from 'ably';
import { NumberOfViewersService } from './number-of-viewers.service';
import { IsLoadingService } from './is-loading.service';
import { Goodbye } from './goodbye';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isAuthenticated: boolean;
  stateChange: Ably.Types.ConnectionStateChange;
  isLoading: boolean;

  constructor(public oktaAuth: OktaAuthService, 
              public router: Router, 
              private notificationService: NotificationService,
              public numberOfViewersService: NumberOfViewersService,
              private isLoadingService: IsLoadingService,
              private changeDetectorRef: ChangeDetectorRef) 
  {
    this.oktaAuth.$authenticationState.subscribe(
      (isAuthenticated: boolean)  => { 
        this.isAuthenticated = isAuthenticated
      }
    );

    this.notificationService.$stateChange.subscribe(
      (stateChange => {
        this.stateChange = stateChange

        if (stateChange.current === "connected") {
          this.drawCircle('#cffafa')
        } else {
          this.drawCircle('rgb(245,133,133)')
        }

        if (stateChange.reason)
          console.log(stateChange.reason)
        return this.stateChange = stateChange;
      })
    )
  }


  drawCircle(color: string) {

    var canvas = <any> document.getElementById('connection-canvas');
    var context = canvas.getContext('2d');
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = centerX;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.stroke();
  }


  async ngOnInit() {



      // debugger
      // var goodbye = new Goodbye()


      // var obj = {name: 'Performance', _id: 'abcdefghijklmnopqrstuvwxyz'}


      // goodbye.addBye(JSON.stringify(obj), (eventName) => console.log(eventName))
      // goodbye.trigger(JSON.stringify(obj))



    // Get the authentication state for immediate use
    this.isAuthenticated = await this.oktaAuth.isAuthenticated();
    this.drawCircle('rgb(245,133,133)')
    this.isLoading = this.isLoadingService.isLoading

    this.changeDetectorRef.detectChanges()
    this.isLoadingService.$loadingStatus.subscribe(
      isLoading => {
        this.isLoading = isLoading
        this.changeDetectorRef.detectChanges()
      }
    )
  }

  login() {
    this.oktaAuth.loginRedirect('/profile');
  }

  async logout() {
    // Terminates the session with Okta and removes current tokens.
    await this.oktaAuth.logout();
    //this.router.navigateByUrl('/');
  }
}
