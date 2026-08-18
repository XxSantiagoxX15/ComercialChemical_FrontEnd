import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuariosService } from '../../core/services/usuarios.service';
import { UsuarioFormComponent } from './usuario-form.component';
import { PermisosRolComponent } from './permisos-rol.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatDialogModule, MatSnackBarModule, MatTooltipModule,
    MatSlideToggleModule, MatDividerModule, MatProgressSpinnerModule,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit {
  private usuariosSvc = inject(UsuariosService);
  private dialog      = inject(MatDialog);
  private snackBar    = inject(MatSnackBar);
  private cdr         = inject(ChangeDetectorRef);

  // La tabla vive dentro de un @if(loading) que la destruye y recrea en cada carga,
  // así que MatSort/MatPaginator son instancias nuevas cada vez. Se conectan al
  // dataSource apenas Angular las crea, en vez de adivinar con un setTimeout.
  @ViewChild(MatPaginator) set paginatorRef(mp: MatPaginator | undefined) {
    if (mp) this.dataSource.paginator = mp;
  }

  @ViewChild(MatSort) set sortRef(ms: MatSort | undefined) {
    if (ms) this.dataSource.sort = ms;
  }

  displayedColumns = ['nombre', 'email', 'rol', 'activo', 'fecha_creacion', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  error: string | null = null;
  busqueda = '';

  ngOnInit() { this.cargarUsuarios(); }

  cargarUsuarios() {
    this.loading = true;
    this.error   = null;
    this.usuariosSvc.getUsuarios().subscribe({
      next: (res: any) => {
        const data = res?.usuarios ?? (Array.isArray(res) ? res : []);
        this.dataSource.data = data;
        if (this.busqueda) {
          this.dataSource.filter = this.busqueda.trim().toLowerCase();
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error   = `Error al cargar usuarios. (${err.status})`;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onBuscar(event: Event) {
    this.busqueda = (event.target as HTMLInputElement).value;
    this.dataSource.filter = this.busqueda.trim().toLowerCase();
  }

  abrirFormulario(usuario?: any) {
    const ref = this.dialog.open(UsuarioFormComponent, {
      width: '520px',
      data: usuario ?? null,
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.cargarUsuarios();
        this.snackBar.open(
          usuario ? 'Usuario actualizado' : 'Usuario creado',
          'Cerrar', { duration: 3000 }
        );
      }
      this.cdr.detectChanges();
    });
  }

  abrirPermisos() {
    const ref = this.dialog.open(PermisosRolComponent, {
      width: '660px',
      maxHeight: '90vh',
      disableClose: false,
    });
    ref.afterClosed().subscribe(huboCambios => {
      if (huboCambios) {
        this.snackBar.open('Permisos de roles actualizados', 'Cerrar', { duration: 3000 });
      }
      this.cdr.detectChanges();
    });
  }

  toggleActivo(usuario: any) {
    this.usuariosSvc.actualizarUsuario(usuario.id, { activo: !usuario.activo }).subscribe({
      next: () => {
        this.snackBar.open(
          `Usuario ${!usuario.activo ? 'activado' : 'desactivado'}`,
          'Cerrar', { duration: 3000 }
        );
        this.cargarUsuarios();
        this.cdr.detectChanges();
      },
      error: () => { this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 }); this.cdr.detectChanges(); },
    });
  }

  resetPassword(usuario: any) {
    const nueva = prompt(`Nueva contraseña para ${usuario.nombre_completo}:`);
    if (!nueva || nueva.length < 6) {
      this.snackBar.open('La contraseña debe tener al menos 6 caracteres', 'Cerrar', { duration: 3000 });
      return;
    }
    this.usuariosSvc.resetPassword(usuario.id, nueva).subscribe({
      next: () => { this.snackBar.open('Contraseña restablecida', 'Cerrar', { duration: 3000 }); this.cdr.detectChanges(); },
      error: () => { this.snackBar.open('Error al restablecer contraseña', 'Cerrar', { duration: 3000 }); this.cdr.detectChanges(); },
    });
  }

  getRolChip(rol: string): string {
    if (rol === 'Administrador')        return 'chip-admin';
    if (rol === 'Analista_Inventarios') return 'chip-analista';
    if (rol === 'Responsable_Compras')  return 'chip-compras';
    return 'chip-default';
  }
}
