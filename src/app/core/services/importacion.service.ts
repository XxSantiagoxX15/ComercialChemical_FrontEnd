import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImportacionService {
  private http = inject(HttpClient);
  private base = 'http://127.0.0.1:8000';

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
