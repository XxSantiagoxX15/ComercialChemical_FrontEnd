import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.base}/api/auth/usuarios/`);
  }

  crearUsuario(data: any): Observable<any> {
    return this.http.post(`${this.base}/api/auth/usuarios/`, data);
  }

  actualizarUsuario(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/api/auth/usuarios/${id}/`, data);
  }

  resetPassword(id: number, nueva_password: string): Observable<any> {
    return this.http.post(`${this.base}/api/auth/usuarios/${id}/reset-password/`, { nueva_password });
  }

  getRoles(): Observable<any> {
    return this.http.get(`${this.base}/api/auth/roles/`);
  }

  // ── Permisos por rol ──────────────────────────────────────────────────────
  getPermisos(): Observable<any> {
    return this.http.get(`${this.base}/api/auth/permisos/`);
  }

  actualizarPermisos(rol_id: number, permisos: Record<string, boolean>): Observable<any> {
    return this.http.put(`${this.base}/api/auth/permisos/`, { rol_id, permisos });
  }
}
