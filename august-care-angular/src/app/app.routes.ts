import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { HomeDashboardComponent } from './components/home-dashboard/home-dashboard.component';
import { PatientProfileComponent } from './components/patient-profile/patient-profile.component';
import { PrescriberChatComponent } from './components/prescriber-chat/prescriber-chat.component';
import { PrescriberEhrComponent } from './components/prescriber-ehr/prescriber-ehr.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'home', component: HomeDashboardComponent, canActivate: [authGuard] },
  { path: 'chat', component: PrescriberChatComponent, canActivate: [authGuard] },
  { path: 'profile', component: PatientProfileComponent, canActivate: [authGuard] },
  { path: 'prescriber', component: PrescriberEhrComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
