import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { DashboardPageComponent } from './features/dashboard/presentation/dashboard-page/dashboard-page.component';
import { LOGIN_PROVIDERS } from './features/login/login.providers';
import { LoginPageComponent } from './features/login/presentation/login-page/login-page.component';
import { PostDetailsPageComponent } from './features/posts/presentation/post-details-page/post-details-page.component';
import { ProfilePageComponent } from './features/profile/presentation/profile-page/profile-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent, providers: LOGIN_PROVIDERS },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: 'posts/:id', component: PostDetailsPageComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' },
];
