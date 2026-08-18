import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImportacionService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  uploadFile(file: File, tipoInforme: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo_informe', tipoInforme);
    return this.http.post(`${this.base}/api/importacion/upload/`, formData);
  }

  getHistorial(): Observable<any> {
    return this.http.get(`${this.base}/api/importacion/historial/`);
  }
}
