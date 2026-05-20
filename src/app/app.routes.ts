import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/components/layout-shell/layout-shell.component').then(m => m.LayoutShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'inventario/articulos',
        loadComponent: () =>
          import('./features/inventario/articulos/articulos-list.component').then(m => m.ArticulosListComponent),
      },
      {
        path: 'inventario/movimientos',
        loadComponent: () =>
          import('./features/inventario/movimientos/movimientos.component').then(m => m.MovimientosComponent),
      },
      {
        path: 'inventario/alertas',
        loadComponent: () =>
          import('./features/inventario/alertas/alertas.component').then(m => m.AlertasComponent),
      },
      {
        path: 'compras/ordenes',
        loadComponent: () =>
          import('./features/compras/ordenes/ordenes.component').then(m => m.OrdenesComponent),
      },
      {
        path: 'pronosticos',
        loadComponent: () =>
          import('./features/pronosticos/pronosticos.component').then(m => m.PronosticosComponent),
      },
      {
        path: 'importacion',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/importacion/importacion.component').then(m => m.ImportacionComponent),
      },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent),
      },
      {
        path: 'auditoria',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/auditoria/auditoria.component').then(m => m.AuditoriaComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
