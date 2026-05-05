import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { PronosticosService } from '../../core/services/pronosticos.service';
import { InventarioService } from '../../core/services/inventario.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-pronosticos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatTabsModule,
  ],
  templateUrl: './pronosticos.component.html',
  styleUrl: './pronosticos.component.css',
})
export class PronosticosComponent implements OnInit {
  private pronosticosSvc = inject(PronosticosService);
  private inventarioSvc = inject(InventarioService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  articulosFiltrados: any[] = [];
  articuloSearch = '';
  articuloSeleccionado: any = null;
  private searchSubject = new Subject<string>();

  calculando = false;
  loadingRecomendaciones = false;
  loadingMasVendidos = false;

  resultados: any[] = [];
  recomendaciones: any[] = [];
  masVendidos: any[] = [];

  displayedColumnsResultados = ['periodo', 'prediccion', 'limite_inferior', 'limite_superior'];
  displayedColumnsMasVendidos = ['codigo', 'descripcion', 'total_vendido'];
  displayedColumnsRecomendaciones = ['articulo', 'cantidad_recomendada', 'motivo'];

  calcForm = this.fb.group({
    articulo_id: [null as number | null, Validators.required],
    modelo: ['suavizacion_exponencial', Validators.required],
    periodos: [6, [Validators.required, Validators.min(1), Validators.max(12)]],
  });

  ngOnInit() {
    this.cargarMasVendidos();
    this.cargarRecomendaciones();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q.length >= 2 ? this.inventarioSvc.getArticulos({ buscar: q }) : of({ results: [] }))
    ).subscribe((res: any) => {
      this.articulosFiltrados = Array.isArray(res) ? res : (res.results ?? []);
    });
  }

  onArticuloSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.articuloSearch = q;
    this.searchSubject.next(q);
  }

  seleccionarArticulo(art: any) {
    this.articuloSeleccionado = art;
    this.calcForm.patchValue({ articulo_id: art.id });
    this.articuloSearch = `${art.codigo} - ${art.descripcion}`;
  }

  calcular() {
    if (this.calcForm.invalid) {
      this.calcForm.markAllAsTouched();
      return;
    }
    const { articulo_id, modelo, periodos } = this.calcForm.getRawValue();
    this.calculando = true;
    this.resultados = [];
    this.pronosticosSvc.calcularPrediccion(articulo_id!, modelo!, periodos!).subscribe({
      next: (res: any) => {
        this.resultados = Array.isArray(res) ? res : (res.predicciones ?? res.resultados ?? [res]);
        this.calculando = false;
      },
      error: (err) => {
        this.calculando = false;
        const msg = err.error?.detail || 'Error al calcular el pronóstico.';
        this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'snack-error' });
      },
    });
  }

  cargarMasVendidos() {
    this.loadingMasVendidos = true;
    this.pronosticosSvc.getMasVendidos().subscribe({
      next: (res: any) => {
        this.masVendidos = Array.isArray(res) ? res : (res.results ?? []);
        this.loadingMasVendidos = false;
      },
      error: () => { this.loadingMasVendidos = false; },
    });
  }

  cargarRecomendaciones() {
    this.loadingRecomendaciones = true;
    this.pronosticosSvc.getRecomendaciones().subscribe({
      next: (res: any) => {
        this.recomendaciones = Array.isArray(res) ? res : (res.results ?? []);
        this.loadingRecomendaciones = false;
      },
      error: () => { this.loadingRecomendaciones = false; },
    });
  }
}
