import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ComprasService } from '../../../core/services/compras.service';

@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './proveedor-form.component.html',
  styleUrl: './proveedor-form.component.css',
})
export class ProveedorFormComponent {
  private fb = inject(FormBuilder);
  private comprasSvc = inject(ComprasService);
  private dialogRef = inject(MatDialogRef<ProveedorFormComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private cdr = inject(ChangeDetectorRef);

  saving = false;
  error: string | null = null;

  get isEdit(): boolean {
    return !!this.data?.id;
  }

  form = this.fb.group({
    nombre: ['', Validators.required],
    nit: [''],
    contacto: [''],
    telefono: [''],
    email: ['', Validators.email],
  });

  ngOnInit() {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = null;
    const payload = this.form.getRawValue();
    const op = this.isEdit
      ? this.comprasSvc.actualizarProveedor(this.data.id, payload)
      : this.comprasSvc.crearProveedor(payload);

    op.subscribe({
      next: () => {
        this.saving = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.nombre?.[0] || err.error?.detail || err.error?.message || 'Error al guardar el proveedor.';
        this.cdr.detectChanges();
      },
    });
  }
}
