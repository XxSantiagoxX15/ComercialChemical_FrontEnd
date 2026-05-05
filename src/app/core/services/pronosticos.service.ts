import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PronosticosService {
  private http = inject(HttpClient);
  private base = 'http://127.0.0.1:8000';

  calcularPrediccion(articuloId: number, modelo: string, periodos: number): Observable<any> {
    return this.http.post(`${this.base}/api/pronosticos/calcular/${articuloId}/`, { modelo, periodos });
  }

  getPredicciones(articuloId: number): Observable<any> {
    return this.http.get(`${this.base}/api/pronosticos/predicciones/${articuloId}/`);
  }

  getAnalisis(articuloId: number): Observable<any> {
    return this.http.get(`${this.base}/api/pronosticos/analisis/${articuloId}/`);
  }

  getMasVendidos(): Observable<any> {
    return this.http.get(`${this.base}/api/pronosticos/mas-vendidos/`);
  }

  getRecomendaciones(): Observable<any> {
    return this.http.get(`${this.base}/api/pronosticos/recomendaciones/`);
  }
}
