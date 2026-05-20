import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PronosticosService } from '../../core/services/pronosticos.service';
import { InventarioService } from '../../core/services/inventario.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-pronosticos',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, FormsModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatTableModule, MatProgressSpinnerModule,
    MatChipsModule, MatDividerModule,
    MatAutocompleteModule, MatSnackBarModule,
    MatTabsModule, MatTooltipModule,
  ],
  templateUrl: './pronosticos.component.html',
  styleUrl: './pronosticos.component.css',
})
export class PronosticosComponent implements OnInit, OnDestroy {
  private pronosticosSvc = inject(PronosticosService);
  private inventarioSvc  = inject(InventarioService);
  private snackBar       = inject(MatSnackBar);

  // ── Búsqueda de artículo ──────────────────────────────────────────────
  articulosFiltrados: any[] = [];
  articuloSearch = '';
  articuloSeleccionado: any = null;
  filtroCodigo = '';
  private searchSubject = new Subject<string>();

  // ── Estados ───────────────────────────────────────────────────────────
  calculando            = false;
  loadingRecomendaciones = false;
  loadingMasVendidos    = false;
  loadingGeneral        = false;

  // ── Datos ─────────────────────────────────────────────────────────────
  resultados: any[]      = [];
  recomendaciones: any[] = [];
  recomendacionesFiltradas: any[] = [];
  masVendidos: any[]     = [];
  analisis: any          = null;
  errorCalculo: string | null = null;

  // ── Gráficas ──────────────────────────────────────────────────────────
  private chartForecast: Chart | null = null;
  private chartMasVendidos: Chart | null = null;
  private chartRecomendaciones: Chart | null = null;

  // ── Columnas tablas ───────────────────────────────────────────────────
  displayedColumnsResultados      = ['fecha', 'demanda_proyectada', 'barra'];
  displayedColumnsMasVendidos     = ['pos', 'codigo', 'descripcion', 'total_vendido'];
  displayedColumnsRecomendaciones = ['pos', 'articulo', 'stock_actual', 'demanda_proyectada', 'cantidad_recomendada', 'prioridad'];

  ngOnInit() {
    this.cargarTodo();
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

  ngOnDestroy() {
    this.destroyCharts();
  }

  // ── Tab change — re-render charts when tab becomes visible ──────────
  onTabChange(event: MatTabChangeEvent) {
    // Tab 1 = Más Vendidos, Tab 2 = Recomendaciones
    if (event.index === 1 && this.masVendidos.length) {
      setTimeout(() => this.renderMasVendidosChart(), 50);
    }
    if (event.index === 2 && this.recomendacionesFiltradas.length) {
      setTimeout(() => this.renderRecomendacionesChart(), 50);
    }
  }

  // ── Carga inicial ─────────────────────────────────────────────────────
  cargarTodo() {
    this.cargarMasVendidos();
    this.cargarRecomendaciones();
  }

  // ── Búsqueda artículo ─────────────────────────────────────────────────
  onArticuloSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.articuloSearch = q;
    this.searchSubject.next(q);
  }

  seleccionarArticulo(art: any) {
    this.articuloSeleccionado = art;
    this.articuloSearch = `${art.codigo} - ${art.descripcion}`;
  }

  // ── Calcular pronóstico ───────────────────────────────────────────────
  calcular() {
    if (!this.articuloSeleccionado) {
      this.snackBar.open('Selecciona un artículo de la lista.', 'Cerrar', { duration: 4000 });
      return;
    }
    const id = this.articuloSeleccionado.id;
    this.calculando   = true;
    this.resultados   = [];
    this.analisis     = null;
    this.errorCalculo = null;
    this.destroyChart('forecast');

    // Análisis estadístico en paralelo
    this.pronosticosSvc.getAnalisis(id).subscribe({
      next: (res: any) => { this.analisis = res?.error ? null : res; },
      error: () => {},
    });

    this.pronosticosSvc.calcularPrediccion(id, 'suavizacion_exponencial', 6).subscribe({
      next: (res: any) => {
        this.resultados = Array.isArray(res) ? res : (res.predicciones ?? []);
        this.calculando = false;
        setTimeout(() => this.renderForecastChart(), 100);
      },
      error: (err) => {
        this.calculando = false;
        const e = err.error;
        this.errorCalculo = e?.error
          ? `${e.error}${e.periodos_disponibles !== undefined ? ` (disponibles: ${e.periodos_disponibles})` : ''}`
          : (err.error?.detail || 'Error al calcular el pronóstico.');
      },
    });
  }

