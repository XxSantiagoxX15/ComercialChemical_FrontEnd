import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000';

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
    if (res.user)          localStorage.setItem('user', JSON.stringify(res.user));
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
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /** Tiempo en ms hasta que expira el access token */
  getTokenExpiresIn(): number {
    const token = this.getToken();
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Math.max(0, payload.exp * 1000 - Date.now());
    } catch {
      return 0;
    }
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
    this.router.navigate(['/login']);
  }
}
