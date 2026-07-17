import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { InventarioService } from '../../../core/services/inventario.service';

@Component({
  selector: 'app-articulo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './articulo-form.component.html',
  styleUrl: './articulo-form.component.css',
})
export class ArticuloFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private inventarioSvc = inject(InventarioService);
  private dialogRef = inject(MatDialogRef<ArticuloFormComponent>);
  private data = inject(MAT_DIALOG_DATA);

  saving = false;
  error: string | null = null;

  get isEdit(): boolean {
    return !!this.data?.id;
  }

  clasificacionesPeligro = [
    { value: 'no_peligroso', label: 'No peligroso' },
    { value: 'inflamable', label: 'Inflamable' },
    { value: 'corrosivo', label: 'Corrosivo' },
    { value: 'toxico', label: 'Tóxico' },
    { value: 'oxidante', label: 'Oxidante' },
    { value: 'irritante', label: 'Irritante' },
    { value: 'explosivo', label: 'Explosivo' },
  ];

  fichaSeguridadFile: File | null = null;
  fichaSeguridadActualUrl: string | null = null;

  tiposProducto = [
    { value: 'producto', label: 'Producto' },
    { value: 'kit', label: 'Kit' },
  ];

  form = this.fb.group({
    codigo: ['', Validators.required],
    descripcion: ['', Validators.required],
    categoria: [''],
    unidad_medida: ['unidad', Validators.required],
    tipo_producto: ['producto'],
    stock_minimo: [0],
    stock_maximo: [0],
    tiempo_reposicion_dias: [0],
    clasificacion_peligro: ['no_peligroso'],
    costo_pedido: [null as number | null],
    costo_mantenimiento_anual: [null as number | null],
  });

  ngOnInit() {
    if (this.data) {
      this.form.patchValue(this.data);
      this.fichaSeguridadActualUrl = this.data.ficha_seguridad ?? null;
    }
  }

  onFichaSeguridadSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fichaSeguridadFile = input.files?.[0] ?? null;
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = null;
    const payload: any = this.form.getRawValue();
    if (this.fichaSeguridadFile) {
      payload.ficha_seguridad = this.fichaSeguridadFile;
    }
    const op = this.isEdit
      ? this.inventarioSvc.actualizarArticulo(this.data.id, payload)
      : this.inventarioSvc.crearArticulo(payload);

    op.subscribe({
      next: () => {
        this.saving = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.detail || err.error?.message || 'Error al guardar el artículo.';
      },
    });
  }
}