  // ── Más vendidos ──────────────────────────────────────────────────────
  cargarMasVendidos() {
    this.loadingMasVendidos = true;
    this.pronosticosSvc.getMasVendidos().subscribe({
      next: (res: any) => {
        this.masVendidos = Array.isArray(res) ? res : (res.results ?? []);
        this.loadingMasVendidos = false;
        // No renderizar aquí — el tab puede estar oculto.
        // Se renderiza en onTabChange cuando el usuario abre el tab.
      },
      error: () => { this.loadingMasVendidos = false; },
    });
  }

  // ── Recomendaciones ───────────────────────────────────────────────────
  cargarRecomendaciones() {
    this.loadingRecomendaciones = true;
    this.pronosticosSvc.getRecomendaciones().subscribe({
      next: (res: any) => {
        this.recomendaciones = Array.isArray(res) ? res : (res.recomendaciones ?? []);
        this.aplicarFiltro();
        this.loadingRecomendaciones = false;
        // No renderizar aquí — el tab puede estar oculto.
      },
      error: () => { this.loadingRecomendaciones = false; },
    });
  }

  aplicarFiltro() {
    const f = this.filtroCodigo.trim().toLowerCase();
    this.recomendacionesFiltradas = f
      ? this.recomendaciones.filter(r =>
          (r.codigo ?? '').toLowerCase().includes(f) ||
          (r.descripcion ?? '').toLowerCase().includes(f))
      : [...this.recomendaciones];
    // Solo re-renderizar si el canvas ya existe en el DOM (tab visible)
    const canvas = document.getElementById('chartRecomendaciones');
    if (canvas) setTimeout(() => this.renderRecomendacionesChart(), 50);
  }

  recargar() {
    this.cargarTodo();
    this.resultados           = [];
    this.analisis             = null;
    this.errorCalculo         = null;
    this.articuloSeleccionado = null;
    this.articuloSearch       = '';
    this.filtroCodigo         = '';
    this.destroyCharts();
  }

