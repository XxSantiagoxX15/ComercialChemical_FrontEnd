import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject, throwError } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor de autenticación: añade el token a cada petición y, cuando el
 * backend responde 401 porque el token venció, lo renueva UNA vez y repite la
 * petición. Si no se puede renovar, cierra la sesión.
 */
describe('authInterceptor (Jasmine)', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;
  let tokenActual: string | null;
  let refreshGuardado: string | null;

  const API = 'http://localhost:8000/api/inventario/articulos/';
  const noAutorizado = { status: 401, statusText: 'Unauthorized' };

  beforeEach(() => {
    tokenActual = 'token-viejo';
    refreshGuardado = 'refresh-1';

    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getToken', 'getRefreshToken', 'refreshToken', 'logout']);
    auth.getToken.and.callFake(() => tokenActual);
    auth.getRefreshToken.and.callFake(() => refreshGuardado);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  /** Simula una renovación que el backend todavía no ha contestado. */
  function renovacionPendiente(): Subject<any> {
    const respuesta = new Subject<any>();
    auth.refreshToken.and.returnValue(respuesta.asObservable());
    return respuesta;
  }

  function renovarCon(nuevoToken: string, respuesta: Subject<any>) {
    tokenActual = nuevoToken;              // lo que haría AuthService al recibirlo
    respuesta.next({ access: nuevoToken });
    respuesta.complete();
  }

  it('añade el token como «Bearer» a las peticiones de la API', () => {
    http.get(API).subscribe();

    const peticion = backend.expectOne(API);
    expect(peticion.request.headers.get('Authorization')).toBe('Bearer token-viejo');
    peticion.flush([]);
  });

  it('no añade token al login ni a la renovación', () => {
    http.post('http://localhost:8000/api/auth/login/', {}).subscribe();
    http.post('http://localhost:8000/api/auth/refresh/', {}).subscribe();

    for (const peticion of backend.match(() => true)) {
      expect(peticion.request.headers.has('Authorization'))
        .withContext(peticion.request.url).toBeFalse();
      peticion.flush({});
    }
  });

  it('sin sesión envía la petición tal cual', () => {
    tokenActual = null;
    http.get(API).subscribe();

    const peticion = backend.expectOne(API);
    expect(peticion.request.headers.has('Authorization')).toBeFalse();
    peticion.flush([]);
  });

  it('ante un 401 renueva el token y repite la petición con el nuevo', () => {
    const renovacion = renovacionPendiente();
    const recibido = jasmine.createSpy('recibido');
    http.get(API).subscribe(recibido);

    backend.expectOne(API).flush(null, noAutorizado);
    expect(auth.refreshToken).toHaveBeenCalledTimes(1);

    renovarCon('token-nuevo', renovacion);
    const repetida = backend.expectOne(API);
    expect(repetida.request.headers.get('Authorization')).toBe('Bearer token-nuevo');
    repetida.flush([{ id: 1 }]);

    expect(recibido).toHaveBeenCalledOnceWith([{ id: 1 }]);
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('si varias peticiones reciben 401 a la vez, renueva una sola vez para todas', () => {
    const renovacion = renovacionPendiente();
    const otra = 'http://localhost:8000/api/compras/ordenes/';
    http.get(API).subscribe();
    http.get(otra).subscribe();

    backend.expectOne(API).flush(null, noAutorizado);
    backend.expectOne(otra).flush(null, noAutorizado);
    expect(auth.refreshToken).toHaveBeenCalledTimes(1);

    renovarCon('token-nuevo', renovacion);
    for (const url of [API, otra]) {
      const repetida = backend.expectOne(url);
      expect(repetida.request.headers.get('Authorization')).toBe('Bearer token-nuevo');
      repetida.flush([]);
    }
  });

  it('si la renovación falla, cierra la sesión y entrega el error', () => {
    auth.refreshToken.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    const error = jasmine.createSpy('error');
    http.get(API).subscribe({ error });

    backend.expectOne(API).flush(null, noAutorizado);

    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledOnceWith(jasmine.objectContaining({ status: 401 }));
    backend.expectNone(API);               // no se repite la petición
  });

  it('un 401 sin token de renovación cierra la sesión sin intentar renovar', () => {
    refreshGuardado = null;
    http.get(API).subscribe({ error: () => undefined });

    backend.expectOne(API).flush(null, noAutorizado);

    expect(auth.refreshToken).not.toHaveBeenCalled();
    expect(auth.logout).toHaveBeenCalledTimes(1);
  });

  it('los demás errores (403, 500) llegan a la pantalla sin cerrar la sesión', () => {
    for (const status of [403, 500]) {
      const error = jasmine.createSpy('error');
      http.get(API).subscribe({ error });
      backend.expectOne(API).flush({ detail: 'x' }, { status, statusText: 'Error' });
      expect(error).toHaveBeenCalledOnceWith(jasmine.objectContaining({ status }));
    }
    expect(auth.refreshToken).not.toHaveBeenCalled();
    expect(auth.logout).not.toHaveBeenCalled();
  });
});