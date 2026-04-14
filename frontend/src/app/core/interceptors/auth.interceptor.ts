import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { API_BASE_URL, API_ENDPOINTS } from '../../shared/constants/api.constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();
  const isApiRequest = req.url.startsWith(API_BASE_URL);
  const isAuthRequest = req.url.includes(API_ENDPOINTS.login) || req.url.includes(API_ENDPOINTS.tokenRefresh);

  if (!accessToken || !isApiRequest || isAuthRequest) {
    return next(req);
  }

  const authorizedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return next(authorizedRequest);
};