  // ── Gráfica Forecast ──────────────────────────────────────────────────
  private renderForecastChart() {
    this.destroyChart('forecast');
    const canvas = document.getElementById('chartForecast') as HTMLCanvasElement;
    if (!canvas || !this.resultados.length) return;

    const labels  = this.resultados.map((r: any) => r.fecha ?? r.periodo ?? '');
    const valores  = this.resultados.map((r: any) => r.demanda_proyectada ?? 0);
    const stock    = this.articuloSeleccionado?.stock_actual ?? 0;

    this.chartForecast = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Demanda Proyectada',
            data: valores,
            backgroundColor: valores.map(v => v > stock ? 'rgba(230,81,0,0.75)' : 'rgba(57,73,171,0.75)'),
            borderColor:     valores.map(v => v > stock ? '#e65100' : '#1a237e'),
            borderWidth: 1,
            borderRadius: 6,
          },
          {
            label: 'Stock Actual',
            data: new Array(labels.length).fill(stock),
            type: 'line' as any,
            borderColor: '#2e7d32',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: `Pronóstico — ${this.articuloSeleccionado?.codigo ?? ''}`,
            font: { size: 14, weight: 'bold' },
          },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Unidades' } },
          x: { title: { display: true, text: 'Período' } },
        },
      },
    });
  }

  // ── Gráfica Más Vendidos ──────────────────────────────────────────────
  private renderMasVendidosChart() {
    this.destroyChart('masVendidos');
    const canvas = document.getElementById('chartMasVendidos') as HTMLCanvasElement;
    if (!canvas || !this.masVendidos.length) return;

    const top10  = this.masVendidos.slice(0, 10);
    const labels = top10.map((r: any) => r.articulo__codigo ?? r.codigo ?? '');
    const datos  = top10.map((r: any) => r.total_vendido ?? 0);
    const colors = ['#1a237e','#283593','#303f9f','#3949ab','#3f51b5',
                    '#5c6bc0','#7986cb','#9fa8da','#c5cae9','#e8eaf6'];

    this.chartMasVendidos = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Total Vendido',
          data: datos,
          backgroundColor: colors,
          borderRadius: 6,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Top 10 Artículos Más Vendidos', font: { size: 14, weight: 'bold' } },
        },
        scales: { x: { beginAtZero: true } },
      },
    });
  }

  // ── Gráfica Recomendaciones ───────────────────────────────────────────
  private renderRecomendacionesChart() {
    this.destroyChart('recomendaciones');
    const canvas = document.getElementById('chartRecomendaciones') as HTMLCanvasElement;
    const data   = this.recomendacionesFiltradas.filter(r => r.cantidad_recomendada > 0).slice(0, 15);
    if (!canvas || !data.length) return;

    const labels  = data.map((r: any) => r.codigo ?? '');
    const stock   = data.map((r: any) => r.stock_actual ?? 0);
    const demanda = data.map((r: any) => r.demanda_proyectada ?? 0);
    const recom   = data.map((r: any) => r.cantidad_recomendada ?? 0);

    this.chartRecomendaciones = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Stock Actual',          data: stock,   backgroundColor: 'rgba(57,73,171,0.7)',  borderRadius: 4 },
          { label: 'Demanda Proyectada',     data: demanda, backgroundColor: 'rgba(46,125,50,0.7)',  borderRadius: 4 },
          { label: 'Cantidad Recomendada',   data: recom,   backgroundColor: 'rgba(230,81,0,0.7)',   borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Recomendaciones de Compra', font: { size: 14, weight: 'bold' } },
        },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  // ── Destroy helpers ───────────────────────────────────────────────────
  private destroyChart(which: 'forecast' | 'masVendidos' | 'recomendaciones') {
    if (which === 'forecast'        && this.chartForecast)        { this.chartForecast.destroy();        this.chartForecast = null; }
    if (which === 'masVendidos'     && this.chartMasVendidos)     { this.chartMasVendidos.destroy();     this.chartMasVendidos = null; }
    if (which === 'recomendaciones' && this.chartRecomendaciones) { this.chartRecomendaciones.destroy(); this.chartRecomendaciones = null; }
  }

  private destroyCharts() {
    this.destroyChart('forecast');
    this.destroyChart('masVendidos');
    this.destroyChart('recomendaciones');
  }

  // ── Helpers UI ────────────────────────────────────────────────────────
  get maxDemanda(): number {
    if (!this.resultados.length) return 1;
    return Math.max(...this.resultados.map((r: any) => r.demanda_proyectada ?? 0));
  }

  getBarWidth(valor: number): number {
    const max = this.maxDemanda;
    return max > 0 ? Math.round((valor / max) * 100) : 0;
  }

  isHighDemand(valor: number): boolean {
    return valor > (this.articuloSeleccionado?.stock_actual ?? 0);
  }

  getPrioridadClass(p: string): string { return `prioridad-${p}`; }

  getPrioridadLabel(p: string): string {
    return ({ critico: '🔴 Crítico', alto: '🟠 Alto', medio: '🟡 Medio', bajo: '🟢 Bajo' } as any)[p] ?? p;
  }
}
