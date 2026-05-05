import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['codigo', 'descripcion', 'categoria', 'stock_actual', 'stock_minimo', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  error: string | null = null;
  busqueda = '';

  ngOnInit() {
    this.cargarArticulos();
  }

  cargarArticulos() {
    this.loading = true;
    this.error = null;
    this.inventarioSvc.getArticulos({ buscar: this.busqueda, limit: 500 }).subscribe({
      next: (res: any) => {
        // El backend retorna { articulos: [...], total: N, page: N, limit: N }
        const data = res?.articulos ?? (Array.isArray(res) ? res : []);
        this.dataSource.data = data;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
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
}
