import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

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
    return this.http.post(`${this.base}/api/inventario/articulos/`, this.toFormData(data));
  }

  actualizarArticulo(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/api/inventario/articulos/${id}/`, this.toFormData(data));
  }

  /** Construye FormData para soportar la subida de la ficha de seguridad (PDF). */
  private toFormData(data: any): FormData {
    const fd = new FormData();
    Object.keys(data).forEach(k => {
      const v = data[k];
      if (v === null || v === undefined) return;
      if (k === 'ficha_seguridad' && !(v instanceof File)) return; // no reenviar si no cambió
      fd.append(k, v instanceof File ? v : String(v));
    });
    return fd;
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

  getAlertasStockCritico(incluirIgnoradas: boolean = false): Observable<any> {
    let p = new HttpParams();
    if (incluirIgnoradas) p = p.set('incluir_ignoradas', 'true');
    return this.http.get(`${this.base}/api/inventario/alertas-stock-critico/`, { params: p });
  }

  ignorarAlerta(articuloId: number): Observable<any> {
    return this.actualizarArticulo(articuloId, { alerta_ignorada: true });
  }

  reactivarAlerta(articuloId: number): Observable<any> {
    return this.actualizarArticulo(articuloId, { alerta_ignorada: false });
  }

  getLotesArticulo(articuloId: number): Observable<any> {
    return this.http.get(`${this.base}/api/inventario/articulos/${articuloId}/lotes/`);
  }

  getAlertasVencimiento(dias = 30): Observable<any> {
    return this.http.get(`${this.base}/api/inventario/alertas-vencimiento/`, {
      params: new HttpParams().set('dias', dias)
    });
  }

  getKits(): Observable<any> {
    return this.http.get(`${this.base}/api/inventario/kits/`);
  }

  getKitsProducibles(): Observable<any> {
    return this.http.get(`${this.base}/api/inventario/kits/producibles/`);
  }

  crearKit(data: any): Observable<any> {
    return this.http.post(`${this.base}/api/inventario/kits/`, data);
  }

  getResumenStockMensual(meses: number = 12): Observable<any> {
    return this.http.get(`${this.base}/api/inventario/resumen-stock-mensual/`, {
      params: new HttpParams().set('meses', meses)
    });
  }
}
