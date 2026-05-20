import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { ComprasService } from '../../../core/services/compras.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-cotizador',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    MatProgressSpinnerModule, MatChipsModule, MatDividerModule,
    MatTabsModule, MatTooltipModule, MatTableModule,
  ],
  templateUrl: './cotizador.component.html',
  styleUrl: './cotizador.component.css',
})
export class CotizadorComponent implements OnInit {
  private comprasSvc   = inject(ComprasService);
  private inventarioSvc = inject(InventarioService);

  // ── Proveedores ───────────────────────────────────────────────────────────
  proveedores: any[]         = [];
  loadingProveedores         = false;
  proveedorSeleccionado: any = null;
  catalogoProveedor: any[]   = [];
  loadingCatalogo            = false;

  // ── Cotizador por artículo ────────────────────────────────────────────────
  articuloSearch             = '';
  articuloSeleccionado: any  = null;
  articulosFiltrados: any[]  = [];
  cotizacion: any            = null;
  loadingCotizacion          = false;
  private searchSubject      = new Subject<string>();

  // ── Columnas tablas ───────────────────────────────────────────────────────
  colsPrecios    = ['proveedor', 'precio_unitario', 'cantidad_comprada', 'ultima_compra', 'accion'];
  colsCatalogo   = ['codigo', 'descripcion', 'precio_unitario', 'cantidad_comprada', 'ultima_compra'];
  colsProveedores = ['nombre', 'num_articulos', 'total_comprado', 'accion'];

  ngOnInit() {
    this.cargarProveedores();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q.length >= 2
        ? this.inventarioSvc.getArticulos({ buscar: q, limit: 20 })
        : of({ articulos: [] }))
    ).subscribe((res: any) => {
      this.articulosFiltrados = res?.articulos ?? (Array.isArray(res) ? res : []);
    });
  }

  cargarProveedores() {
    this.loadingProveedores = true;
    this.comprasSvc.getProveedores().subscribe({
      next: (res: any) => {
        this.proveedores = res?.proveedores ?? [];
        this.loadingProveedores = false;
      },
      error: () => { this.loadingProveedores = false; },
    });
  }

  verCatalogo(proveedor: any) {
    this.proveedorSeleccionado = proveedor;
    this.loadingCatalogo = true;
    this.catalogoProveedor = [];
    this.comprasSvc.catalogoProveedor(proveedor.nombre).subscribe({
      next: (res: any) => {
        this.catalogoProveedor = res?.catalogo ?? [];
        this.loadingCatalogo = false;
      },
      error: () => { this.loadingCatalogo = false; },
    });
  }

  onArticuloSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.articuloSearch = q;
    this.searchSubject.next(q);
  }

  seleccionarArticulo(art: any) {
    this.articuloSeleccionado = art;
    this.articuloSearch = `${art.codigo} — ${art.descripcion}`;
    this.cotizar();
  }

  cotizar() {
    if (!this.articuloSeleccionado) return;
    this.loadingCotizacion = true;
    this.cotizacion = null;
    this.comprasSvc.cotizarArticulo(this.articuloSeleccionado.id).subscribe({
      next: (res: any) => {
        this.cotizacion = res;
        this.loadingCotizacion = false;
      },
      error: () => { this.loadingCotizacion = false; },
    });
  }

  crearOrdenDesdeProveedor(item: any, proveedor: string) {
    // Navegar a órdenes con datos pre-llenados (se puede extender)
    alert(`Crear orden para ${item.descripcion ?? item.codigo} con ${proveedor} a $${this.formatCOP(item.precio_unitario)}/ud`);
  }

  formatCOP(valor: number | null): string {
    if (valor === null || valor === undefined) return '—';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(Math.abs(valor));
  }

  get totalCatalogo(): number {
    return this.catalogoProveedor.reduce((s, c) => s + (c.valor_total_pagado || 0), 0);
  }

  get totalProveedores(): number {
    return this.proveedores.reduce((s, p) => s + (p.total_comprado_abs || 0), 0);
  }
}
