import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { InventarioService } from '../../../core/services/inventario.service';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';
import { Subject, Observable, of } from 'rxjs';

@Component({
  selector: 'app-movimientos',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatDividerModule,
    MatExpansionModule,
  ],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.css',
})
export class MovimientosComponent implements OnInit {
  private inventarioSvc = inject(InventarioService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns = ['fecha', 'articulo', 'tipo', 'cantidad', 'usuario', 'observaciones'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  saving = false;
  error: string | null = null;

  filtroTipo = '';
  filtroFechaDesde: Date | null = null;
  filtroFechaHasta: Date | null = null;

  // El listado tiene decenas de miles de filas (historial de Kardex importado),
  // así que ordenamiento y paginación se resuelven en el backend en vez de
  // traer todo al navegador y ordenar/paginar en el cliente.
  page = 1;
  pageSize = 50;
  total = 0;
  sortActive = 'fecha_movimiento';
  sortDirection: 'asc' | 'desc' = 'desc';

  articulosFiltrados: any[] = [];
  articuloSearch = '';

  movForm = this.fb.group({
    articulo_id: [null as number | null, Validators.required],
    tipo_movimiento: ['entrada', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    observaciones: [''],
    forzar: [false],
    numero_lote: [''],
    fecha_vencimiento: [null as Date | null],
  });

  get esEntrada(): boolean {
    return this.movForm.get('tipo_movimiento')?.value === 'entrada';
  }

  articuloSeleccionado: any = null;
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.cargarMovimientos();
    // Autocomplete de artículos — backend retorna { articulos: [...] }
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q.length >= 2 ? this.inventarioSvc.getArticulos({ buscar: q, limit: 20 }) : of({ articulos: [] }))
    ).subscribe((res: any) => {
      this.articulosFiltrados = res?.articulos ?? (Array.isArray(res) ? res : []);
      this.cdr.detectChanges();
    });
  }

  cargarMovimientos() {
    this.loading = true;
    this.error = null;
    const params: any = {
      page: this.page,
      limit: this.pageSize,
      ordering: (this.sortDirection === 'desc' ? '-' : '') + this.sortActive,
    };
    if (this.filtroTipo) params.tipo_movimiento = this.filtroTipo;
    if (this.filtroFechaDesde) params.fecha_desde = this.filtroFechaDesde.toISOString().split('T')[0];
    if (this.filtroFechaHasta) params.fecha_hasta = this.filtroFechaHasta.toISOString().split('T')[0];

    this.inventarioSvc.getMovimientos(params).subscribe({
      next: (res: any) => {
        // Backend retorna { movimientos: [...], total: N }
        const data = res?.movimientos ?? (Array.isArray(res) ? res : []);
        this.dataSource.data = data;
        this.total = res?.total ?? data.length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los movimientos.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  aplicarFiltro() {
    this.page = 1;
    this.cargarMovimientos();
  }

  onSortChange(sort: Sort) {
    if (sort.direction) {
      this.sortActive = sort.active;
      this.sortDirection = sort.direction as 'asc' | 'desc';
    } else {
      // Al quitar el orden (tercer clic) volvemos al orden por defecto
      // en vez de quedar en un estado "sin orden" que el backend no soporta.
      this.sortActive = 'fecha_movimiento';
      this.sortDirection = 'desc';
    }
    this.page = 1;
    this.cargarMovimientos();
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.cargarMovimientos();
  }

  onArticuloSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.articuloSearch = q;
    this.searchSubject.next(q);
  }

  seleccionarArticulo(articulo: any) {
    this.articuloSeleccionado = articulo;
    this.movForm.patchValue({ articulo_id: articulo.id });
    this.articuloSearch = `${articulo.codigo} - ${articulo.descripcion}`;
  }

  registrarMovimiento() {
    if (this.movForm.invalid) {
      this.movForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    const payload: any = this.movForm.getRawValue();
    if (payload.fecha_vencimiento instanceof Date) {
      payload.fecha_vencimiento = payload.fecha_vencimiento.toISOString().split('T')[0];
    }
    if (!this.esEntrada) {
      delete payload.numero_lote;
      delete payload.fecha_vencimiento;
    }
    this.inventarioSvc.registrarMovimiento(payload).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Movimiento registrado correctamente', 'Cerrar', { duration: 3000 });
        this.movForm.reset({ tipo_movimiento: 'entrada', cantidad: 1, forzar: false });
        this.articuloSeleccionado = null;
        this.articuloSearch = '';
        this.cargarMovimientos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        const msg = err.error?.detail || err.error?.message || 'Error al registrar el movimiento.';
        this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'snack-error' });
        this.cdr.detectChanges();
      },
    });
  }

  getTipoChip(tipo: string): string {
    if (tipo === 'entrada') return 'chip-entrada';
    if (tipo === 'salida') return 'chip-salida';
    return 'chip-ajuste';
  }

  getTipoLabel(tipo: string): string {
    const map: any = { entrada: 'Entrada', salida: 'Salida', ajuste: 'Ajuste' };
    return map[tipo] ?? tipo;
  }
}
