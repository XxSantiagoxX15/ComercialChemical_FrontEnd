import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { DataService } from './data.service';

/** Sesión del usuario: guardar el login, saber si el token sigue vigente, renovarlo y cerrar sesión. */
describe('AuthService: sesión y token (Jasmine)', () => {
  let auth: AuthService;
  let backend: HttpTestingController;
  let router: Router;
  const AHORA = new Date('2026-10-13T10:00:00-05:00');

  /** JWT de prueba (la firma no se verifica en el navegador). */
  function jwt(payload: object): string {
    const parte = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
    return `${parte({ alg: 'HS256' })}.${parte(payload)}.firma`;
  }
  const venceEn = (minutos: number) => Math.floor(AHORA.getTime() / 1000) + minutos * 60;

  beforeEach(() => {
    localStorage.clear();
    jasmine.clock().install();
    jasmine.clock().mockDate(AHORA);

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    auth = TestBed.inject(AuthService);
    backend = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    backend.verify();
    localStorage.clear();
  });

  describe('vigencia del token', () => {
    it('hay sesión mientras el token no vence, y deja de haberla cuando vence', () => {
      auth.saveToken(jwt({ exp: venceEn(60) }));
      expect(auth.isLoggedIn()).toBeTrue();

      jasmine.clock().tick(59 * 60_000);
      expect(auth.isLoggedIn()).toBeTrue();

      jasmine.clock().tick(2 * 60_000);
      expect(auth.isLoggedIn()).toBeFalse();
    });

    it('calcula cuánto le falta al token para vencer', () => {
      auth.saveToken(jwt({ exp: venceEn(30) }));
      expect(auth.getTokenExpiresIn()).toBe(30 * 60_000);

      jasmine.clock().tick(31 * 60_000);
      expect(auth.getTokenExpiresIn()).toBe(0);
    });

    it('sin token, o con un token que no es un JWT, no hay sesión', () => {
      expect(auth.isLoggedIn()).toBeFalse();
      auth.saveToken('esto-no-es-un-jwt');
      expect(auth.isLoggedIn()).toBeFalse();
      expect(auth.isTokenExpired('a.b.c')).toBeTrue();
    });
  });

  describe('guardar la sesión del login', () => {
    it('guarda los tokens y toma el nombre del rol del JWT (el login lo trae como número)', () => {
      const access = jwt({ exp: venceEn(60), rol: 'Analista_Inventarios' });
      auth.saveSession({
        access_token: access,
        refresh_token: 'refresh-1',
        user: { id: 7, nombre_completo: 'Andrés', rol: 2, modulos: ['dashboard', 'pronosticos'] },
      });

      expect(auth.getToken()).toBe(access);
      expect(auth.getRefreshToken()).toBe('refresh-1');
      expect(auth.getRol()).toBe('Analista_Inventarios');
      expect(auth.esAdmin()).toBeFalse();
      expect(auth.getModulos()).toEqual(['dashboard', 'pronosticos']);
    });

    it('la sesión sobrevive a recargar la página (se lee de localStorage)', () => {
      auth.saveSession({
        access_token: jwt({ exp: venceEn(60), rol: 'Administrador' }),
        user: { nombre_completo: 'Ada', modulos: [] },
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
      const recargado = TestBed.inject(AuthService);
      backend = TestBed.inject(HttpTestingController);

      expect(recargado.getUser()?.nombre_completo).toBe('Ada');
      expect(recargado.esAdmin()).toBeTrue();
    });
  });

  describe('renovar el token', () => {
    it('envía el refresh guardado y guarda el access y el refresh NUEVOS', () => {
      localStorage.setItem('refresh_token', 'refresh-1');
      const recibido = jasmine.createSpy('recibido');

      auth.refreshToken().subscribe(recibido);
      const peticion = backend.expectOne(r => r.url.endsWith('/api/auth/refresh/'));
      expect(peticion.request.method).toBe('POST');
      expect(peticion.request.body).toEqual({ refresh: 'refresh-1' });
      peticion.flush({ access: 'access-2', refresh: 'refresh-2' });

      expect(auth.getToken()).toBe('access-2');
      expect(auth.getRefreshToken()).toBe('refresh-2');   // el anterior queda anulado en el backend
      expect(recibido).toHaveBeenCalledTimes(1);
    });

    it('si el backend no rota el refresh, conserva el que había', () => {
      localStorage.setItem('refresh_token', 'refresh-1');
      auth.refreshToken().subscribe();
      backend.expectOne(r => r.url.endsWith('/api/auth/refresh/')).flush({ access: 'access-2' });
      expect(auth.getRefreshToken()).toBe('refresh-1');
    });
  });

  describe('cerrar sesión', () => {
    it('borra tokens y usuario, limpia la caché y lleva al login', () => {
      const cache = TestBed.inject(DataService);
      spyOn(cache, 'clearCache');
      auth.saveSession({
        access_token: jwt({ exp: venceEn(60), rol: 'Administrador' }),
        refresh_token: 'refresh-1',
        user: { nombre_completo: 'Ada', modulos: [] },
      });

      auth.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(auth.getUser()).toBeNull();
      expect(auth.isLoggedIn()).toBeFalse();
      expect(cache.clearCache).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});