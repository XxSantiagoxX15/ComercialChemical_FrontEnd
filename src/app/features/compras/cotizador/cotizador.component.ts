import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ComprasService } from '../../../core/services/compras.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { ProveedorFormComponent } from '../proveedores/proveedor-form.component';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-cotizador',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    MatProgressSpinnerModule, MatChipsModule, MatDividerModule,
    MatTabsModule, MatTooltipModule, MatTableModule,
    MatDialogModule, MatSnackBarModule,
  ],
  templateUrl: './cotizador.component.html',
  styleUrl: './cotizador.component.css',
})
export class CotizadorComponent implements OnInit {
  private comprasSvc    = inject(ComprasService);
  private inventarioSvc = inject(InventarioService);
  private dialog         = inject(MatDialog);
  private snackBar       = inject(MatSnackBar);
  private cdr             = inject(ChangeDetectorRef);

  // ── Proveedores ───────────────────────────────────────────────────────────
  proveedores: any[]         = [];
  loadingProveedores         = false;
  proveedorSeleccionado: any = null;
  catalogoProveedor: any[]   = [];
  loadingCatalogo            = false;

  // ── Agregar artículo al catálogo del proveedor seleccionado ─────────────────
  nuevoArticuloSearch        = '';
  nuevoArticuloSeleccionado: any = null;
  nuevoArticuloFiltrados: any[]  = [];
  nuevoArticuloPrecio: number | null = null;
  agregandoArticulo           = false;
  private nuevoArticuloSubject = new Subject<string>();

  // ── Edición de precio inline ────────────────────────────────────────────────
  editandoPrecioId: number | null = null;
  precioEditado: number | null = null;

  // ── Cotizador por artículo ────────────────────────────────────────────────
  articuloSearch             = '';
  articuloSeleccionado: any  = null;
  articulosFiltrados: any[]  = [];
  cotizacion: any            = null;
  loadingCotizacion          = false;
  private searchSubject      = new Subject<string>();

