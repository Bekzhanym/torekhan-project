import { Provider } from '@angular/core';

import { LoginUseCase } from './application/use-cases/login.use-case';
import { AuthApiRepository } from './infrastructure/repositories/auth-api.repository';
import { AUTH_REPOSITORY } from './domain/repositories/auth.repository';

export const LOGIN_PROVIDERS: Provider[] = [
  LoginUseCase,
  AuthApiRepository,
  { provide: AUTH_REPOSITORY, useExisting: AuthApiRepository },
];
