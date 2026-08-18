import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { AuditoriaService } from '../../core/services/auditoria.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  ],
  templateUrl: './auditoria.component.html',
  styleUrl: './auditoria.component.css',
})
export class AuditoriaComponent implements OnInit {
  private auditoriaSvc = inject(AuditoriaService);
  private cdr = inject(ChangeDetectorRef);

  // La tabla vive dentro de un @if(loading) que la destruye y recrea en cada carga,
  // así que MatSort/MatPaginator son instancias nuevas cada vez. Se conectan al
  // dataSource apenas Angular las crea, en vez de adivinar con un setTimeout.
  @ViewChild(MatPaginator) set paginatorRef(mp: MatPaginator | undefined) {
    if (mp) this.dataSource.paginator = mp;
  }

  @ViewChild(MatSort) set sortRef(ms: MatSort | undefined) {
    if (ms) this.dataSource.sort = ms;
  }

  displayedColumns = ['fecha', 'usuario', 'tipo_accion', 'descripcion', 'entidad', 'ip'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  error: string | null = null;

  filtroTipoAccion = '';
  filtroUsuarioId = '';

  tiposAccion = [
    { value: '',                  label: 'Todos' },
    { value: 'LOGIN',             label: 'Login' },
    { value: 'LOGOUT',            label: 'Logout' },
    { value: 'CREAR_USUARIO',     label: 'Crear Usuario' },
    { value: 'ACTUALIZAR_USUARIO',label: 'Actualizar Usuario' },
    { value: 'RESET_PASSWORD',    label: 'Reset Password' },
    { value: 'CUENTA_BLOQUEADA',  label: 'Cuenta Bloqueada' },
    { value: 'CREAR_ARTICULO',    label: 'Crear Artículo' },
    { value: 'ACTUALIZAR_ARTICULO', label: 'Actualizar Artículo' },
    { value: 'MOVIMIENTO_INVENTARIO', label: 'Movimiento Inventario' },
    { value: 'CREAR_ORDEN_COMPRA',label: 'Crear Orden Compra' },
    { value: 'RECIBIR_ORDEN_COMPRA', label: 'Recibir Orden' },
  ];

  ngOnInit() {
    this.cargarEventos();
  }

  cargarEventos() {
    this.loading = true;
    this.error = null;
    const params: any = {};
    if (this.filtroTipoAccion) params.tipo_accion = this.filtroTipoAccion;
    if (this.filtroUsuarioId)  params.usuario_id  = this.filtroUsuarioId;

    this.auditoriaSvc.getEventos(params).subscribe({
      next: (res: any) => {
        // Backend retorna { eventos: [...], total: N }
        const data = res?.eventos ?? (Array.isArray(res) ? res : []);
        this.dataSource.data = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los eventos de auditoría.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getAccionChip(accion: string): string {
    if (!accion) return 'chip-default';
    const a = accion.toUpperCase();
    if (a.includes('LOGIN'))    return 'chip-login';
    if (a.includes('LOGOUT'))   return 'chip-logout';
    if (a.includes('CREAR') || a.includes('CREATE')) return 'chip-crear';
    if (a.includes('ACTUALIZ') || a.includes('UPDATE')) return 'chip-actualizar';
    if (a.includes('ELIMIN') || a.includes('DELETE'))   return 'chip-eliminar';
    if (a.includes('IMPORT'))   return 'chip-importar';
    if (a.includes('BLOQUEA'))  return 'chip-eliminar';
    if (a.includes('RESET'))    return 'chip-actualizar';
    return 'chip-default';
  }

  getAccionLabel(accion: string): string {
    if (!accion) return '—';
    const map: any = {
      LOGIN: 'Login', LOGOUT: 'Logout',
      CREAR_USUARIO: 'Crear Usuario', ACTUALIZAR_USUARIO: 'Actualizar Usuario',
      RESET_PASSWORD: 'Reset Password', CUENTA_BLOQUEADA: 'Cuenta Bloqueada',
      CREAR_ARTICULO: 'Crear Artículo', ACTUALIZAR_ARTICULO: 'Actualizar Artículo',
      MOVIMIENTO_INVENTARIO: 'Movimiento', CREAR_ORDEN_COMPRA: 'Crear Orden',
      RECIBIR_ORDEN_COMPRA: 'Recibir Orden', CREAR_KIT: 'Crear Kit',
    };
    return map[accion] ?? accion;
  }
}
