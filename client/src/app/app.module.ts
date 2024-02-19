import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';



import {
  OKTA_CONFIG,
  OktaAuthModule
} from '@okta/okta-angular';

export function onAuthRequired(oktaAuth, injector) {
  // Use injector to access any service available within your application
  const router = injector.get(Router);

  // Redirect the user to your custom login page
  router.navigate(['/login']);
}

const oktaConfig = {
  issuer: `https://dev-576524.okta.com/oauth2/default`,
  clientId: '0oak4qxinM04QRKyC4x6',
  redirectUri: `${window.location.origin}/callback`,
  pkce: true,
  onAuthRequired: onAuthRequired
}

import { ClubsComponent } from './clubs/clubs.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ClubInfoComponent } from './club-info/club-info.component';
import { NotificationService } from './notification.service';
import { LoginComponent } from './login.component';
import { AddAuthorizationHeader } from './add-authorization-header';
import { IsAuthenticatedService } from './is-authenticated.service'
import { SyncArrayService } from './sync-array.service';
import { CreateCompetitionComponent } from './create-competition/create-competition.component';
import { CompetitionComponent } from './competition/competition.component';
import { PerformanceComponent } from './performance/performance.component';
import { ScoresComponent } from './scores/scores.component';
import { JudgeComponent } from './judge/judge.component';
import { PenaltyComponent } from './penalty/penalty.component';
import { TimeComponent } from './time/time.component';
import { ScorePipe } from './score.pipe';
import { UpdateScoreComponent } from './update-performance/update-score/update-score.component';
import { CommunicationLightsComponent } from './communication-lights/communication-lights.component';
import { UpdateFieldComponent } from './update-field/update-field.component';
import { UpdateTimeComponent } from './update-performance/update-time/update-time.component';
import { UpdatePenaltyComponent } from './update-performance/update-penalty/update-penalty.component';
import { RoundComponent } from './round/round.component';
import { ButtonWithCommLightComponent } from './button-with-comm-light/button-with-comm-light.component';
import { UpdatePerformanceComponent } from './update-performance/update-performance.component';
import { UpDownComponent } from './up-down/up-down.component';
import { SortByOrder } from './sort-by-order';
import { PoetsComponent } from './poets/poets.component';
import { SignupComponent } from './signup/signup.component';
import { AddPerformanceComponent } from './add-performance/add-performance.component';
import { UpdateRoundComponent } from './update-round/update-round.component';
import { CreateClubComponent } from './create-club/create-club.component';
import { Router } from '@angular/router';
import { SignUpComponent } from './sign-up/sign-up.component';
import { PermissionsService } from './permissions.service';
import { NewYearComponent } from './new-year/new-year.component';
import { UpdateTimeLimitComponent } from './update-round/update-time-limit/update-time-limit.component';
import { UpdateIncomingRankComponent } from './update-round/update-incoming-rank/update-incoming-rank.component';
import { EditRowsComponent } from './edit-rows/edit-rows.component';
import { RolesComponent } from './roles/roles.component';
import { UpdateCompetitionComponent } from './update-competition/update-competition.component';

@NgModule({
  declarations: [
    AppComponent,
    ClubsComponent,
    WelcomeComponent,
    ClubInfoComponent,
    LoginComponent,
    CreateCompetitionComponent,
    CompetitionComponent,
    PerformanceComponent,
    ScoresComponent,
    ScorePipe,
    JudgeComponent,
    TimeComponent,
    PenaltyComponent,
    UpdateScoreComponent,
    CommunicationLightsComponent,
    UpdateFieldComponent,
    UpdateTimeComponent,
    UpdatePenaltyComponent,
    RoundComponent,
    ButtonWithCommLightComponent,
    UpdatePerformanceComponent,
    UpDownComponent,
    SortByOrder,
    PoetsComponent,
    SignupComponent,
    AddPerformanceComponent,
    UpdateRoundComponent,
    CreateClubComponent,
    SignUpComponent,
    NewYearComponent,
    UpdateTimeLimitComponent,
    UpdateIncomingRankComponent,
    EditRowsComponent,
    RolesComponent,
    UpdateCompetitionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    OktaAuthModule,
    FormsModule
  ],
  providers: [NotificationService, { provide: OKTA_CONFIG, useValue: oktaConfig }, {
    provide: HTTP_INTERCEPTORS,
    useClass: AddAuthorizationHeader,
    multi: true
  }, IsAuthenticatedService, 
     SyncArrayService, PermissionsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
