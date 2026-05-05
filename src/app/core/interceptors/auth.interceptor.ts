import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);

  // No agregar token en login ni en refresh
  if (req.url.includes('/api/auth/login/') || req.url.includes('/api/auth/refresh/')) {
    return next(req);
  }

  const token = auth.getToken();
  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor responde 401, intentar refrescar el token una vez
      if (error.status === 401 && auth.getRefreshToken()) {
        return auth.refreshToken().pipe(
          switchMap(() => {
            const newToken = auth.getToken();
            const retryReq = newToken
              ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
              : req;
            return next(retryReq);
          }),
          catchError(refreshError => {
            // Si el refresh también falla, cerrar sesión
            auth.logout();
            return throwError(() => refreshError);
          })
        );
      }

      // Para cualquier otro 401 sin refresh token, cerrar sesión
      if (error.status === 401) {
        auth.logout();
      }

      return throwError(() => error);
    })
  );
};
