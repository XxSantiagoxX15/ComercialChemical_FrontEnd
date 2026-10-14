import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, isObservable, Observable, of, throwError } from 'rxjs';

import { adminGuard, authGuard } from './auth-guard';
import { AuthService } from '../services/auth.service';

/** Los guards deciden qué pantallas se abren. La sesión se simula con un espía de AuthService. */
describe('Guards de rutas (Jasmine)', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', [
      'isLoggedIn', 'logout', 'puedeVerRuta', 'rutaInicial', 'esAdmin', 'perfilCargado', 'refrescarPerfil',
    ]);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    router = TestBed.inject(Router);
  });

  const ruta = {} as ActivatedRouteSnapshot;
  const estado = (url: string) => ({ url }) as RouterStateSnapshot;
  const url = (resultado: unknown) => router.serializeUrl(resultado as UrlTree);

  async function resolver(resultado: unknown) {
    return isObservable(resultado) ? firstValueFrom(resultado as Observable<unknown>) : resultado;
  }

  describe('authGuard (rutas que exigen sesión)', () => {
    const ejecutar = () => TestBed.runInInjectionContext(() => authGuard(ruta, estado('/dashboard')));

    it('deja pasar con una sesión vigente', () => {
      auth.isLoggedIn.and.returnValue(true);
      expect(ejecutar()).toBeTrue();
      expect(auth.logout).not.toHaveBeenCalled();
    });

    it('sin sesión (o con el token vencido) limpia la sesión y lleva al login', () => {
      auth.isLoggedIn.and.returnValue(false);
      const resultado = ejecutar();
      expect(resultado).toBeInstanceOf(UrlTree);
      expect(url(resultado)).toBe('/login');
      expect(auth.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('adminGuard (Importación, Auditoría, Usuarios)', () => {
    const ejecutar = (destino: string) => TestBed.runInInjectionContext(() => adminGuard(ruta, estado(destino)));

    beforeEach(() => {
      auth.isLoggedIn.and.returnValue(true);
      auth.rutaInicial.and.returnValue('/dashboard');
    });

    it('sin sesión lleva al login', () => {
      auth.isLoggedIn.and.returnValue(false);
      expect(url(ejecutar('/usuarios'))).toBe('/login');
      expect(auth.logout).toHaveBeenCalled();
    });

    it('con el módulo de la pantalla, entra', () => {
      auth.perfilCargado.and.returnValue(true);
      auth.puedeVerRuta.and.returnValue(true);
      expect(ejecutar('/importacion')).toBeTrue();
      expect(auth.puedeVerRuta).toHaveBeenCalledWith('/importacion');
    });

    it('sin el módulo, lo manda a la primera pantalla que sí puede ver', () => {
      auth.perfilCargado.and.returnValue(true);
      auth.puedeVerRuta.and.returnValue(false);
      expect(url(ejecutar('/usuarios'))).toBe('/dashboard');
    });

    it('sin ningún módulo, lo manda a la pantalla «sin acceso»', () => {
      auth.perfilCargado.and.returnValue(true);
      auth.puedeVerRuta.and.returnValue(false);
      auth.rutaInicial.and.returnValue('/sin-acceso');
      expect(url(ejecutar('/auditoria'))).toBe('/sin-acceso');
    });

    it('con una sesión antigua (sin módulos) consulta el perfil antes de decidir', async () => {
      auth.esAdmin.and.returnValue(false);
      auth.perfilCargado.and.returnValue(false);
      auth.refrescarPerfil.and.returnValue(of({ modulos: ['auditoria'] }));
      auth.puedeVerRuta.and.returnValue(true);

      expect(await resolver(ejecutar('/auditoria'))).toBeTrue();
      expect(auth.refrescarPerfil).toHaveBeenCalledTimes(1);
    });

    it('si no puede consultar el perfil, decide con lo que tiene en vez de quedarse colgado', async () => {
      auth.esAdmin.and.returnValue(false);
      auth.perfilCargado.and.returnValue(false);
      auth.refrescarPerfil.and.returnValue(throwError(() => new Error('sin conexión')));
      auth.puedeVerRuta.and.returnValue(false);

      expect(url(await resolver(ejecutar('/importacion')))).toBe('/dashboard');
    });
  });
});