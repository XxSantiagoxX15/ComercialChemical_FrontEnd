import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ImportacionService } from '../../core/services/importacion.service';

@Component({
  selector: 'app-importacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTabsModule,
  ],
  templateUrl: './importacion.component.html',
  styleUrl: './importacion.component.css',
})
export class ImportacionComponent implements OnInit {
  private importacionSvc = inject(ImportacionService);
  private snackBar = inject(MatSnackBar);

  tipoActivo: 'toma_inventario' | 'ventas_cliente' = 'toma_inventario';
  archivoSeleccionado: File | null = null;
  uploading = false;
  uploadResult: any = null;

  historial: any[] = [];
  loadingHistorial = false;

  displayedColumnsHistorial = ['fecha', 'tipo', 'archivo', 'estado', 'registros'];

  ngOnInit() {
    this.cargarHistorial();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      this.uploadResult = null;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.archivoSeleccionado = files[0];
      this.uploadResult = null;
    }
  }

  subir() {
    if (!this.archivoSeleccionado) return;
    this.uploading = true;
    this.uploadResult = null;

    // Mapear el tipo interno al formato que espera el backend
    const tipoMap: any = {
      'toma_inventario': 'Informe_Toma_Inventario',
      'ventas_cliente': 'Informe_Ventas_Cliente',
    };
    const tipoBackend = tipoMap[this.tipoActivo];

    this.importacionSvc.uploadFile(this.archivoSeleccionado, tipoBackend).subscribe({
      next: (res: any) => {
        this.uploading = false;
        this.uploadResult = { tipo: 'exito', mensaje: res.mensaje ?? res.message ?? 'Archivo procesado correctamente.', detalle: res };
        this.archivoSeleccionado = null;
        this.cargarHistorial();
        this.snackBar.open('Archivo importado correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.uploading = false;
        const msg = err.error?.detail || err.error?.mensaje || 'Error al procesar el archivo.';
        this.uploadResult = { tipo: 'error', mensaje: msg };
        this.snackBar.open(msg, 'Cerrar', { duration: 5000, panelClass: 'snack-error' });
      },
    });
  }

  cargarHistorial() {
    this.loadingHistorial = true;
    this.importacionSvc.getHistorial().subscribe({
      next: (res: any) => {
        this.historial = Array.isArray(res) ? res : (res.results ?? []);
        this.loadingHistorial = false;
      },
      error: () => { this.loadingHistorial = false; },
    });
  }

  getEstadoChip(estado: string): string {
    if (estado === 'exito' || estado === 'exitoso' || estado === 'completado') return 'chip-ok';
    if (estado === 'parcial') return 'chip-warn';
    return 'chip-error';
  }

  getEstadoLabel(estado: string): string {
    const map: any = {
      exito: 'Exitoso',
      exitoso: 'Exitoso',
      completado: 'Completado',
      parcial: 'Parcial',
      error: 'Error',
      fallido: 'Fallido'
    };
    return map[estado] ?? estado;
  }

  getTipoLabel(tipo: string): string {
    const map: any = { toma_inventario: 'Toma de Inventario', ventas_cliente: 'Ventas por Cliente' };
    return map[tipo] ?? tipo;
  }
}
