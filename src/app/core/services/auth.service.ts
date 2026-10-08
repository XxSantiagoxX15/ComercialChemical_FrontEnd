import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Observable, finalize, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DataService } from './data.service';

/** Módulos del sistema: las mismas claves que usa el backend en `permiso_rol`. */
export type Modulo =
  | 'dashboard'
  | 'inventario_articulos'
  |  'calculadora_precios'
  | 'inventario_movimientos'
  | 'inventario_alertas'
  | 'compras'
  | 'pronosticos'
  | 'importacion'
  | 'auditoria'
  | 'usuarios';

export const ROL_ADMIN = 'Administrador';
export const RUTA_SIN_PERMISOS = '/sin-acceso';
/** Pantallas del frontend y el módulo que da acceso a cada una, en el orden
 *  del menú. Una ruta que no aparece aquí (login) no depende de módulos. */
export const RUTAS_POR_MODULO: { ruta: string; modulo: Modulo }[] = [
  { ruta: '/dashboard',              modulo: 'dashboard' },
  { ruta: '/inventario/articulos',   modulo: 'inventario_articulos' },
    { ruta: '/inventario/calculadora',modulo: 'calculadora_precios' },
  { ruta: '/inventario/movimientos', modulo: 'inventario_movimientos' },
  { ruta: '/inventario/alertas',     modulo: 'inventario_alertas' },
  { ruta: '/compras/ordenes',        modulo: 'compras' },
  { ruta: '/compras/cotizador',      modulo: 'compras' },
  { ruta: '/pronosticos',            modulo: 'pronosticos' },
  { ruta: '/importacion',            modulo: 'importacion' },
  { ruta: '/auditoria',              modulo: 'auditoria' },
  { ruta: '/usuarios',               modulo: 'usuarios' },
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;
  private dataService = inject(DataService);
  private perfilEnCurso$: Observable<any> | null = null;

  // Copia en memoria del usuario guardado en localStorage. Es un signal para
  // que lo que depende del rol o de los módulos se redibuje solo cuando el
  // perfil cambia (la app no usa zone.js).
  private usuario = signal<any | null>(this.leerUsuarioGuardado());

  constructor(private http: HttpClient, private router: Router) {
    this.vigilarNavegacion();
  }

  private leerUsuarioGuardado(): any | null {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  private guardarUsuario(user: any | null) {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    this.usuario.set(user);
  }

  login(data: { correo: string; contrasena: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/auth/login/`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  saveSession(res: any) {
    if (res.access_token)  localStorage.setItem('token', res.access_token);
    if (res.refresh_token) localStorage.setItem('refresh_token', res.refresh_token);
    if (res.user) {
      // Normalizar: guardar rol como nombre string (no como ID numérico)
      const user = { ...res.user };
      // El backend retorna user.rol como ID, pero el JWT tiene el nombre en claim 'rol'
      // Extraemos el nombre del rol del JWT
      const payload = res.access_token ? this.decodeToken(res.access_token) : null;
      if (payload?.rol) user.rol = payload.rol;
      this.guardarUsuario(user);
    }
  }

  // ── Rol y módulos ─────────────────────────────────────────────────────────
  // El backend es quien decide el acceso en cada petición; lo de aquí evita
  // que el usuario entre a pantallas que solo le van a responder 403.

  getRol(): string {
    const user = this.getUser();
    return user?.rol ?? user?.rol_nombre ?? '';
  }

  esAdmin(): boolean {
    return this.getRol() === ROL_ADMIN;
  }

  /** Módulos activos del rol del usuario, tal como los configuró el Administrador. */
  getModulos(): string[] {
    const modulos = this.getUser()?.modulos;
    return Array.isArray(modulos) ? modulos : [];
  }

  /** false en sesiones guardadas antes de que el login devolviera los módulos. */
  perfilCargado(): boolean {
    return Array.isArray(this.getUser()?.modulos);
  }

  /** true si el rol tiene activo al menos uno de los módulos indicados. */
  tieneModulo(...modulos: Modulo[]): boolean {
    if (this.esAdmin()) return true;
    const activos = this.getModulos();
    return modulos.some(m => activos.includes(m));
  }

  /** true si la URL no depende de un módulo o el rol tiene el módulo de esa pantalla. */
  puedeVerRuta(url: string): boolean {
    const ruta = url.split('?')[0].split('#')[0];
    const pantalla = RUTAS_POR_MODULO.find(p => ruta === p.ruta || ruta.startsWith(p.ruta + '/'));
    return !pantalla || this.tieneModulo(pantalla.modulo);
  }

  /** Primera pantalla a la que el usuario puede entrar; null si su rol no tiene ningún módulo. */
   rutaInicial(): string {
    return RUTAS_POR_MODULO.find(p => this.tieneModulo(p.modulo))?.ruta ?? RUTA_SIN_PERMISOS;
  }

  /** Vuelve a leer del backend el rol y los módulos del usuario, para que un
   *  cambio de permisos se refleje sin cerrar sesión. Si ya hay una consulta
   *  en curso se reutiliza en vez de lanzar otra. */
  refrescarPerfil(): Observable<any> {
    if (!this.perfilEnCurso$) {
      this.perfilEnCurso$ = this.http.get<any>(`${this.apiUrl}/api/auth/me/`).pipe(
        tap(perfil => {
          const actual = this.getUser() ?? {};
          this.guardarUsuario({
            ...actual,
            id: perfil.id,
            nombre_completo: perfil.nombre_completo,
            email: perfil.email,
            rol: perfil.rol_nombre ?? actual.rol,
            modulos: Array.isArray(perfil.modulos) ? perfil.modulos : [],
          });
        }),
        finalize(() => { this.perfilEnCurso$ = null; }),
        shareReplay(1),
      );
    }
    return this.perfilEnCurso$;
  }

  /** Refresca el perfil y, si la pantalla actual pertenece a un módulo que el
   *  rol ya no tiene, saca al usuario a la primera que sí pueda ver. */
  sincronizarPermisos(): void {
    if (!this.getToken()) return;
    this.refrescarPerfil().subscribe({
      next: () => this.salirSiNoPuedeVer(this.router.url),
      error: () => { /* el interceptor ya maneja 401; cualquier otro fallo se ignora */ },
    });
  }

  /** Aplica los módulos a la navegación sin tocar las rutas ni el menú:
   *  - al empezar a navegar, si la pantalla de destino es de un módulo que el
   *    rol no tiene, se redirige antes de cargarla;
   *  - al terminar, se vuelven a leer los módulos por si el Administrador
   *    cambió los permisos. */
  private vigilarNavegacion() {
    this.router.events.subscribe(evento => {
      if (!this.getToken()) return;
      if (evento instanceof NavigationStart) {
        if (this.esAdmin() || this.perfilCargado()) this.salirSiNoPuedeVer(evento.url);
      } else if (evento instanceof NavigationEnd) {
        this.sincronizarPermisos();
      }
    });
  }

   private salirSiNoPuedeVer(url: string) {
    if (this.puedeVerRuta(url)) return;
    this.router.navigateByUrl(this.rutaInicial());
  }

  /** Decodifica el payload de un JWT sin verificar la firma (solo lectura de claims). */
  decodeToken(token: string): any | null {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getUser(): any {
    return this.usuario();
  }

  /** true si el access token existe y no ha expirado */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  /** Comprueba si un JWT está expirado leyendo el claim exp */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;
    return payload.exp * 1000 < Date.now();
  }

  /** Tiempo en ms hasta que expira el access token */
  getTokenExpiresIn(): number {
    const token = this.getToken();
    if (!token) return 0;
    const payload = this.decodeToken(token);
    if (!payload) return 0;
    return Math.max(0, payload.exp * 1000 - Date.now());
  }

  /** Llama al endpoint de refresh y actualiza el token */
  refreshToken(): Observable<any> {
    const refresh = this.getRefreshToken();
    return this.http.post<any>(`${this.apiUrl}/api/auth/refresh/`, { refresh }).pipe(
      tap(res => {
        if (res.access) localStorage.setItem('token', res.access);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    this.guardarUsuario(null);
    this.dataService.clearCache();
    this.router.navigate(['/login']);
  }
    /** Pide que se envíe al correo un código para restablecer la contraseña. */
  solicitarCodigoPassword(correo: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/auth/password/codigo/`, { correo });
  }

  /** Cambia la contraseña usando el código que llegó al correo. */
  restablecerPassword(data: { correo: string; codigo: string; nueva_password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/auth/password/restablecer/`, data);
  }
}