  // ── Columnas tablas ───────────────────────────────────────────────────────
  colsPrecios     = ['proveedor', 'precio_unitario', 'fecha_actualizacion', 'accion'];
  colsCatalogo    = ['codigo', 'descripcion', 'precio_unitario', 'fecha_actualizacion', 'accion'];
  colsProveedores = ['nombre', 'contacto', 'num_articulos', 'accion'];

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
      this.cdr.detectChanges();
    });

    this.nuevoArticuloSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q.length >= 2
        ? this.inventarioSvc.getArticulos({ buscar: q, limit: 20 })
        : of({ articulos: [] }))
    ).subscribe((res: any) => {
      this.nuevoArticuloFiltrados = res?.articulos ?? (Array.isArray(res) ? res : []);
      this.cdr.detectChanges();
    });
  }

  cargarProveedores() {
    this.loadingProveedores = true;
    this.comprasSvc.getProveedores().subscribe({
      next: (res: any) => {
        this.proveedores = res?.proveedores ?? [];
        this.loadingProveedores = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingProveedores = false; this.cdr.detectChanges(); },
    });
  }

  abrirFormularioProveedor(proveedor?: any, event?: Event) {
    event?.stopPropagation();
    const ref = this.dialog.open(ProveedorFormComponent, {
      width: '540px',
      data: proveedor ?? null,
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.cargarProveedores();
        this.snackBar.open(
          proveedor ? 'Proveedor actualizado correctamente' : 'Proveedor creado correctamente',
          'Cerrar', { duration: 3000 }
        );
      }
      this.cdr.detectChanges();
    });
  }

  eliminarProveedor(proveedor: any, event: Event) {
    event.stopPropagation();
    if (!confirm(`¿Eliminar al proveedor "${proveedor.nombre}"? Se eliminará también su catálogo de precios.`)) return;
    this.comprasSvc.eliminarProveedor(proveedor.id).subscribe({
      next: () => {
        if (this.proveedorSeleccionado?.id === proveedor.id) {
          this.proveedorSeleccionado = null;
          this.catalogoProveedor = [];
        }
        this.cargarProveedores();
        this.snackBar.open('Proveedor eliminado', 'Cerrar', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: () => { this.snackBar.open('No se pudo eliminar el proveedor', 'Cerrar', { duration: 3000 }); this.cdr.detectChanges(); },
    });
  }

  verCatalogo(proveedor: any) {
    this.proveedorSeleccionado = proveedor;
    this.cancelarNuevoArticulo();
    this.cargarCatalogo();
  }

  cargarCatalogo() {
    if (!this.proveedorSeleccionado) return;
    this.loadingCatalogo = true;
    this.catalogoProveedor = [];
    this.comprasSvc.getCatalogoProveedorArticulos(this.proveedorSeleccionado.id).subscribe({
      next: (res: any) => {
        this.catalogoProveedor = res?.catalogo ?? [];
        this.loadingCatalogo = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingCatalogo = false; this.cdr.detectChanges(); },
    });
  }

  onNuevoArticuloSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.nuevoArticuloSearch = q;
    this.nuevoArticuloSeleccionado = null;
    this.nuevoArticuloSubject.next(q);
  }

  seleccionarNuevoArticulo(art: any) {
    this.nuevoArticuloSeleccionado = art;
    this.nuevoArticuloSearch = `${art.codigo} — ${art.descripcion}`;
  }

  cancelarNuevoArticulo() {
    this.nuevoArticuloSearch = '';
    this.nuevoArticuloSeleccionado = null;
    this.nuevoArticuloFiltrados = [];
    this.nuevoArticuloPrecio = null;
  }

  agregarArticuloAlCatalogo() {
    if (!this.proveedorSeleccionado || !this.nuevoArticuloSeleccionado || !this.nuevoArticuloPrecio) return;
    this.agregandoArticulo = true;
    this.comprasSvc.agregarArticuloProveedor({
      proveedor: this.proveedorSeleccionado.id,
      articulo: this.nuevoArticuloSeleccionado.id,
      precio_unitario: this.nuevoArticuloPrecio,
    }).subscribe({
      next: () => {
        this.agregandoArticulo = false;
        this.cancelarNuevoArticulo();
        this.cargarCatalogo();
        this.cargarProveedores();
        this.snackBar.open('Artículo agregado al catálogo', 'Cerrar', { duration: 2500 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.agregandoArticulo = false;
        this.snackBar.open(err.error?.error || 'No se pudo agregar el artículo', 'Cerrar', { duration: 3000 });
        this.cdr.detectChanges();
      },
    });
  }

  iniciarEdicionPrecio(item: any) {
    this.editandoPrecioId = item.id;
    this.precioEditado = item.precio_unitario;
  }

  cancelarEdicionPrecio() {
    this.editandoPrecioId = null;
    this.precioEditado = null;
  }

  guardarPrecio(item: any) {
    if (this.precioEditado === null || this.precioEditado <= 0) return;
    this.comprasSvc.actualizarPrecioArticulo(item.id, this.precioEditado).subscribe({
      next: () => {
        this.cancelarEdicionPrecio();
        this.cargarCatalogo();
        this.snackBar.open('Precio actualizado', 'Cerrar', { duration: 2500 });
        this.cdr.detectChanges();
      },
      error: () => { this.snackBar.open('No se pudo actualizar el precio', 'Cerrar', { duration: 3000 }); this.cdr.detectChanges(); },
    });
  }

  quitarArticuloDelCatalogo(item: any) {
    if (!confirm(`¿Quitar "${item.descripcion}" del catálogo de ${this.proveedorSeleccionado.nombre}?`)) return;
    this.comprasSvc.quitarArticuloProveedor(item.id).subscribe({
      next: () => {
        this.cargarCatalogo();
        this.cargarProveedores();
        this.snackBar.open('Artículo quitado del catálogo', 'Cerrar', { duration: 2500 });
        this.cdr.detectChanges();
      },
      error: () => { this.snackBar.open('No se pudo quitar el artículo', 'Cerrar', { duration: 3000 }); this.cdr.detectChanges(); },
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
        this.cdr.detectChanges();
      },
      error: () => { this.loadingCotizacion = false; this.cdr.detectChanges(); },
    });
  }

  crearOrdenDesdeProveedor(item: any, proveedor: string) {
    alert(`Crear orden para ${item.descripcion ?? item.codigo} con ${proveedor} a $${this.formatCOP(item.precio_unitario)}/ud`);
  }

  formatCOP(valor: number | null): string {
    if (valor === null || valor === undefined) return '—';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(Math.abs(valor));
  }
}
