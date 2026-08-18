// src/app/features/inventario/price-calculator/price-calculator.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  FormsModule,
  Validators,
  AbstractControl
} from '@angular/forms';

import { Subject, of, firstValueFrom, Subscription } from 'rxjs';
import { catchError, debounceTime } from 'rxjs/operators';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

import {
  PricingService,
  PriceSnapshotPayload,
  BulkSaveItemPayload,
  BulkSavePayload
} from '../../../core/services/pricing.service';

@Component({
  selector: 'app-price-calculator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    /* Material */
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './price-calculator.component.html',
  styleUrls: ['./price-calculator.component.css']
})
export class PriceCalculatorComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private pricing = inject(PricingService);
  private cd = inject(ChangeDetectorRef);

  form: FormGroup;
  get filas(): FormArray { return this.form.get('filas') as FormArray; }

  loading = false;
  guardando = false;
  errorGlobal: string | null = null;

  productosRaw: any[] = [];
  lastFiltered: any[] = [];
  searchText = '';
  minQty: number | null = null;

  pageSize = 10;
  currentPage = 0;

  sortKey: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  private destroy$ = new Subject<void>();
  private rowSubs: Subscription[] = [];

  // Set para filas que están recalculando (spinner por fila)
  recalculatingRows = new Set<number>();
  // Flag global para "recalcular todas"
  recalculatingAll = false;

  constructor() {
    this.form = this.fb.group({ filas: this.fb.array<FormGroup>([]) });
  }

  ngOnInit(): void {
    this.cargarProductos().catch(e => {
      console.warn('cargarProductos error (ngOnInit):', e);
    });
  }

  ngOnDestroy(): void {
    this.rowSubs.forEach(s => s.unsubscribe());
    this.rowSubs = [];
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------- util ----------
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

  visibleControls(): FormGroup[] {
    return (this.filas && this.filas.controls) ? (this.filas.controls as FormGroup[]) : [];
  }

  getStartIndex(): number { return this.currentPage * this.pageSize; }

  // ---------- sorting ----------
  sort(key: string) {
    if (this.sortKey === key) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortKey = key; this.sortDirection = 'asc'; }
    const dir = this.sortDirection;

    const valueFor = (p: any, k: string): any => {
      if (!p) return '';
      if (k === 'codigo') return p.codigo ?? p.code ?? p.sku ?? p.id ?? '';
      if (k === 'descripcion') return p.descripcion ?? p.nombre ?? p.name ?? p.title ?? '';
      if (k === 'cantidad_existencia' || k === 'stock' || k === 'cantidad') {
        return this.parseNumber(p.stock_actual ?? p.cantidad_existencia ?? p.stock ?? p.qty ?? 0);
      }
      return p[k] ?? p[k.toLowerCase()] ?? p[k.toUpperCase()] ?? '';
    };

    this.productosRaw.sort((a: any, b: any) => {
      const va = valueFor(a, key);
      const vb = valueFor(b, key);
      const na = Number(va);
      const nb = Number(vb);
      if (!isNaN(na) && !isNaN(nb)) return dir === 'asc' ? na - nb : nb - na;
      const sa = String(va ?? '').toLowerCase();
      const sb = String(vb ?? '').toLowerCase();
      return dir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });

    this.rebuildFormFromFiltered();
  }

  // ---------- carga ----------
  async cargarProductos(): Promise<void> {
    this.loading = true;
    this.errorGlobal = null;
    try { this.cd.detectChanges(); } catch (e) { /* safe */ }

    const tryParseJson = (raw: any): any => {
      if (raw === null || raw === undefined) return raw;
      if (typeof raw === 'object') return raw;
      if (typeof raw !== 'string') return raw;
      const s = raw.trim();
      try { return JSON.parse(s); } catch (e) {
        if (s.startsWith('{') || s.startsWith('[')) {
          const alt = s.replace(/'/g, '"');
          try { return JSON.parse(alt); } catch (e2) { /* ignore */ }
        }
        return raw;
      }
    };

    const normalizeArticulo = (p: any): any => {
      const pick = (cands: string[]) => {
        for (const k of cands) { if (p && Object.prototype.hasOwnProperty.call(p, k)) return p[k]; }
        return undefined;
      };

      const codigo = pick(['codigo', 'sku', 'ref', 'referencia', 'code', 'id']) ?? '';
      const descripcion = pick(['descripcion', 'nombre', 'title', 'titulo', 'name']) ?? '';
      const cantidad_existencia = this.parseNumber(p['cantidad_existencia'] ?? p['stock_actual'] ?? p['stock'] ?? p['cantidad'] ?? p['qty'] ?? pick(['cantidad_existencia', 'stock_actual', 'stock', 'cantidad', 'qty']));
      const costo_unitario_raw = pick(['costo_unitario', 'unit_cost', 'cost', 'precio_base', 'costo']) ?? 0;
      const import_cost_raw = pick(['import_cost_total', 'import_total', 'import_cost', 'costo_importacion']) ?? 0;
      const overhead_raw = pick(['overhead', 'overhead_pct', 'costos_indirectos', 'overhead_value']) ?? 0;
      const tax_raw = pick(['tax_pct', 'tax', 'impuesto_pct', 'impuesto']) ?? null;
      const margin_raw = pick(['margin_pct', 'margin', 'margen_pct', 'margen']) ?? null;
      const precio_unitario_final_raw = pick(['precio_unitario_final', 'final_unit_price', 'precio_unitario']) ?? null;
      const precio_total_raw = pick(['precio_total', 'final_total_value', 'total_price']) ?? null;
      const breakdown_raw = pick(['breakdown', 'breakdawn', 'breakdown_data', 'breakdown_json']) ?? null;
      const created_at = pick(['created_at', 'computed_at', 'snapshot_computed_at', 'fecha_creacion']) ?? null;

      const costo_unitario = this.parseNumber(costo_unitario_raw);
      const import_cost_total = this.parseNumber(import_cost_raw);
      const overhead = this.parseNumber(overhead_raw);

      let tax_pct_num: number | undefined;
      if (tax_raw === null || tax_raw === undefined) { tax_pct_num = undefined; }
      else {
        tax_pct_num = this.parseNumber(tax_raw);
        if (tax_pct_num !== 0 && Math.abs(tax_pct_num) > 0 && Math.abs(tax_pct_num) < 1) {
          tax_pct_num = tax_pct_num * 100;
        }
      }
      if (tax_pct_num === undefined || tax_pct_num === 0 || !Number.isFinite(tax_pct_num)) {
        tax_pct_num = 19;
      }

      let margin_pct_num: number | undefined;
      if (margin_raw === null || margin_raw === undefined) { margin_pct_num = undefined; }
      else {
        margin_pct_num = this.parseNumber(margin_raw);
        if (margin_pct_num !== 0 && Math.abs(margin_pct_num) > 0 && Math.abs(margin_pct_num) < 1) {
          margin_pct_num = margin_pct_num * 100;
        }
      }
      if (margin_pct_num === undefined || margin_pct_num === 0 || !Number.isFinite(margin_pct_num)) {
        margin_pct_num = 15;
      }

      const precio_unitario_final = precio_unitario_final_raw !== null && precio_unitario_final_raw !== undefined ? this.parseNumber(precio_unitario_final_raw) : undefined;
      const precio_total = precio_total_raw !== null && precio_total_raw !== undefined ? this.parseNumber(precio_total_raw) : undefined;

      let breakdown: any = breakdown_raw;
      if (breakdown_raw !== null && breakdown_raw !== undefined) {
        breakdown = tryParseJson(breakdown_raw);
        if (typeof breakdown === 'string' && breakdown.startsWith('{')) {
          try { breakdown = JSON.parse(breakdown.replace(/'/g, '"')); } catch (e) { /* keep as string */ }
        }
      } else { breakdown = null; }

      if (breakdown && typeof breakdown === 'object' && !Array.isArray(breakdown)) {
        Object.keys(breakdown).forEach(k => {
          const v = breakdown[k];
          if (typeof v === 'string') {
            const maybeNum = this.parseNumber(v);
            if (/^[\d\.\,\- ]+$/.test(v) || v.trim() === '0') breakdown[k] = maybeNum;
          }
        });
      }

      // ---------- DERIVAR CAMPOS DESDE breakdown (si está presente) ----------
      let importCostTotalFromBreakdown: number | undefined = undefined;
      let overheadFromBreakdown: number | undefined = undefined;
      let taxPctFromBreakdown: number | undefined = undefined;
      let marginPctFromBreakdown: number | undefined = undefined;

      if (breakdown && typeof breakdown === 'object') {
        const importPerUnit = this.parseNumber(breakdown['import_cost_per_unit'] ?? breakdown['import_per_unit'] ?? breakdown['import_cost'] ?? breakdown['import_cost_per_unit'] ?? 0);
        const importTotalCandidate = this.parseNumber(breakdown['import_cost_total'] ?? breakdown['import_total'] ?? breakdown['import_cost_total'] ?? 0);
        const overheadCandidate = this.parseNumber(breakdown['overhead'] ?? breakdown['overhead_per_unit'] ?? breakdown['overhead_value'] ?? 0);
        const taxAbs = this.parseNumber(breakdown['tax'] ?? breakdown['tax_amount'] ?? 0);
        const marginAbs = this.parseNumber(breakdown['margin'] ?? breakdown['margin_amount'] ?? 0);
        const subtotalWithOverhead = this.parseNumber(breakdown['subtotal_with_overhead'] ?? breakdown['subtotal_with_tax'] ?? breakdown['subtotal'] ?? 0);
        const subtotalWithTax = this.parseNumber(breakdown['subtotal_with_tax'] ?? breakdown['subtotal_with_overhead'] ?? breakdown['subtotal'] ?? 0);

        if (importTotalCandidate && importTotalCandidate !== 0) {
          importCostTotalFromBreakdown = importTotalCandidate;
        } else if (importPerUnit && importPerUnit !== 0) {
          importCostTotalFromBreakdown = importPerUnit * cantidad_existencia;
        } else {
          importCostTotalFromBreakdown = undefined;
        }

        if (overheadCandidate && overheadCandidate !== 0) {
          overheadFromBreakdown = overheadCandidate;
        } else {
          overheadFromBreakdown = undefined;
        }

        if (taxAbs && subtotalWithOverhead && subtotalWithOverhead > 0) {
          taxPctFromBreakdown = (taxAbs / subtotalWithOverhead) * 100;
        }

        if (marginAbs && subtotalWithTax && subtotalWithTax > 0) {
          marginPctFromBreakdown = (marginAbs / subtotalWithTax) * 100;
        }
      }

      if (!Number.isFinite(taxPctFromBreakdown) || taxPctFromBreakdown === 0) taxPctFromBreakdown = undefined;
      if (!Number.isFinite(marginPctFromBreakdown) || marginPctFromBreakdown === 0) marginPctFromBreakdown = undefined;

      const finalImportCostTotal = importCostTotalFromBreakdown ?? import_cost_total;
      const finalOverhead = overheadFromBreakdown ?? overhead;
      // ---- REDONDEAR aquí para que UI reciba enteros ----
      const finalTaxPct = Math.round((taxPctFromBreakdown ?? tax_pct_num ?? 19));
      const finalMarginPct = Math.round((marginPctFromBreakdown ?? margin_pct_num ?? 15));

      return {
        ...p,
        id: p.id,
        codigo,
        descripcion,
        cantidad_existencia,
        costo_unitario,
        import_cost_total: finalImportCostTotal,
        overhead_pct: finalOverhead,
        tax_pct: finalTaxPct,
        margin_pct: finalMarginPct,
        precio_unitario_final,
        precio_total,
        breakdown,
        created_at
      };
    };

    try {
      const list: any = await firstValueFrom(this.pricing.listArticulos());
      let normalized: any[] = [];
      if (Array.isArray(list)) normalized = list;
      else if (list && Array.isArray(list.results)) normalized = list.results;
      else if (list && Array.isArray(list.data)) normalized = list.data;
      else if (list && Array.isArray(list.articulos)) normalized = list.articulos;
      else normalized = [];

      console.log('API raw list:', list);
      const sample = Array.isArray(list) ? list[0] : (list && (list.results || list.data || list.articulos) ? (list.results || list.data || list.articulos)[0] : null);
      console.log('Sample raw item:', sample);

      this.productosRaw = normalized.map((p: any) => normalizeArticulo(p));

      if (this.sortKey) this.sort(this.sortKey); else this.rebuildFormFromFiltered();

    } catch (err: any) {
      this.errorGlobal = 'Error cargando productos: ' + (err?.message || JSON.stringify(err));
      this.productosRaw = [];
      this.rebuildFormFromFiltered();
    } finally {
      this.loading = false;
      try { this.cd.detectChanges(); } catch (e) { /* safe */ }
    }
  }

  // ---------- filtros + paginación ----------
  aplicarFiltros() {
    const txt = (this.searchText || '').trim().toLowerCase();
    const minQ = (this.minQty === null || this.minQty === undefined) ? null : Number(this.minQty);
    return this.productosRaw.filter(p => {
      const codigo = String(p.codigo ?? p.code ?? p.sku ?? p.id ?? '').toLowerCase();
      const descripcion = String(p.descripcion ?? p.nombre ?? p.name ?? p.title ?? '').toLowerCase();
      const stock = this.parseNumber(p.stock_actual ?? p.cantidad_existencia ?? p.stock ?? p.qty ?? 0);
      const matchText = (codigo + ' ' + descripcion).includes(txt);
      const matchQty = (minQ === null) ? true : (stock >= minQ);
      return matchText && matchQty;
    });
  }

  rebuildFormFromFiltered() {
    this.rowSubs.forEach(s => s.unsubscribe());
    this.rowSubs = [];

    const filtered = this.aplicarFiltros();
    this.lastFiltered = filtered;

    const total = filtered.length;
    const maxPage = Math.max(0, Math.ceil(total / this.pageSize) - 1);
    if (this.currentPage > maxPage) this.currentPage = maxPage;
    if (this.currentPage < 0) this.currentPage = 0;

    const start = this.currentPage * this.pageSize;
    const pageSlice = filtered.slice(start, start + this.pageSize);

    const newArray = this.fb.array<FormGroup>([]);

    for (const prod of pageSlice) {
      const fg = this.crearFila(prod) as FormGroup;
      newArray.push(fg);
    }

    this.form.setControl('filas', newArray);

    try { this.cd.detectChanges(); } catch (e) { /* safe */ }
  }

  onSearchChange(value: string) {
    this.searchText = value || '';
    this.currentPage = 0;
    this.rebuildFormFromFiltered();
  }

  onMinQtyChange(value: string) {
    if (value === '' || value === null || value === undefined) this.minQty = null;
    else {
      const parsed = this.parseNumber(value);
      this.minQty = isNaN(parsed) ? null : parsed;
    }
    this.currentPage = 0;
    this.rebuildFormFromFiltered();
  }

  onPageSizeChange(v: string | number) {
    const allowed = [5, 10, 20, 50];
    const n = Number(v);
    const newSize = allowed.includes(n) ? n : 10;
    const oldStart = this.currentPage * this.pageSize;
    this.pageSize = newSize;
    this.currentPage = Math.floor(oldStart / this.pageSize);
    this.rebuildFormFromFiltered();
  }

  onMatPage(ev: PageEvent) {
    const newSize = Number(ev.pageSize) || this.pageSize;
    const newPage = Math.max(0, Number(ev.pageIndex) || 0);

    if (newSize !== this.pageSize) {
      const oldStart = this.currentPage * this.pageSize;
      this.pageSize = newSize;
      this.currentPage = Math.floor(oldStart / this.pageSize);
    } else {
      this.currentPage = newPage;
    }

    this.rebuildFormFromFiltered();
  }

  goToPage(page: number) {
    const filtered = this.aplicarFiltros();
    const maxPage = Math.max(0, Math.ceil(filtered.length / this.pageSize) - 1);
    this.currentPage = Math.max(0, Math.min(maxPage, page));
    this.rebuildFormFromFiltered();
  }

  // ---------- crear fila / calculos ----------
  crearFila(producto?: any): FormGroup {
    const map = {
      id: producto?.id ?? producto?.pk ?? producto?.article_id ?? null,
      codigo: producto?.codigo ?? producto?.code ?? producto?.sku ?? (producto?.id ? String(producto.id) : ''),
      descripcion: producto?.descripcion ?? producto?.nombre ?? producto?.name ?? producto?.title ?? '',
      cantidad_existencia: this.parseNumber(producto?.stock_actual ?? producto?.cantidad_existencia ?? producto?.stock ?? producto?.qty ?? 0),
      costo_unitario: this.parseNumber(producto?.costo_unitario ?? producto?.unit_cost ?? producto?.cost ?? 0)
    };

    const import_cost_total_init = producto?.import_cost_total ?? producto?.import_cost ?? 0;
    const overhead_init = producto?.overhead_pct ?? producto?.overhead ?? 0;
    // REDONDEO para UI: mostramos enteros en tax/margin
    const tax_init = Math.round(this.parseNumber(producto?.tax_pct ?? producto?.tax ?? 19));
    const margin_init = Math.round(this.parseNumber(producto?.margin_pct ?? producto?.margin ?? 15));
    const precio_unitario_final_init = (producto?.precio_unitario_final !== undefined && producto?.precio_unitario_final !== null) ? producto.precio_unitario_final : undefined;
    const precio_total_init = (producto?.precio_total !== undefined && producto?.precio_total !== null) ? producto.precio_total : undefined;
    const breakdown_init = producto?.breakdown ?? null;

    const fg = this.fb.group({
      articulo_id: [map.id, Validators.required],
      codigo: [map.codigo],
      descripcion: [map.descripcion],
      cantidad_existencia: [map.cantidad_existencia],
      cantidad_a_calcular: [map.cantidad_existencia, [Validators.min(0)]],
      costo_unitario: [map.costo_unitario, [Validators.min(0)]],
      import_cost_total: [this.parseNumber(import_cost_total_init), [Validators.min(0)]],
      overhead_pct: [this.parseNumber(overhead_init), [Validators.min(0)]],
      tax_pct: [tax_init, [Validators.min(0)]],
      margin_pct: [margin_init, [Validators.min(0)]],
      precio_unitario_final: [{ value: precio_unitario_final_init ?? 0, disabled: true }],
      precio_total: [{ value: precio_total_init ?? 0, disabled: true }],
      breakdown: [{ value: breakdown_init, disabled: true }]
    });

    if (precio_unitario_final_init === undefined || precio_unitario_final_init === null) {
      this.recalcularFila(fg);
    } else {
      fg.get('precio_unitario_final')?.setValue(this.parseNumber(precio_unitario_final_init), { emitEvent: false });
      fg.get('precio_total')?.setValue(this.parseNumber(precio_total_init ?? 0), { emitEvent: false });
      fg.get('breakdown')?.setValue(breakdown_init ?? null, { emitEvent: false });
    }

    const campos = ['cantidad_a_calcular', 'costo_unitario', 'import_cost_total', 'overhead_pct', 'tax_pct', 'margin_pct'];
    campos.forEach(key => {
      const ctrl = fg.get(key);
      if (ctrl) {
        const sub = (ctrl.valueChanges as any).pipe(debounceTime(160)).subscribe(() => {
          this.recalcularFila(fg);
        });
        this.rowSubs.push(sub);
      }
    });

    return fg;
  }

  private normPct(value: number): number {
    if (!Number.isFinite(value) || value === null || value === undefined) return 0;
    if (value >= 1) return value / 100;
    return value;
  }

  recalcularFila(control: AbstractControl | FormGroup) {
    const fg = (control as FormGroup);
    if (!fg || !fg.get) return;
    try {
      const cantidad = Number(fg.get('cantidad_a_calcular')?.value) || 0;
      const costoUnit = Number(fg.get('costo_unitario')?.value) || 0;
      const importTotal = Number(fg.get('import_cost_total')?.value) || 0;

      let overheadValue = Number(fg.get('overhead_pct')?.value) || 0;
      let taxPct = Number(fg.get('tax_pct')?.value) || 0;
      let marginPct = Number(fg.get('margin_pct')?.value) || 0;

      taxPct = this.normPct(taxPct);
      marginPct = this.normPct(marginPct);

      const importPerUnit = (cantidad > 0) ? (importTotal / cantidad) : 0;

      const subtotal = costoUnit + importPerUnit;
      const overhead = Number(overheadValue) || 0;
      const subtotalWithOverhead = subtotal + overhead;
      const tax = subtotalWithOverhead * taxPct;
      const subtotalWithTax = subtotalWithOverhead + tax;
      const margin = subtotalWithTax * marginPct;

      const finalUnitPrice = this.round(subtotalWithTax + margin, 2);
      const finalTotal = this.round(finalUnitPrice * cantidad, 2);

      const breakdown = {
        base_unit_cost: this.round(costoUnit, 4),
        import_cost_per_unit: this.round(importPerUnit, 4),
        overhead: this.round(overhead, 4),
        tax: this.round(tax, 4),
        margin: this.round(margin, 4),
        subtotal: this.round(subtotal, 4),
        subtotal_with_overhead: this.round(subtotalWithOverhead, 4),
        subtotal_with_tax: this.round(subtotalWithTax, 4),
      };

      fg.get('precio_unitario_final')?.setValue(finalUnitPrice, { emitEvent: false });
      fg.get('precio_total')?.setValue(finalTotal, { emitEvent: false });
      fg.get('breakdown')?.setValue(breakdown, { emitEvent: false });
    } catch (e) {
      console.error('Error recalc fila', e);
    }
  }

  round(v: number, decimals = 2) {
    const p = Math.pow(10, decimals);
    return Math.round((v + Number.EPSILON) * p) / p;
  }

  // ---------- CAMBIO: recalcularTodas ahora admite resetToZero (por defecto true)
  async recalcularTodas(resetToZero = true) {
    // evita reentrar
    if (this.recalculatingAll || this.guardando) return;

    this.recalculatingAll = true;
    try { this.cd.detectChanges(); } catch (e) { /* safe */ }

    // dejemos que el spinner del botón se pinte
    await new Promise(res => setTimeout(res, 80));

    // NOTA: excluimos 'cantidad_a_calcular' del reset porque
    // el requerimiento era "poner a 0 todo menos la cantidad a calcular".
    const camposReset = ['costo_unitario', 'import_cost_total', 'overhead_pct', 'tax_pct', 'margin_pct'];

    (this.filas.controls as FormGroup[]).forEach((fg, idx) => {
      try {
        if (resetToZero) {
          camposReset.forEach(k => {
            const ctrl = fg.get(k);
            if (ctrl) {
              // no emitimos para evitar cascadas de recalculo por cada set
              ctrl.setValue(0, { emitEvent: false });
            }
          });
        }
        // siempre recalculamos la fila (con valores actuales o con ceros si resetToZero=true)
        this.recalcularFila(fg);
      } catch (e) {
        console.warn('Error resetting/recalculating fila in recalcularTodas:', e);
      }
    });

    try { this.cd.detectChanges(); } catch (e) { /* safe */ }

    // pequeño delay para que la UI muestre resultados antes de quitar el spinner
    await new Promise(res => setTimeout(res, 50));

    this.recalculatingAll = false;
    try { this.cd.detectChanges(); } catch (e) { /* safe */ }
  }

  recalcularIndividual(index: number, resetToZero = false) {
    const fg = this.filas.at(index) as FormGroup | null;
    if (!fg) return;
    try {
      if (resetToZero) {
        // igual que en todas: NO resetear cantidad_a_calcular
        const camposReset = ['costo_unitario', 'import_cost_total', 'overhead_pct', 'tax_pct', 'margin_pct'];
        camposReset.forEach(k => {
          const ctrl = fg.get(k);
          if (ctrl) ctrl.setValue(0, { emitEvent: false });
        });
      }
      this.recalcularFila(fg);
    } catch (e) {
      console.warn('Error en recalcularIndividual:', e);
    } finally {
      try { this.cd.detectChanges(); } catch (e) { /* safe */ }
    }
  }

  onRecalcularFila(index: number, fg: FormGroup) {
    const key = this.getStartIndex() + index;
    if (this.recalculatingRows.has(key) || this.guardando) return;

    this.recalculatingRows.add(key);
    try { this.cd.detectChanges(); } catch (e) { /* safe */ }

    setTimeout(() => {
      try {
        // mostramos lienzo en cero antes del cálculo (no tocamos cantidad_a_calcular)
        this.recalcularIndividual(index, true);
      } finally {
        this.recalculatingRows.delete(key);
        try { this.cd.detectChanges(); } catch (e) { /* safe */ }
      }
    }, 120);
  }

  // ---------- NUEVO método: forzar redondeo en blur (tax/margin)
  formatPct(fg: FormGroup, key: 'tax_pct' | 'margin_pct') {
    if (!fg || !fg.get) return;
    const raw = fg.get(key)?.value;
    const n = Math.round(this.parseNumber(raw));
    // emitEvent = true para que la suscripción existente (valueChanges) rehaga el recálculo
    fg.get(key)?.setValue(n, { emitEvent: true });
  }

  private buildPayloadFromFila(fg: FormGroup): BulkSaveItemPayload {
    const artId = Number(fg.get('articulo_id')?.value ?? fg.get('codigo')?.value);
    const qty = Number(fg.get('cantidad_a_calcular')?.value) || 0;
    const costoUnit = Number(fg.get('costo_unitario')?.value) || 0;
    const finalUnit = Number(fg.get('precio_unitario_final')?.value) || 0;
    const finalTotal = Number(fg.get('precio_total')?.value) || this.round(finalUnit * qty, 2);
    const calculatedTotal = this.round(costoUnit * qty, 2);
    const breakdown = fg.get('breakdown')?.value ?? {};

    return {
      producto_id: artId,
      quantity: qty,
      base_unit_cost: costoUnit,
      calculated_total: calculatedTotal,
      final_unit_price: finalUnit,
      final_total_value: finalTotal,
      breakdown,
    };
  }

  async guardarFila(index: number) {
    const fg = this.filas.at(index) as FormGroup;
    if (!fg) return;
    if (!fg.valid) { fg.markAllAsTouched(); return; }
    this.recalcularFila(fg);

    const payloadObj = this.buildPayloadFromFila(fg) as any;
    const producto_id = payloadObj.producto_id;
    const payload = { ...payloadObj };
    delete (payload as any).producto_id;

    if (!producto_id) {
      this.errorGlobal = 'La fila no tiene un articulo_id válido.';
      return;
    }

    try {
      this.guardando = true;
      this.errorGlobal = null;
      try { this.cd.detectChanges(); } catch (e) { /* safe */ }

      const saved: any = await firstValueFrom(
        this.pricing.saveSingle(producto_id, payload as PriceSnapshotPayload).pipe(
          catchError(e => {
            this.errorGlobal = 'Error guardando fila: ' + (e?.message || JSON.stringify(e));
            return of(null);
          })
        )
      );

      if (!saved) return;

      try {
        const finalPrice = saved.final_price ?? saved.final_unit_price ?? saved.finalPrice ?? null;
        const finalTotal = saved.final_total_value ?? saved.final_total ?? saved.finalTotal ?? null;
        const breakdown = saved.breakdown ?? saved.breakdown_json ?? null;

        if (finalPrice !== undefined && finalPrice !== null) {
          fg.get('precio_unitario_final')?.setValue(this.parseNumber(finalPrice), { emitEvent: false });
        }
        if (finalTotal !== undefined && finalTotal !== null) {
          fg.get('precio_total')?.setValue(this.parseNumber(finalTotal), { emitEvent: false });
        }
        if (breakdown !== undefined && breakdown !== null) {
          fg.get('breakdown')?.setValue(breakdown, { emitEvent: false });
        }

      } catch (e) {
        console.warn('No fue posible mapear la respuesta del snapshot en la fila:', e);
      }

      await this.cargarProductos();

    } catch (e: any) {
      this.errorGlobal = 'Error al guardar fila: ' + (e?.message || JSON.stringify(e));
    } finally {
      this.guardando = false;
      try { this.cd.detectChanges(); } catch (e) { /* safe */ }
    }
  }

  async guardarTodos() {
    try {
      this.guardando = true;
      this.errorGlobal = null;
      try { this.cd.detectChanges(); } catch (e) { /* safe */ }

      // aquí: recalculamos *sin* reset por defecto para mantener las cantidades del usuario
      await this.recalcularTodas(false);

      const items: BulkSaveItemPayload[] = this.filas.controls
        .map((ctrl) => this.buildPayloadFromFila(ctrl as FormGroup))
        .filter((item) => !!item.producto_id);

      if (items.length === 0) {
        this.errorGlobal = 'No hay productos para guardar.';
        return null;
      }

      const bulkPayload: BulkSavePayload = { items };

      const res: any = await firstValueFrom(
        this.pricing.bulkSave(bulkPayload).pipe(
          catchError(e => {
            this.errorGlobal = 'Error guardando snapshots: ' + (e?.message || JSON.stringify(e));
            return of(null);
          })
        )
      );

      if (res && (res.saved || Array.isArray(res))) {
        await this.cargarProductos();
      }

      return res;
    } catch (e: any) {
      this.errorGlobal = 'Error guardando: ' + (e?.message || JSON.stringify(e));
      return null;
    } finally {
      this.guardando = false;
      try { this.cd.detectChanges(); } catch (e) { /* safe */ }
    }
  }

  trackByRow(index: number, fg: FormGroup) {
    const id = fg.get('articulo_id')?.value;
    if (id !== null && id !== undefined && id !== '') return id;
    return this.getStartIndex() + index;
  }

  // ---------- display helpers ----------
  get displayStart(): number {
    if (!this.lastFiltered || this.lastFiltered.length === 0) return 0;
    return this.currentPage * this.pageSize + 1;
  }

  get displayEnd(): number {
    if (!this.lastFiltered || this.lastFiltered.length === 0) return 0;
    return Math.min((this.currentPage + 1) * this.pageSize, this.lastFiltered.length);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.lastFiltered.length / this.pageSize));
  }

  get pageLabel(): string {
    return `Página ${this.currentPage + 1} / ${this.totalPages}`;
  }
}