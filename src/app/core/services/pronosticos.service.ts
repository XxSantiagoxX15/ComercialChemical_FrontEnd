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

  calcularPronosticosMasivo(modelo: string = 'auto', periodos: number = 3): Observable<any> {
    return this.http.post(`${this.base}/api/pronosticos/calcular-todos/`, { modelo, periodos });
  }

  getRiesgoAgotamiento(diasUmbral: number = 30, limit: number = 10): Observable<any> {
    return this.http.get(`${this.base}/api/pronosticos/riesgo-agotamiento/`, {
      params: new HttpParams().set('dias_umbral', diasUmbral).set('limit', limit)
    });
  }

  compararPeriodos(params: {
    desde1: string; hasta1: string; desde2: string; hasta2: string;
    articulo_id?: number; limit?: number;
  }): Observable<any> {
    let httpParams = new HttpParams()
      .set('desde1', params.desde1).set('hasta1', params.hasta1)
      .set('desde2', params.desde2).set('hasta2', params.hasta2);
    if (params.articulo_id) httpParams = httpParams.set('articulo_id', params.articulo_id);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    return this.http.get(`${this.base}/api/pronosticos/comparar-periodos/`, { params: httpParams });
  }

  getMesesDisponibles(): Observable<any> {
    return this.http.get(`${this.base}/api/pronosticos/meses-disponibles/`);
  }

  getReporteNecesidades(mes: string): Observable<any> {
    return this.http.get(`${this.base}/api/pronosticos/reporte-necesidades/`, {
      params: new HttpParams().set('mes', mes)
    });
  }

  descargarReporteNecesidadesPdf(mes: string): Observable<Blob> {
    return this.http.get(`${this.base}/api/pronosticos/reporte-necesidades/pdf/`, {
      params: new HttpParams().set('mes', mes),
      responseType: 'blob',
    });
  }

  exportarMasVendidos(formato: 'pdf' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.base}/api/pronosticos/mas-vendidos/exportar/`, {
      params: new HttpParams().set('formato', formato),
      responseType: 'blob',
    });
  }

  exportarComparacion(formato: 'pdf' | 'excel', params: {
    desde1: string; hasta1: string; desde2: string; hasta2: string;
    articulo_id?: number; limit?: number;
  }): Observable<Blob> {
    let httpParams = new HttpParams()
      .set('formato', formato)
      .set('desde1', params.desde1).set('hasta1', params.hasta1)
      .set('desde2', params.desde2).set('hasta2', params.hasta2);
    if (params.articulo_id) httpParams = httpParams.set('articulo_id', params.articulo_id);
    if (params.limit) httpParams = httpParams.set('limit', params.limit);
    return this.http.get(`${this.base}/api/pronosticos/comparar-periodos/exportar/`, {
      params: httpParams,
      responseType: 'blob',
    });
  }
}
