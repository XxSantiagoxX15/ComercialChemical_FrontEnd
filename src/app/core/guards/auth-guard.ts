import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
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

/**
 * Guard de Importación, Auditoría y Usuarios. Conserva el nombre porque las
 * rutas ya lo usan, pero ya no exige ser Administrador: deja entrar a quien
 * tenga activo el módulo de esa pantalla (Usuarios solo lo tiene el
 * Administrador). Si no, lleva al usuario a la primera pantalla que sí puede ver.
 */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    auth.logout();
    return router.createUrlTree(['/login']);
  }

 const decidir = () =>
    auth.puedeVerRuta(state.url) ? true : router.parseUrl(auth.rutaInicial());

  // Sesiones iniciadas antes de este cambio no tienen los módulos guardados:
  // se consultan una vez antes de decidir (al Administrador no le hace falta).
  if (auth.esAdmin() || auth.perfilCargado()) return decidir();
  return auth.refrescarPerfil().pipe(
    map(decidir),
    catchError(() => of(decidir())),
  );
};