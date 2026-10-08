import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuariosService } from '../../core/services/usuarios.service';

@Component({
  selector: 'app-permisos-rol',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, MatTabsModule, MatSlideToggleModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatDividerModule, MatSnackBarModule, MatTooltipModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon class="title-icon">security</mat-icon>
      Gestión de Permisos por Rol
      <span class="title-spacer"></span>
      <button mat-icon-button
              (click)="cargarPermisos()"
              matTooltip="Recargar permisos"
              class="refresh-btn">
        <mat-icon [class.spinning]="loading">refresh</mat-icon>
      </button>
    </h2>

    <mat-dialog-content class="dialog-content">
      @if (loading) {
        <div class="loading-center">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else {
        <mat-tab-group animationDuration="200ms" class="roles-tabs">
          @for (rolData of rolesPermisos; track rolData.rol_id) {
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon class="tab-icon" [class]="getRolColorClass(rolData.rol_nombre)">
                  {{ getRolIcon(rolData.rol_nombre) }}
                </mat-icon>
                {{ getRolLabel(rolData.rol_nombre) }}
              </ng-template>

              <div class="tab-body">
                @if (rolData.rol_nombre === 'Administrador') {
                  <div class="admin-notice">
                    <mat-icon>lock</mat-icon>
                    <span>El Administrador tiene acceso total a todos los módulos y no puede modificarse.</span>
                  </div>
                } @else {
                  <p class="rol-desc">
                    {{ rolData.descripcion || 'Configure los módulos a los que tiene acceso este rol.' }}
                  </p>
                }

                <div class="modulos-grid">
                  @for (mod of MODULOS; track mod.key) {
                    <div class="modulo-row" [class.is-locked]="rolData.rol_nombre === 'Administrador'">
                      <div class="modulo-left">
                        <div class="modulo-icon-wrap">
                          <mat-icon>{{ mod.icon }}</mat-icon>
                        </div>
                        <div class="modulo-info">
                          <span class="modulo-label">{{ mod.label }}</span>
                          <span class="modulo-sublabel">{{ mod.desc }}</span>
                        </div>
                      </div>
                      <mat-slide-toggle
                        color="primary"
                        [checked]="rolData.permisos[mod.key]"
                        [disabled]="rolData.rol_nombre === 'Administrador' || saving"
                        (change)="onToggle(rolData, mod.key, $event.checked)">
                      </mat-slide-toggle>
                    </div>
                  }
                </div>
              </div>
            </mat-tab>
          }
        </mat-tab-group>
      }

      @if (error) {
        <div class="error-banner">
          <mat-icon>error_outline</mat-icon>
          {{ error }}
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      @if (hasCambios) {
        <span class="changes-hint">
          <mat-icon>edit_note</mat-icon> Cambios sin guardar
        </span>
      }
      <button mat-stroked-button [mat-dialog-close]="hasCambios">Cerrar</button>
      <button mat-raised-button color="primary"
              (click)="guardarTodo()"
              [disabled]="saving || loading || !hasCambios">
        @if (saving) {
          <mat-spinner diameter="18" class="btn-spinner"></mat-spinner>
        } @else {
          <mat-icon>save</mat-icon>
        }
        Guardar Cambios
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex; align-items: center; gap: 10px;
      color: #1a237e; font-size: 1.2rem; font-weight: 600;
      margin: 0; padding: 20px 24px 4px;
    }
    .title-icon { color: #3949ab; font-size: 26px; width: 26px; height: 26px; }
    .title-spacer { flex: 1; }
    .refresh-btn { color: #3949ab; }
    .refresh-btn:hover { background: #e8eaf6; }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .spinning { animation: spin 0.8s linear infinite; }

    .dialog-content {
      min-width: 580px; max-height: 68vh;
      padding: 8px 24px 0; overflow-y: auto;
    }

    .loading-center {
      display: flex; justify-content: center; align-items: center; padding: 5rem;
    }

    /* Tabs */
    .roles-tabs { margin-top: 4px; }
    .tab-icon {
      font-size: 18px; width: 18px; height: 18px;
      margin-right: 6px; vertical-align: middle;
    }
    .color-admin    { color: #1a237e; }
    .color-analista { color: #2e7d32; }
    .color-compras  { color: #e65100; }

    /* Tab body */
    .tab-body { padding: 16px 4px 8px; }

    .admin-notice {
      display: flex; align-items: flex-start; gap: 10px;
      background: #e8eaf6; color: #1a237e;
      border-radius: 8px; padding: 12px 14px;
      font-size: 0.875rem; margin-bottom: 16px; line-height: 1.4;
    }
    .admin-notice mat-icon { flex-shrink: 0; margin-top: 1px; }

    .rol-desc { color: #666; font-size: 0.875rem; margin: 0 0 14px; }

    /* Modules grid */
    .modulos-grid { display: flex; flex-direction: column; }

    .modulo-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 10px; border-radius: 8px;
      transition: background 0.15s ease;
    }
    .modulo-row:hover:not(.is-locked) { background: #f0f2ff; }
    .modulo-row.is-locked { opacity: 0.7; }

    .modulo-left { display: flex; align-items: center; gap: 12px; }

    .modulo-icon-wrap {
      width: 38px; height: 38px; border-radius: 9px;
      background: #e8eaf6; display: flex; align-items: center;
      justify-content: center; color: #3949ab; flex-shrink: 0;
    }
    .modulo-icon-wrap mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .modulo-info { display: flex; flex-direction: column; }
    .modulo-label { font-size: 0.9rem; font-weight: 500; color: #222; line-height: 1.3; }
    .modulo-sublabel { font-size: 0.75rem; color: #888; }

    /* Error */
    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: #ffebee; color: #c62828;
      border-radius: 8px; padding: 10px 14px;
      font-size: 0.875rem; margin-top: 12px;
    }

    /* Actions */
    .dialog-actions { padding: 12px 24px 16px; gap: 8px; border-top: 1px solid #e0e0e0; }
    .changes-hint {
      display: flex; align-items: center; gap: 4px;
      color: #e65100; font-size: 0.8rem; flex: 1;
    }
    .btn-spinner { display: inline-flex; margin-right: 6px; }
  `],
})
export class PermisosRolComponent implements OnInit {
  private svc       = inject(UsuariosService);
  private snackBar  = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<PermisosRolComponent>);
  private cdr       = inject(ChangeDetectorRef);

  rolesPermisos: any[] = [];
  pendingChanges = new Map<number, Record<string, boolean>>();
  loading = false;
  saving  = false;
  error: string | null = null;

  readonly MODULOS = [
    { key: 'dashboard',              label: 'Dashboard',                desc: 'Vista general y métricas',     icon: 'dashboard' },
    { key: 'calculadora_precios',    label: 'Calculadora de precios',   desc: 'Costos, márgenes y precios',    icon: 'calculate' },
    { key: 'inventario_articulos',   label: 'Inventario - Artículos',   desc: 'Catálogo de productos',         icon: 'inventory_2' },
    { key: 'inventario_movimientos', label: 'Inventario - Movimientos', desc: 'Entradas y salidas de stock',   icon: 'swap_vert' },
    { key: 'inventario_alertas',     label: 'Inventario - Alertas',     desc: 'Notificaciones de stock bajo',  icon: 'notifications' },
    { key: 'compras',                label: 'Compras',                  desc: 'Órdenes de compra',             icon: 'shopping_cart' },
    { key: 'pronosticos',            label: 'Pronósticos',              desc: 'Análisis y predicciones',       icon: 'trending_up' },
    { key: 'importacion',            label: 'Importación',              desc: 'Carga masiva de datos',         icon: 'upload_file' },
    { key: 'auditoria',              label: 'Auditoría',                desc: 'Registro de actividad',         icon: 'history' },
    { key: 'usuarios',               label: 'Usuarios',                 desc: 'Gestión de cuentas y roles',    icon: 'group' },
  ];

  get hasCambios(): boolean {
    return this.pendingChanges.size > 0;
  }

  ngOnInit() {
    this.cargarPermisos();
  }

  cargarPermisos() {
    this.loading = true;
    this.error   = null;
    this.svc.getPermisos().subscribe({
      next: (data: any[]) => {
        this.rolesPermisos = data;
        this.pendingChanges.clear();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = 'Error al cargar los permisos. Verifique su conexión.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onToggle(rolData: any, modulo: string, checked: boolean) {
    rolData.permisos[modulo] = checked;
    this.pendingChanges.set(rolData.rol_id, { ...rolData.permisos });
  }

  guardarTodo() {
    if (!this.hasCambios) return;
    this.saving = true;
    this.error  = null;

    const requests = Array.from(this.pendingChanges.entries()).map(([rolId, permisos]) =>
      this.svc.actualizarPermisos(rolId, permisos)
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.saving = false;
        this.pendingChanges.clear();
        this.snackBar.open('Permisos actualizados correctamente', 'Cerrar', { duration: 3500 });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.error || 'Error al guardar los permisos.';
        this.cdr.detectChanges();
      },
    });
  }

  getRolLabel(nombre: string): string {
    const labels: Record<string, string> = {
      'Administrador':        'Administrador',
      'Analista_Inventarios': 'Analista de Inventarios',
      'Responsable_Compras':  'Resp. de Compras',
    };
    return labels[nombre] ?? nombre;
  }

  getRolIcon(nombre: string): string {
    const icons: Record<string, string> = {
      'Administrador':        'admin_panel_settings',
      'Analista_Inventarios': 'analytics',
      'Responsable_Compras':  'shopping_bag',
    };
    return icons[nombre] ?? 'person';
  }

  getRolColorClass(nombre: string): string {
    const classes: Record<string, string> = {
      'Administrador':        'color-admin',
      'Analista_Inventarios': 'color-analista',
      'Responsable_Compras':  'color-compras',
    };
    return classes[nombre] ?? '';
  }
}
