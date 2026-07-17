import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PronosticosService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

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

  getEOQ(articuloId: number): Observable<any> {
    return this.http.get(`${this.base}/api/pronosticos/eoq/${articuloId}/`);
  }

  generarOrdenDesdeRecomendacion(articuloId: number): Observable<any> {
    return this.http.post(`${this.base}/api/pronosticos/recomendaciones/${articuloId}/generar-orden/`, {});
  }

  getResumenHistorico(meses: number = 12): Observable<any> {
    return this.http.get(`${this.base}/api/pronosticos/resumen-historico/`, {
      params: new HttpParams().set('meses', meses)
    });
  }
}
