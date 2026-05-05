import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { InventarioService } from '../../core/services/inventario.service';
import { ComprasService } from '../../core/services/compras.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private inventarioSvc = inject(InventarioService);
  private comprasSvc = inject(ComprasService);

  loading = true;
  error: string | null = null;

  totalArticulos = 0;
  stockCritico: any[] = [];
  ordenesPendientes = 0;
  ultimasAlertas: any[] = [];

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.error = null;

    forkJoin({
      articulos: this.inventarioSvc.getArticulos({ limit: 1 }).pipe(catchError(() => of(null))),
      alertas: this.inventarioSvc.getAlertasStockCritico().pipe(catchError(() => of(null))),
      ordenes: this.comprasSvc.getOrdenes({ estado: 'pendiente' }).pipe(catchError(() => of(null))),
    }).subscribe({
      next: (data: any) => {
        // El backend retorna { articulos: [...], total: N, page: N, limit: N }
        const articulosData = data.articulos;
        this.totalArticulos = articulosData?.total ?? articulosData?.count ?? (Array.isArray(articulosData) ? articulosData.length : 0);

        // Alertas retorna { alertas: [...], total: N }
        const alertasData = data.alertas;
        this.stockCritico = alertasData?.alertas ?? (Array.isArray(alertasData) ? alertasData : []);
        this.ultimasAlertas = this.stockCritico.slice(0, 5);

        // Ordenes retorna { ordenes: [...], total: N }
        const ordenesData = data.ordenes;
        this.ordenesPendientes = ordenesData?.total ?? ordenesData?.count ?? (Array.isArray(ordenesData) ? ordenesData.length : 0);

        this.error = null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Dashboard error:', err);
        this.error = `Error al cargar los datos. (${err.status}: ${err.error?.detail || err.message || 'Sin detalles'})`;
        this.loading = false;
      },
    });
  }

  getNivelUrgencia(articulo: any): string {
    if (!articulo.stock_minimo || articulo.stock_minimo === 0) return 'bajo';
    const pct = (articulo.stock_actual / articulo.stock_minimo) * 100;
    if (pct <= 25) return 'critico';
    if (pct <= 50) return 'alto';
    return 'medio';
  }

  getPctStock(articulo: any): number {
    if (!articulo.stock_minimo || articulo.stock_minimo === 0) return 0;
    return Math.round((articulo.stock_actual / articulo.stock_minimo) * 100);
  }
}
