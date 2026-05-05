import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

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
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then(m => m.HomeComponent),
      },
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
        loadComponent: () =>
          import('./features/importacion/importacion.component').then(m => m.ImportacionComponent),
      },
      {
        path: 'auditoria',
        loadComponent: () =>
          import('./features/auditoria/auditoria.component').then(m => m.AuditoriaComponent),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
