import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http = inject(HttpClient);
  private base = 'http://127.0.0.1:8000';

  getArticulos(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => {
        if (params[k] !== null && params[k] !== undefined && params[k] !== '') {
          p = p.set(k, params[k]);
        }
      });
    }
    return this.http.get(`${this.base}/api/inventario/articulos/`, { params: p });
  }

  getArticulo(id: number): Observable<any> {
    return this.http.get(`${this.base}/api/inventario/articulos/${id}/`);
  }

  crearArticulo(data: any): Observable<any> {
    return this.http.post(`${this.base}/api/inventario/articulos/`, data);
  }

  actualizarArticulo(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/api/inventario/articulos/${id}/`, data);
  }

  getMovimientos(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => {
        if (params[k] !== null && params[k] !== undefined && params[k] !== '') {
          p = p.set(k, params[k]);
        }
      });
    }
    return this.http.get(`${this.base}/api/inventario/movimientos/`, { params: p });
  }

  registrarMovimiento(data: any): Observable<any> {
    return this.http.post(`${this.base}/api/inventario/movimientos/`, data);
  }

  getAlertasStockCritico(): Observable<any> {
    return this.http.get(`${this.base}/api/inventario/alertas-stock-critico/`);
  }

  getKits(): Observable<any> {
    return this.http.get(`${this.base}/api/inventario/kits/`);
  }

  crearKit(data: any): Observable<any> {
    return this.http.post(`${this.base}/api/inventario/kits/`, data);
  }
}
