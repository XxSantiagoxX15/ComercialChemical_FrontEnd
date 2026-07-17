import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { InventarioService } from '../../../core/services/inventario.service';
import { ComprasService } from '../../../core/services/compras.service';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
  ],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css',
})
export class AlertasComponent implements OnInit {
  private inventarioSvc = inject(InventarioService);
  private comprasSvc = inject(ComprasService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // La tabla vive dentro de un @if(loading) que la destruye y recrea en cada carga,
  // así que MatSort/MatPaginator son instancias nuevas cada vez. Se conectan al
  // dataSource apenas Angular las crea, en vez de adivinar con un setTimeout.
  @ViewChild(MatPaginator) set paginatorRef(mp: MatPaginator | undefined) {
    if (mp) this.dataSource.paginator = mp;
  }

  @ViewChild(MatSort) set sortRef(ms: MatSort | undefined) {
    if (ms) this.dataSource.sort = ms;
  }

  displayedColumns = ['codigo', 'descripcion', 'stock_actual', 'stock_minimo', 'pct_stock', 'urgencia', 'acciones'];
  displayedColumnsIgnoradas = ['codigo', 'descripcion', 'stock_actual', 'stock_minimo', 'fecha_ignorada', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  alertas: any[] = [];
  loading = false;
  error: string | null = null;

  ignoradas: any[] = [];
  loadingIgnoradas = false;
  mostrarIgnoradas = false;

  displayedColumnsVencimiento = ['articulo', 'numero_lote', 'cantidad_disponible', 'fecha_vencimiento', 'dias_para_vencer'];
  vencimientos: any[] = [];
  loadingVencimientos = false;
  errorVencimientos: string | null = null;

  ngOnInit() {
    // stock_actual/stock_minimo llegan como texto (DecimalField) — sin esto MatSort
    // los ordena alfabéticamente en vez de numéricamente.
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'stock_actual':
        case 'stock_minimo':
          return parseFloat(item[property]) || 0;
        default:
          return item[property];
      }
    };
    this.cargarAlertas();
    this.cargarVencimientos();
  }

  cargarVencimientos() {
    this.loadingVencimientos = true;
    this.errorVencimientos = null;
    this.inventarioSvc.getAlertasVencimiento(30).subscribe({
      next: (res: any) => {
        this.vencimientos = res?.alertas ?? (Array.isArray(res) ? res : []);
        this.loadingVencimientos = false;
      },
      error: () => {
        this.errorVencimientos = 'Error al cargar los vencimientos.';
        this.loadingVencimientos = false;
      },
    });
  }

  getUrgenciaVencimiento(dias: number): string {
    if (dias <= 7) return 'critico';
    if (dias <= 15) return 'alto';
    return 'medio';
  }

  cargarAlertas() {
    this.loading = true;
    this.error = null;
    this.inventarioSvc.getAlertasStockCritico().subscribe({
      next: (res: any) => {
        // Backend retorna { alertas: [...], total: N }
        this.alertas = res?.alertas ?? (Array.isArray(res) ? res : []);
        this.dataSource.data = this.alertas;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar las alertas.';
        this.loading = false;
      },
    });
  }

  ignorarAlerta(row: any) {
    this.inventarioSvc.ignorarAlerta(row.articulo_id).subscribe({
      next: () => {
        this.alertas = this.alertas.filter(a => a.articulo_id !== row.articulo_id);
        this.dataSource.data = this.alertas;
        this.snackBar.open(`Alerta de "${row.codigo}" ignorada`, 'Deshacer', { duration: 5000 })
          .onAction().subscribe(() => this.reactivarAlerta(row));
        if (this.mostrarIgnoradas) this.cargarIgnoradas();
      },
      error: () => {
        this.snackBar.open('No se pudo ignorar la alerta.', 'Cerrar', { duration: 3000, panelClass: 'snack-error' });
      },
    });
  }

  toggleIgnoradas() {
    this.mostrarIgnoradas = !this.mostrarIgnoradas;
    if (this.mostrarIgnoradas && this.ignoradas.length === 0) {
      this.cargarIgnoradas();
    }
  }

  cargarIgnoradas() {
    this.loadingIgnoradas = true;
    this.inventarioSvc.getAlertasStockCritico(true).subscribe({
      next: (res: any) => {
        const todas = res?.alertas ?? (Array.isArray(res) ? res : []);
        this.ignoradas = todas.filter((a: any) => a.alerta_ignorada);
        this.loadingIgnoradas = false;
      },
      error: () => { this.loadingIgnoradas = false; },
    });
  }

  reactivarAlerta(row: any) {
    this.inventarioSvc.reactivarAlerta(row.articulo_id).subscribe({
      next: () => {
        this.ignoradas = this.ignoradas.filter(a => a.articulo_id !== row.articulo_id);
        this.snackBar.open(`Alerta de "${row.codigo}" reactivada`, 'Cerrar', { duration: 3000 });
        this.cargarAlertas();
      },
      error: () => {
        this.snackBar.open('No se pudo reactivar la alerta.', 'Cerrar', { duration: 3000, panelClass: 'snack-error' });
      },
    });
  }

  getPct(articulo: any): number {
    if (!articulo.stock_minimo || articulo.stock_minimo === 0) return 0;
    return Math.min(100, Math.round((articulo.stock_actual / articulo.stock_minimo) * 100));
  }

  getNivel(articulo: any): string {
    const pct = this.getPct(articulo);
    if (pct <= 25) return 'critico';
    if (pct <= 50) return 'alto';
    if (pct <= 75) return 'medio';
    return 'bajo';
  }

  getNivelLabel(articulo: any): string {
    const map: any = { critico: 'Crítico', alto: 'Alto', medio: 'Medio', bajo: 'Bajo' };
    return map[this.getNivel(articulo)] ?? 'Normal';
  }

  crearOrden(articulo: any) {
    const cantidad = Math.max(1, (articulo.stock_minimo ?? 10) - (articulo.stock_actual ?? 0));
    this.comprasSvc.crearOrden({
      articulo: articulo.id,
      cantidad_solicitada: cantidad,
      precio_unitario: 0,
      proveedor: '',
      observaciones: `Orden generada automáticamente por alerta de stock crítico. Stock actual: ${articulo.stock_actual}`,
    }).subscribe({
      next: () => {
        this.snackBar.open('Orden de compra creada correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/compras/ordenes']);
      },
      error: (err) => {
        const msg = err.error?.detail || 'Error al crear la orden de compra.';
        this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'snack-error' });
      },
    });
  }
}
