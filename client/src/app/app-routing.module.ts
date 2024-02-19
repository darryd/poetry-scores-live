import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClubsComponent } from './clubs/clubs.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ClubInfoComponent } from './club-info/club-info.component';
import { LoginComponent } from './login.component';
import { OktaCallbackComponent } from '@okta/okta-angular';
import { CompetitionComponent } from './competition/competition.component';
import { SignUpComponent } from './sign-up/sign-up.component';


const routes: Routes = 
[
   {path: 'welcome', component: WelcomeComponent},
   {path: 'callback', component: OktaCallbackComponent},
   {path: 'login', component: LoginComponent},
   {path: 'register', component: SignUpComponent},
   {path: '', component: ClubsComponent},
   {path: ':name', component: ClubInfoComponent},
   {path: 'competition/:_id', component: CompetitionComponent}
   //{path: '', redirectTo: 'welcome', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
