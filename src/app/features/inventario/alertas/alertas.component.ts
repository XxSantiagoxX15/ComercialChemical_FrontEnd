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
  ],
  templateUrl: './alertas.component.html',
  styleUrl: './alertas.component.css',
})
export class AlertasComponent implements OnInit {
  private inventarioSvc = inject(InventarioService);
  private comprasSvc = inject(ComprasService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['codigo', 'descripcion', 'stock_actual', 'stock_minimo', 'pct_stock', 'urgencia', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  alertas: any[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit() {
    this.cargarAlertas();
  }

  cargarAlertas() {
    this.loading = true;
    this.error = null;
    this.inventarioSvc.getAlertasStockCritico().subscribe({
      next: (res: any) => {
        // Backend retorna { alertas: [...], total: N }
        this.alertas = res?.alertas ?? (Array.isArray(res) ? res : []);
        this.dataSource.data = this.alertas;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar las alertas.';
        this.loading = false;
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
