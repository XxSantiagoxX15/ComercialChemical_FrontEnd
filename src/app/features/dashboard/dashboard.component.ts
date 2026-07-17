import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { InventarioService } from '../../core/services/inventario.service';
import { ComprasService } from '../../core/services/compras.service';
import { PronosticosService } from '../../core/services/pronosticos.service';
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
    MatTooltipModule, MatSnackBarModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private inventarioSvc   = inject(InventarioService);
  private comprasSvc      = inject(ComprasService);
  private pronosticosSvc  = inject(PronosticosService);
  private auth            = inject(AuthService);
  private snackBar        = inject(MatSnackBar);

  // Cancela la petición anterior si el usuario hace clic en Actualizar
  // mientras ya hay una carga en curso
  private destroy$ = new Subject<void>();
  private chartStock: Chart | null = null;
  private chartTimeline: Chart | null = null;

  // El canvas vive dentro de un @if condicional — Angular solo crea el nodo en el DOM
  // cuando la condición se vuelve verdadera por primera vez. El setter de ViewChild se
  // dispara justo en ese momento, evitando adivinar un tiempo de espera fijo.
  @ViewChild('stockCanvas') set stockCanvasRef(ref: ElementRef<HTMLCanvasElement> | undefined) {
    if (ref) this.renderStockChart();
  }

  @ViewChild('timelineCanvas') set timelineCanvasRef(ref: ElementRef<HTMLCanvasElement> | undefined) {
    if (ref) this.renderTimelineChart();
  }

  loading = true;
  error: string | null = null;

  totalArticulos    = 0;
  stockCritico: any[] = [];
  ordenesPendientes: number | null = null; // null = sin acceso
  ultimasAlertas: any[] = [];

  kitsProducibles: any[]      = []; // null = sin acceso
  recomendaciones: any[]      = []; // null = sin acceso
  resumenHistorico: any       = null; // null = sin acceso o sin datos
  resumenStockMensual: any    = null; // null = sin acceso o sin datos

  get userRol(): string {
    const user = this.auth.getUser();
    return user?.rol ?? '';
  }

  get puedeVerCompras(): boolean {
    return ['Administrador', 'Responsable_Compras'].includes(this.userRol);
  }

  get puedeVerInventario(): boolean {
    return ['Administrador', 'Analista_Inventarios'].includes(this.userRol);
  }

  get kitsListos(): number {
    return this.kitsProducibles.filter(k => k.max_producible > 0).length;
  }

  get recomendacionesUrgentes(): any[] {
    return this.recomendaciones.filter(r => ['critico', 'alto'].includes(r.nivel_prioridad));
  }

  getPrioridadClass(nivel: string): string {
    return { critico: 'chip-critico', alto: 'chip-alto', medio: 'chip-medio', bajo: 'chip-bajo' }[nivel] ?? 'chip-bajo';
  }

  ngOnInit() { this.cargarDatos(); }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chartStock) { this.chartStock.destroy(); this.chartStock = null; }
    if (this.chartTimeline) { this.chartTimeline.destroy(); this.chartTimeline = null; }
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
    const recomendaciones$ = this.puedeVerCompras
      ? this.pronosticosSvc.getRecomendaciones().pipe(catchError(() => of(null)))
      : of(null);
    const kits$ = this.puedeVerInventario
      ? this.inventarioSvc.getKitsProducibles().pipe(catchError(() => of(null)))
      : of(null);
    const resumenHistorico$ = this.puedeVerInventario
      ? this.pronosticosSvc.getResumenHistorico(12).pipe(catchError(() => of(null)))
      : of(null);
    const resumenStockMensual$ = this.puedeVerInventario
      ? this.inventarioSvc.getResumenStockMensual(12).pipe(catchError(() => of(null)))
      : of(null);

    forkJoin({
      articulos: this.inventarioSvc.getArticulos({ limit: 1 }).pipe(catchError(() => of(null))),
      alertas:   this.inventarioSvc.getAlertasStockCritico().pipe(catchError(() => of(null))),
      ordenes:   ordenes$,
      recomendaciones: recomendaciones$,
      kits: kits$,
      resumenHistorico: resumenHistorico$,
      resumenStockMensual: resumenStockMensual$,
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

        if (data.recomendaciones !== null) {
          this.recomendaciones = data.recomendaciones?.recomendaciones ?? [];
        }

        if (data.kits !== null) {
          this.kitsProducibles = data.kits?.kits ?? [];
        }

        this.resumenHistorico = data.resumenHistorico ?? null;
        this.resumenStockMensual = data.resumenStockMensual ?? null;

        // El @if(loading) destruye y vuelve a crear el bloque de contenido (incluidos los
        // canvas) en cada carga, así que los setters de ViewChild de arriba se encargan
        // de dibujar los gráficos apenas el nodo nuevo exista — no hace falta llamarlos aquí.
        this.loading = false;
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
    const stockMensual = this.resumenStockMensual?.stock_mensual ?? [];
    if (!canvas || !stockMensual.length) return;

    Chart.getChart(canvas)?.destroy();

    const labels  = stockMensual.map((s: any) => this.formatMes(s.mes));
    const totales = stockMensual.map((s: any) => s.total);
    const minimo  = this.resumenStockMensual?.minimo_total ?? 0;

    this.chartStock = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Stock Total',
            data: totales,
            borderColor: '#1a237e',
            backgroundColor: 'rgba(26,35,126,0.08)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#1a237e',
            fill: true,
            tension: 0.25,
          },
          {
            label: 'Mínimo Total Requerido (hoy)',
            data: new Array(labels.length).fill(minimo),
            borderColor: '#2e7d32',
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 0,
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
              label: (ctx: any) => ` ${ctx.dataset.label}: ${Math.round(ctx.parsed.y).toLocaleString('es-CO')} uds`,
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
            title: { display: true, text: 'Unidades totales en inventario', font: { size: 11 } },
          },
        },
      },
    });
  }

  private formatMes(mes: string): string {
    const [anio, m] = mes.split('-');
    const nombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${nombres[parseInt(m, 10) - 1]} ${anio}`;
  }

  private renderTimelineChart() {
    if (this.chartTimeline) { this.chartTimeline.destroy(); this.chartTimeline = null; }
    const canvas = document.getElementById('chartTimeline') as HTMLCanvasElement;
    const historico  = this.resumenHistorico?.historico ?? [];
    const pronostico = this.resumenHistorico?.pronostico ?? [];
    if (!canvas || !historico.length) return;

    // Por si quedó una instancia de Chart.js pegada al canvas de una carga anterior.
    Chart.getChart(canvas)?.destroy();

    const labels = [...historico.map((h: any) => h.mes), ...pronostico.map((p: any) => p.mes)].map(m => this.formatMes(m));

    const historicoData = [
      ...historico.map((h: any) => h.total),
      ...new Array(pronostico.length).fill(null),
    ];

    // El dataset de pronóstico arranca en el último punto histórico para que la línea se vea continua.
    const pronosticoData = [
      ...new Array(Math.max(historico.length - 1, 0)).fill(null),
      historico.length ? historico[historico.length - 1].total : null,
      ...pronostico.map((p: any) => p.total),
    ];

    this.chartTimeline = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Demanda Histórica',
            data: historicoData,
            borderColor: '#1a237e',
            backgroundColor: 'rgba(26,35,126,0.08)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#1a237e',
            fill: true,
            tension: 0.25,
            spanGaps: false,
          },
          {
            label: 'Demanda Proyectada',
            data: pronosticoData,
            borderColor: '#e65100',
            backgroundColor: 'rgba(230,81,0,0.08)',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 3,
            pointBackgroundColor: '#e65100',
            fill: true,
            tension: 0.25,
            spanGaps: false,
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
              label: (ctx: any) => ` ${ctx.dataset.label}: ${Math.round(ctx.parsed.y)} uds`,
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
            title: { display: true, text: 'Unidades vendidas', font: { size: 11 } },
          },
        },
      },
    });
  }

  generarOrden(rec: any) {
    this.pronosticosSvc.generarOrdenDesdeRecomendacion(rec.articulo_id).subscribe({
      next: () => {
        this.snackBar.open(`Orden de compra generada para ${rec.codigo}`, 'Cerrar', { duration: 3000 });
        this.cargarDatos();
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'No se pudo generar la orden.', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
