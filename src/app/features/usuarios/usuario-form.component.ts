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
import { UsuariosService } from '../../core/services/usuarios.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">

        <mat-form-field appearance="outline" class="full">
          <mat-label>Nombre completo</mat-label>
          <input matInput formControlName="nombre_completo" placeholder="Ej: Juan Pérez">
          <mat-error *ngIf="form.get('nombre_completo')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Correo electrónico</mat-label>
          <input matInput formControlName="email" type="email" placeholder="usuario@empresa.com">
          <mat-error *ngIf="form.get('email')?.hasError('required')">Requerido</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">Correo inválido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Rol</mat-label>
          <mat-select formControlName="rol_id">
            @for (rol of roles; track rol.id) {
              <mat-option [value]="rol.id">{{ rol.nombre }}</mat-option>
            }
          </mat-select>
          <mat-error *ngIf="form.get('rol_id')?.hasError('required')">Requerido</mat-error>
        </mat-form-field>

        @if (!data) {
          <mat-form-field appearance="outline" class="full">
            <mat-label>Contraseña</mat-label>
            <input matInput formControlName="password" type="password" placeholder="Mínimo 6 caracteres">
            <mat-error *ngIf="form.get('password')?.hasError('required')">Requerida</mat-error>
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
          </mat-form-field>
        }

        @if (error) {
          <div class="error-msg">{{ error }}</div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary"
              (click)="guardar()" [disabled]="form.invalid || saving">
        @if (saving) { <mat-spinner diameter="18" style="display:inline-block"></mat-spinner> }
        {{ data ? 'Actualizar' : 'Crear' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid { display: flex; flex-direction: column; gap: 4px; min-width: 400px; padding-top: 8px; }
    .full { width: 100%; }
    .error-msg { color: #c62828; font-size: 13px; padding: 8px; background: #ffebee; border-radius: 6px; }
  `]
})
export class UsuarioFormComponent implements OnInit {
  private fb          = inject(FormBuilder);
  private svc         = inject(UsuariosService);
  private dialogRef   = inject(MatDialogRef<UsuarioFormComponent>);
  data                = inject(MAT_DIALOG_DATA);

  saving = false;
  error: string | null = null;
  roles: any[] = [];

  form = this.fb.group({
    nombre_completo: ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    rol_id:          [null as number | null, Validators.required],
    password:        ['', this.data ? [] : [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit() {
    // Cargar roles desde el backend
    this.svc.getRoles().subscribe((roles: any[]) => {
      this.roles = roles;
    });

    // Si es edición, cargar los datos del usuario
    if (this.data) {
      this.form.patchValue({
        nombre_completo: this.data.nombre_completo,
        email:           this.data.email,
        rol_id:          this.data.rol,
      });
    }
  }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.error  = null;

    const val = this.form.getRawValue();

    const obs = this.data
      ? this.svc.actualizarUsuario(this.data.id, {
          nombre_completo: val.nombre_completo,
          rol_id: val.rol_id,
        })
      : this.svc.crearUsuario({
          nombre_completo: val.nombre_completo,
          email:           val.email,
          password:        val.password,
          rol_id:          val.rol_id,
        });

    obs.subscribe({
      next: () => { this.saving = false; this.dialogRef.close(true); },
      error: (err) => {
        this.saving = false;
        const msg = err.error?.email?.[0] || err.error?.detail || err.error?.error || 'Error al guardar';
        this.error = msg;
      },
    });
  }
}
