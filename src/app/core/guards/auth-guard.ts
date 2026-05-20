import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  auth.logout();
  return router.createUrlTree(['/login']);
};

/** Guard que solo permite acceso a Administrador */
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    auth.logout();
    return router.createUrlTree(['/login']);
  }

  const user = auth.getUser();
  const rol  = user?.rol ?? user?.rol_nombre ?? '';

  if (rol === 'Administrador') {
    return true;
  }

  // No es admin → redirigir al home
  return router.createUrlTree(['/home']);
};
