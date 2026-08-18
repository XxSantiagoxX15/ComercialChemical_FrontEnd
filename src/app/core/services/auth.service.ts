import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;
  private dataService = inject(DataService);

  constructor(private http: HttpClient, private router: Router) {}

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
      localStorage.setItem('user', JSON.stringify(user));
    }
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
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
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
    localStorage.removeItem('user');
    this.dataService.clearCache();
    this.router.navigate(['/login']);
  }
}
