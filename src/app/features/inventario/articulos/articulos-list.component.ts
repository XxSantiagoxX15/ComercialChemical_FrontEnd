import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { InventarioService } from '../../../core/services/inventario.service';
import { ArticuloFormComponent } from './articulo-form.component';

@Component({
  selector: 'app-articulos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './articulos-list.component.html',
  styleUrl: './articulos-list.component.css',
})
export class ArticulosListComponent implements OnInit {
  private inventarioSvc = inject(InventarioService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // La tabla vive dentro de un @if(loading) que la destruye y recrea en cada carga,
  // así que MatSort/MatPaginator son instancias nuevas cada vez. Se conectan al
  // dataSource apenas Angular las crea, en vez de adivinar con un setTimeout.
  @ViewChild(MatPaginator) set paginatorRef(mp: MatPaginator | undefined) {
    if (mp) this.dataSource.paginator = mp;
  }

  @ViewChild(MatSort) set sortRef(ms: MatSort | undefined) {
    if (ms) this.dataSource.sort = ms;
  }

  displayedColumns = ['codigo', 'descripcion', 'categoria', 'tipo_producto', 'stock_actual', 'stock_minimo', 'total_vendido', 'valor_vendido', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  error: string | null = null;
  busqueda = '';
  tipoProducto = '';

  ngOnInit() {
    // El backend serializa los DecimalField (stock_actual, stock_minimo) como texto
    // (ej: "2.130"), y por defecto MatSort los ordena alfabéticamente en vez de
    // numéricamente. Se fuerza la conversión a número solo en las columnas numéricas.
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'stock_actual':
        case 'stock_minimo':
        case 'total_vendido':
        case 'valor_vendido':
          return parseFloat(item[property]) || 0;
        default:
          return item[property];
      }
    };
    this.cargarArticulos();
  }

  cargarArticulos() {
    this.loading = true;
    this.error = null;
    this.inventarioSvc.getArticulos({
      buscar: this.busqueda,
      tipo_producto: this.tipoProducto || undefined,
      limit: 500,
    }).subscribe({
      next: (res: any) => {
        // El backend retorna { articulos: [...], total: N, page: N, limit: N }
        const data = res?.articulos ?? (Array.isArray(res) ? res : []);
        this.dataSource.data = data;
        // El @if(loading) recrea la tabla al pasar a false; los setters de ViewChild
        // de arriba reconectan sort/paginator apenas el nodo nuevo exista.
        this.loading = false;
      },
      error: (err) => {
        this.error = `Error al cargar los artículos. (${err.status})`;
        this.loading = false;
      },
    });
  }

  onBuscar() {
    this.cargarArticulos();
  }

  onFiltroTipoChange() {
    this.cargarArticulos();
  }

  getTipoChip(row: any): { label: string; clase: string } {
    return row.tipo_producto === 'kit'
      ? { label: 'Kit', clase: 'chip-kit' }
      : { label: 'Producto', clase: 'chip-producto' };
  }

  onBuscarInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  abrirFormulario(articulo?: any) {
    const ref = this.dialog.open(ArticuloFormComponent, {
      width: '600px',
      data: articulo ?? null,
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.cargarArticulos();
        this.snackBar.open(
          articulo ? 'Artículo actualizado correctamente' : 'Artículo creado correctamente',
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
  }

  getEstado(articulo: any): { label: string; clase: string } {
    if (articulo.stock_actual <= 0) return { label: 'Sin stock', clase: 'chip-error' };
    if (articulo.stock_actual <= articulo.stock_minimo) return { label: 'Crítico', clase: 'chip-warn' };
    return { label: 'Normal', clase: 'chip-ok' };
  }

  formatCOP(valor: number): string {
    if (!valor && valor !== 0) return '—';
    const abs = Math.abs(valor);
    const formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(abs);
    return valor < 0 ? `+${formatted}` : formatted;
  }

  getValorClass(valor: number): string {
    if (!valor) return '';
    return valor < 0 ? 'valor-ganancia' : 'valor-normal';
  }
}
