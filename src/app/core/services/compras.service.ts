import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

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

  getProveedor(id: number): Observable<any> {
    return this.http.get(`${this.base}/api/compras/proveedores/${id}/`);
  }

  crearProveedor(data: any): Observable<any> {
    return this.http.post(`${this.base}/api/compras/proveedores/`, data);
  }

  actualizarProveedor(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/api/compras/proveedores/${id}/`, data);
  }

  eliminarProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/compras/proveedores/${id}/`);
  }

  getCatalogoProveedorArticulos(proveedorId: number): Observable<any> {
    return this.http.get(`${this.base}/api/compras/proveedores-articulos/`, {
      params: new HttpParams().set('proveedor_id', proveedorId)
    });
  }

  agregarArticuloProveedor(data: { proveedor: number; articulo: number; precio_unitario: number }): Observable<any> {
    return this.http.post(`${this.base}/api/compras/proveedores-articulos/`, data);
  }

  actualizarPrecioArticulo(id: number, precio_unitario: number): Observable<any> {
    return this.http.put(`${this.base}/api/compras/proveedores-articulos/${id}/`, { precio_unitario });
  }

  quitarArticuloProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/compras/proveedores-articulos/${id}/`);
  }

  cotizarArticulo(articuloId: number): Observable<any> {
    return this.http.get(`${this.base}/api/compras/cotizador/`, {
      params: new HttpParams().set('articulo_id', articuloId)
    });
  }

  catalogoProveedor(proveedorId: number): Observable<any> {
    return this.http.get(`${this.base}/api/compras/cotizador/`, {
      params: new HttpParams().set('proveedor_id', proveedorId)
    });
  }

  cotizarLista(ids: number[]): Observable<any> {
    return this.http.get(`${this.base}/api/compras/cotizador/`, {
      params: new HttpParams().set('articulos', ids.join(','))
    });
  }
}
