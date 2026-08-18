// src/app/core/services/pricing.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CostosConfigPayload {
  name: string;
  overhead_pct: number;
  import_cost_pct: number;
  tax_pct: number;
  margin_pct: number;
}

/** Payload para guardar UN snapshot. Los valores ya vienen calculados
 * desde el frontend — el backend solo inserta, no recalcula nada. */
export interface PriceSnapshotPayload {
  quantity: number;
  base_unit_cost: number;
  calculated_total: number;
  final_unit_price: number;
  final_total_value: number;
  breakdown?: Record<string, any>;
  // string = nombre de una config ya existente
  // objeto = el backend la crea/actualiza en el mismo insert
  config?: string | CostosConfigPayload;
  note?: string;
}

/** Un item dentro de un guardado bulk: igual que PriceSnapshotPayload
 * pero identificando a qué producto pertenece. */
export interface BulkSaveItemPayload {
  producto_id: number;
  quantity: number;
  base_unit_cost: number;
  calculated_total: number;
  final_unit_price: number;
  final_total_value: number;
  breakdown?: Record<string, any>;
}

export interface BulkSavePayload {
  items: BulkSaveItemPayload[];
  // config y note se aplican a TODOS los items del batch
  config?: string | CostosConfigPayload;
  note?: string;
}

@Injectable({ providedIn: 'root' })
export class PricingService {
  private BASE_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ------------------ helpers ------------------

  private parseNumber(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    let s = String(value).trim();
    const hasComma = s.indexOf(',') >= 0;
    const hasDot = s.indexOf('.') >= 0;
    if (hasComma && hasDot) {
      const lastComma = s.lastIndexOf(',');
      const lastDot = s.lastIndexOf('.');
      if (lastComma > lastDot) s = s.replace(/\./g, '').replace(/,/g, '.');
      else s = s.replace(/,/g, '');
    } else if (hasComma && !hasDot) {
      s = s.replace(/,/g, '.');
    } else {
      s = s.replace(/\s+/g, '');
    }
    s = s.replace(/[^0-9\.\-]/g, '');
    const n = Number(s);
    if (!isNaN(n) && Number.isFinite(n)) return n;
    const m = s.match(/-?\d+(\.\d+)?/);
    if (m) return Number(m[0]);
    return 0;
  }

