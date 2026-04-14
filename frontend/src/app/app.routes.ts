import { Routes } from '@angular/router';
import { DashboardPageComponent } from './features/dashboard/presentation/dashboard-page/dashboard-page.component';
import { LOGIN_PROVIDERS } from './features/login/login.providers';
import { LoginPageComponent } from './features/login/presentation/login-page/login-page.component';
import { ProfilePageComponent } from './features/profile/presentation/profile-page/profile-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent, providers: LOGIN_PROVIDERS },
  { path: 'dashboard', component: DashboardPageComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: '**', redirectTo: 'dashboard' },
];
