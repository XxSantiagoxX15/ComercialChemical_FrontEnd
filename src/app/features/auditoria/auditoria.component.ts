import { Component, inject, OnInit, ViewChild } from '@angular/core';
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['fecha', 'usuario', 'tipo_accion', 'descripcion', 'ip'];
  dataSource = new MatTableDataSource<any>([]);
  loading = false;
  error: string | null = null;

  filtroTipoAccion = '';
  filtroUsuarioId = '';

  tiposAccion = [
    { value: '', label: 'Todos' },
    { value: 'crear', label: 'Crear' },
    { value: 'actualizar', label: 'Actualizar' },
    { value: 'eliminar', label: 'Eliminar' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'importar', label: 'Importar' },
  ];

  ngOnInit() {
    this.cargarEventos();
  }

  cargarEventos() {
    this.loading = true;
    this.error = null;
    const params: any = {};
    if (this.filtroTipoAccion) params.tipo_accion = this.filtroTipoAccion;
    if (this.filtroUsuarioId) params.usuario_id = this.filtroUsuarioId;

    this.auditoriaSvc.getEventos(params).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.results ?? []);
        this.dataSource.data = data;
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar los eventos de auditoría.';
        this.loading = false;
      },
    });
  }

  getAccionChip(accion: string): string {
    const map: any = {
      crear: 'chip-crear',
      actualizar: 'chip-actualizar',
      eliminar: 'chip-eliminar',
      login: 'chip-login',
      logout: 'chip-logout',
      importar: 'chip-importar',
    };
    return map[accion?.toLowerCase()] ?? 'chip-default';
  }

  getAccionLabel(accion: string): string {
    const map: any = {
      crear: 'Crear',
      actualizar: 'Actualizar',
      eliminar: 'Eliminar',
      login: 'Login',
      logout: 'Logout',
      importar: 'Importar',
    };
    return map[accion?.toLowerCase()] ?? accion;
  }
}