  private tryParseJson(raw: any): any {
    if (raw === null || raw === undefined) return raw;
    if (typeof raw === 'object') return raw;
    if (typeof raw !== 'string') return raw;
    const s = raw.trim();
    try {
      return JSON.parse(s);
    } catch (e) {
      // fallback: replace single quotes with double quotes and try again (simple heuristic)
      if (s.startsWith('{') || s.startsWith('[')) {
        try {
          return JSON.parse(s.replace(/'/g, '"'));
        } catch (e2) {
          // ignore and return original string
        }
      }
      return raw;
    }
  }

  private normalizeArticulo(p: any): any {
    if (!p || typeof p !== 'object') return p || {};

    const pick = (cands: string[]) => {
      for (const k of cands) {
        if (p[k] !== undefined && p[k] !== null) return p[k];
      }
      return undefined;
    };

    const codigo = pick(['codigo', 'sku', 'ref', 'referencia', 'code']) ?? (p.id ? String(p.id) : '');
    const descripcion = pick(['descripcion', 'nombre', 'title', 'titulo', 'name']) ?? '';
    const cantidad_existencia = this.parseNumber(
      p['cantidad_existencia'] ??
        p['stock_actual'] ??
        p['stock'] ??
        p['cantidad'] ??
        p['qty'] ??
        pick(['cantidad_existencia', 'stock_actual', 'stock', 'cantidad', 'qty'])
    );

    const costo_unitario = this.parseNumber(
      p['costo_unitario'] ?? p['unit_cost'] ?? p['cost'] ?? pick(['costo_unitario', 'unit_cost', 'cost', 'precio_base', 'costo'])
    );

    const import_cost_total = this.parseNumber(
      p['import_cost_total'] ?? p['import_total'] ?? p['import_cost'] ?? pick(['import_cost_total', 'import_total', 'import_cost'])
    );

    const overhead_raw = p['overhead'] ?? p['overhead_pct'] ?? p['costos_indirectos'] ?? pick(['overhead', 'overhead_pct', 'costos_indirectos', 'overhead_value']);
    const overhead = this.parseNumber(overhead_raw);

    let tax = p['tax_pct'] ?? p['tax'] ?? pick(['tax_pct', 'tax', 'impuesto_pct', 'impuesto']);
    let margin = p['margin_pct'] ?? p['margin'] ?? pick(['margin_pct', 'margin', 'margen_pct', 'margen']);

    // Normalizar 0.19 -> 19 para la UI (si prefieres 0.19, elimina la multiplicación)
    if (typeof tax === 'number' && Math.abs(tax) > 0 && Math.abs(tax) < 1) tax = tax * 100;
    if (typeof margin === 'number' && Math.abs(margin) > 0 && Math.abs(margin) < 1) margin = margin * 100;

    tax = tax === undefined || tax === null ? 19 : this.parseNumber(tax);
    margin = margin === undefined || margin === null ? 15 : this.parseNumber(margin);

    const precio_unitario_final_raw = p['precio_unitario_final'] ?? p['final_unit_price'] ?? pick(['precio_unitario_final', 'final_unit_price', 'precio_unitario']);
    const precio_unitario_final = precio_unitario_final_raw !== undefined && precio_unitario_final_raw !== null ? this.parseNumber(precio_unitario_final_raw) : undefined;

    const precio_total_raw = p['precio_total'] ?? p['final_total_value'] ?? pick(['precio_total', 'final_total_value', 'total_price']);
    const precio_total = precio_total_raw !== undefined && precio_total_raw !== null ? this.parseNumber(precio_total_raw) : undefined;

    let breakdown = p['breakdown'] ?? p['breakdawn'] ?? p['breakdown_data'] ?? pick(['breakdown', 'breakdawn', 'breakdown_data']);
    breakdown = this.tryParseJson(breakdown);

    // Si breakdown es objeto simple, convertir strings numéricos a numbers
    if (breakdown && typeof breakdown === 'object' && !Array.isArray(breakdown)) {
      Object.keys(breakdown).forEach(k => {
        const v = breakdown[k];
        if (typeof v === 'string') {
          if (/^[\d\.\,\- ]+$/.test(v.trim())) {
            breakdown[k] = this.parseNumber(v);
          }
        }
      });
    }

    return {
      ...p,
      id: p.id,
      codigo,
      descripcion,
      cantidad_existencia,
      costo_unitario,
      import_cost_total,
      overhead_pct: overhead, // mantenemos la key que usa el template/UI
      tax_pct: this.parseNumber(tax),
      margin_pct: this.parseNumber(margin),
      precio_unitario_final,
      precio_total,
      breakdown,
      // created_at si existe queda en p['created_at'] etc., no lo normalizamos aquí
    };
  }

  // ------------------ API methods ------------------

  /**
   * Lista base de artículos (id, codigo, descripcion, cantidad_existencia)
   * para que el frontend haga sus propios cálculos de precio.
   * Devuelve items normalizados (números, breakdown parseado, tax/margin listos para UI).
   */
  listArticulos(): Observable<any[]> {
    return this.http.get<any>(`${this.BASE_URL}/api/costos/articulos/`).pipe(
      map((res: any) => {
        let arr: any[] = [];
        if (Array.isArray(res)) arr = res;
        else if (res && Array.isArray(res.results)) arr = res.results;
        else if (res && Array.isArray(res.data)) arr = res.data;
        else if (res && Array.isArray(res.articulos)) arr = res.articulos;
        else if (res && Array.isArray(res.items)) arr = res.items;
        else if (res && res.items && Array.isArray(res.items)) arr = res.items;
        // normalizar cada item
        return arr.map(item => this.normalizeArticulo(item));
      }),
      catchError(err => {
        console.error('Error fetching articulos', err);
        // devolver array vacío para que el componente lo maneje sin romper
        return of([] as any[]);
      })
    );
  }

  /**
   * Guarda UN snapshot de precio ya calculado en el frontend.
   * POST /api/costos/compute/<producto_id>/save/
   */
  saveSingle(productId: number, payload: PriceSnapshotPayload): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/api/costos/compute/${productId}/save/`, payload);
  }

  /**
   * Guarda VARIOS snapshots ya calculados en el frontend, en un solo
   * request. Cada item de `payload.items` trae sus propios valores
   * calculados — el backend inserta uno por uno tal cual se los mandas.
   * POST /api/costos/compute/bulk/save/
   */
  bulkSave(payload: BulkSavePayload): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/api/costos/compute/bulk/save/`, payload);
  }

  /**
   * Historial de snapshots guardados para un artículo (últimos 50).
   * GET /api/costos/pricing/snapshots/<producto_id>/
   */
  getSnapshots(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/api/costos/pricing/snapshots/${productId}/`);
  }
}