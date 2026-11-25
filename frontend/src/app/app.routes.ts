import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { HomeDashboardComponent } from './features/home-dashboard/home-dashboard.component';
import { PatientProfileComponent } from './features/patient-profile/patient-profile.component';
import { PrescriberChatComponent } from './features/prescriber-chat/prescriber-chat.component';
import { PrescriberEhrComponent } from './features/prescriber-ehr/prescriber-ehr.component';
import { authGuard } from './core/guards/auth.guard';
import { tabLoaderGuard } from './core/guards/tab-loader.guard';

export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'home', component: HomeDashboardComponent, canActivate: [authGuard, tabLoaderGuard] },
  { path: 'chat', component: PrescriberChatComponent, canActivate: [authGuard, tabLoaderGuard] },
  { path: 'profile', component: PatientProfileComponent, canActivate: [authGuard, tabLoaderGuard] },
  { path: 'prescriber', component: PrescriberEhrComponent, canActivate: [authGuard, tabLoaderGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
