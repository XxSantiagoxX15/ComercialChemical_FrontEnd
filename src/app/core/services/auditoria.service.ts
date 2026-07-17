import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getEventos(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => {
        if (params[k] !== null && params[k] !== undefined && params[k] !== '') {
          p = p.set(k, params[k]);
        }
      });
    }
    return this.http.get(`${this.base}/api/auditoria/eventos/`, { params: p });
  }
}
