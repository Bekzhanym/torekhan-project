import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { LoginCredentials } from '../entities/login-credentials.entity';
import { LoginResult } from '../entities/login-result.entity';
import { RegisterData } from '../entities/register-data.entity';
import { RegisterResult } from '../entities/register-result.entity';

export interface AuthRepository {
  login(credentials: LoginCredentials): Observable<LoginResult>;
  register(data: RegisterData): Observable<RegisterResult>;
}

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AUTH_REPOSITORY');
