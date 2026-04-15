import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { LoginCredentials } from '../../domain/entities/login-credentials.entity';
import { LoginResult } from '../../domain/entities/login-result.entity';
import { RegisterData } from '../../domain/entities/register-data.entity';
import { RegisterResult } from '../../domain/entities/register-result.entity';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { API_BASE_URL, API_ENDPOINTS } from '../../../../shared/constants/api.constants';

interface LoginApiResponse {
  access: string;
  refresh: string;
}

@Injectable()
export class AuthApiRepository implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<LoginResult> {
    return this.http
      .post<LoginApiResponse>(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
        username: credentials.username,
        password: credentials.password,
      })
      .pipe(
        map((response) => ({
          accessToken: response.access,
          refreshToken: response.refresh,
        })),
      );
  }

  register(data: RegisterData): Observable<RegisterResult> {
    return this.http.post<RegisterResult>(`${API_BASE_URL}${API_ENDPOINTS.register}`, data);
  }
}
