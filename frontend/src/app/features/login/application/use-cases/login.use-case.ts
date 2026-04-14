import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { LoginCredentials } from '../../domain/entities/login-credentials.entity';
import { LoginResult } from '../../domain/entities/login-result.entity';
import { RegisterData } from '../../domain/entities/register-data.entity';
import { RegisterResult } from '../../domain/entities/register-result.entity';
import { AUTH_REPOSITORY, AuthRepository } from '../../domain/repositories/auth.repository';

@Injectable()
export class LoginUseCase {
  private readonly authRepository = inject<AuthRepository>(AUTH_REPOSITORY);

  execute(credentials: LoginCredentials): Observable<LoginResult> {
    return this.authRepository.login(credentials);
  }

  register(data: RegisterData): Observable<RegisterResult> {
    return this.authRepository.register(data);
  }
}
