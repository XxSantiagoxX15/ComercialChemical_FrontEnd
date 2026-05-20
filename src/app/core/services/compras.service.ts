import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private http = inject(HttpClient);
  private base = 'http://127.0.0.1:8000';

  getOrdenes(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => {
        if (params[k] !== null && params[k] !== undefined && params[k] !== '') {
          p = p.set(k, params[k]);
        }
      });
    }
    return this.http.get(`${this.base}/api/compras/ordenes/`, { params: p });
  }

  getOrden(id: number): Observable<any> {
    return this.http.get(`${this.base}/api/compras/ordenes/${id}/`);
  }

  crearOrden(data: any): Observable<any> {
    return this.http.post(`${this.base}/api/compras/ordenes/`, data);
  }

  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.base}/api/compras/ordenes/${id}/`, { estado });
  }

  getProveedores(): Observable<any> {
    return this.http.get(`${this.base}/api/compras/proveedores/`);
  }

  cotizarArticulo(articuloId: number): Observable<any> {
    return this.http.get(`${this.base}/api/compras/cotizador/`, {
      params: new HttpParams().set('articulo_id', articuloId)
    });
  }

  catalogoProveedor(nombre: string): Observable<any> {
    return this.http.get(`${this.base}/api/compras/cotizador/`, {
      params: new HttpParams().set('proveedor', nombre)
    });
  }

  cotizarLista(ids: number[]): Observable<any> {
    return this.http.get(`${this.base}/api/compras/cotizador/`, {
      params: new HttpParams().set('articulos', ids.join(','))
    });
  }
}
