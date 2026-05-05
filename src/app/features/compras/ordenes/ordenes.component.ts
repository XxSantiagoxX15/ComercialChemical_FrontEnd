import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ComprasService } from '../../../core/services/compras.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-ordenes',
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
    MatExpansionModule,
    MatDividerModule,
    MatAutocompleteModule,
  ],
  templateUrl: './ordenes.component.html',
  styleUrl: './ordenes.component.css',
})
export class OrdenesComponent implements OnInit {
  private comprasSvc = inject(ComprasService);
  private inventarioSvc = inject(InventarioService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['id', 'articulo', 'cantidad', 'precio', 'proveedor', 'estado', 'fecha', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  saving = false;
  error: string | null = null;
  filtroEstado = '';

  articulosFiltrados: any[] = [];
  articuloSearch = '';
  articuloSeleccionado: any = null;
  private searchSubject = new Subject<string>();

  ordenForm = this.fb.group({
    articulo: [null as number | null, Validators.required],
    cantidad_solicitada: [1, [Validators.required, Validators.min(1)]],
    precio_unitario: [0, Validators.min(0)],
    proveedor: [''],
    observaciones: [''],
  });

  ngOnInit() {
    this.cargarOrdenes();
    // Autocomplete de artículos — backend retorna { articulos: [...] }
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q.length >= 2 ? this.inventarioSvc.getArticulos({ buscar: q, limit: 20 }) : of({ articulos: [] }))
    ).subscribe((res: any) => {
      this.articulosFiltrados = res?.articulos ?? (Array.isArray(res) ? res : []);
    });
  }

  cargarOrdenes() {
    this.loading = true;
    this.error = null;
    const params: any = {};
    if (this.filtroEstado) params.estado = this.filtroEstado;
    this.comprasSvc.getOrdenes(params).subscribe({
      next: (res: any) => {
        // Backend retorna { ordenes: [...], total: N }
        const data = res?.ordenes ?? (Array.isArray(res) ? res : []);
        this.dataSource.data = data;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar las órdenes.';
        this.loading = false;
      },
    });
  }

  onArticuloSearch(event: Event) {
    const q = (event.target as HTMLInputElement).value;
    this.articuloSearch = q;
    this.searchSubject.next(q);
  }

  seleccionarArticulo(art: any) {
    this.articuloSeleccionado = art;
    this.ordenForm.patchValue({ articulo: art.id });
    this.articuloSearch = `${art.codigo} - ${art.descripcion}`;
  }

  crearOrden() {
    if (this.ordenForm.invalid) {
      this.ordenForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.comprasSvc.crearOrden(this.ordenForm.getRawValue()).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Orden creada correctamente', 'Cerrar', { duration: 3000 });
        this.ordenForm.reset({ cantidad_solicitada: 1, precio_unitario: 0 });
        this.articuloSearch = '';
        this.articuloSeleccionado = null;
        this.cargarOrdenes();
      },
      error: (err) => {
        this.saving = false;
        const msg = err.error?.detail || 'Error al crear la orden.';
        this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'snack-error' });
      },
    });
  }

  cambiarEstado(orden: any, estado: string) {
    this.comprasSvc.actualizarEstado(orden.id, estado).subscribe({
      next: () => {
        this.snackBar.open(`Orden ${estado} correctamente`, 'Cerrar', { duration: 3000 });
        this.cargarOrdenes();
      },
      error: (err) => {
        const msg = err.error?.detail || 'Error al actualizar el estado.';
        this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'snack-error' });
      },
    });
  }

  getEstadoChip(estado: string): string {
    const map: any = {
      pendiente: 'chip-pendiente',
      aprobada: 'chip-aprobada',
      rechazada: 'chip-rechazada',
      recibida: 'chip-recibida',
    };
    return map[estado] ?? '';
  }

  getEstadoLabel(estado: string): string {
    const map: any = {
      pendiente: 'Pendiente',
      aprobada: 'Aprobada',
      rechazada: 'Rechazada',
      recibida: 'Recibida',
    };
    return map[estado] ?? estado;
  }
}
