import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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
import { AuthService } from '../../core/services/auth.service';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatIconModule,
    MatButtonModule, MatProgressSpinnerModule, MatChipsModule, MatDividerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private inventarioSvc = inject(InventarioService);
  private comprasSvc    = inject(ComprasService);
  private auth          = inject(AuthService);

  // Cancela la petición anterior si el usuario hace clic en Actualizar
  // mientras ya hay una carga en curso
  private destroy$ = new Subject<void>();
  private chartStock: Chart | null = null;

  loading = true;
  error: string | null = null;

  totalArticulos    = 0;
  stockCritico: any[] = [];
  ordenesPendientes: number | null = null; // null = sin acceso
  ultimasAlertas: any[] = [];

  get userRol(): string {
    const user = this.auth.getUser();
    return user?.rol ?? '';
  }

  get puedeVerCompras(): boolean {
    return ['Administrador', 'Responsable_Compras'].includes(this.userRol);
  }

  ngOnInit() { this.cargarDatos(); }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chartStock) { this.chartStock.destroy(); this.chartStock = null; }
  }

  cargarDatos() {
    // Cancela cualquier petición pendiente anterior
    this.destroy$.next();

    this.loading = true;
    this.error   = null;

    // Compras solo si tiene permiso
    const ordenes$ = this.puedeVerCompras
      ? this.comprasSvc.getOrdenes({ estado: 'pendiente' }).pipe(catchError(() => of(null)))
      : of(null);

    forkJoin({
      articulos: this.inventarioSvc.getArticulos({ limit: 1 }).pipe(catchError(() => of(null))),
      alertas:   this.inventarioSvc.getAlertasStockCritico().pipe(catchError(() => of(null))),
      ordenes:   ordenes$,
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: any) => {
        const articulosData = data.articulos;
        this.totalArticulos = articulosData?.total ?? articulosData?.count
          ?? (Array.isArray(articulosData) ? articulosData.length : 0);

        const alertasData = data.alertas;
        this.stockCritico  = alertasData?.alertas ?? (Array.isArray(alertasData) ? alertasData : []);
        this.ultimasAlertas = this.stockCritico.slice(0, 5);

        if (data.ordenes !== null) {
          const ordenesData = data.ordenes;
          this.ordenesPendientes = ordenesData?.total ?? ordenesData?.count
            ?? (Array.isArray(ordenesData) ? ordenesData.length : 0);
        }

        this.loading = false;
        setTimeout(() => this.renderStockChart(), 100);
      },
      error: () => {
        this.error   = 'Error al cargar los datos del dashboard.';
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

  private renderStockChart() {
    if (this.chartStock) { this.chartStock.destroy(); this.chartStock = null; }
    const canvas = document.getElementById('chartStockCritico') as HTMLCanvasElement;
    const data   = this.stockCritico.slice(0, 12);
    if (!canvas || !data.length) return;

    const labels  = data.map((a: any) => a.codigo ?? '');
    const actual  = data.map((a: any) => a.stock_actual ?? 0);
    const minimo  = data.map((a: any) => a.stock_minimo ?? 0);

    this.chartStock = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Stock Actual',
            data: actual,
            backgroundColor: actual.map((v, i) =>
              v <= minimo[i] * 0.25 ? 'rgba(198,40,40,0.8)'
              : v <= minimo[i] * 0.5 ? 'rgba(230,81,0,0.8)'
              : 'rgba(57,73,171,0.8)'),
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Stock Mínimo',
            data: minimo,
            type: 'line' as any,
            borderColor: '#2e7d32',
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 3,
            pointBackgroundColor: '#2e7d32',
            fill: false,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 12, family: 'Inter' }, usePointStyle: true, padding: 16 },
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.y} uds`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, family: 'Inter' }, maxRotation: 45 },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 11, family: 'Inter' } },
            title: { display: true, text: 'Unidades', font: { size: 11 } },
          },
        },
      },
    });
  }
}
