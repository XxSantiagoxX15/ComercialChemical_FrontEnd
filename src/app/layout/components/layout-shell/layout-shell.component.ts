import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout-shell.component.html',
  styleUrls: ['./layout-shell.component.css']
})
export class LayoutShellComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  isSidebarOpen = true;
  showUserMenu  = false;

  get userName(): string {
    const user = this.auth.getUser();
    return user?.nombre_completo || user?.nombre || user?.email || 'Usuario';
  }

  get userEmail(): string {
    const user = this.auth.getUser();
    return user?.email || '';
  }

  get userRole(): string {
    const user = this.auth.getUser();
    const rol = user?.rol || user?.rol_nombre || '';
    const map: Record<string, string> = {
      'Administrador':        'Administrador',
      'Analista_Inventarios': 'Analista de Inventarios',
      'Responsable_Compras':  'Responsable de Compras',
    };
    return map[rol] ?? rol;
  }

  menu = [
    { label: 'Dashboard',    icon: 'dashboard',           route: '/dashboard',               adminOnly: false },
    { label: 'Artículos',    icon: 'inventory_2',         route: '/inventario/articulos',    adminOnly: false },
    { label: 'Movimientos',  icon: 'swap_horiz',          route: '/inventario/movimientos',  adminOnly: false },
    { label: 'Alertas',      icon: 'notifications_active',route: '/inventario/alertas',      adminOnly: false },
    { label: 'Compras',      icon: 'shopping_cart',       route: '/compras/ordenes',         adminOnly: false },
    { label: 'Cotizador',    icon: 'request_quote',       route: '/compras/cotizador',       adminOnly: false },
    { label: 'Pronósticos',  icon: 'trending_up',         route: '/pronosticos',             adminOnly: false },
    { label: 'Importación',  icon: 'upload_file',         route: '/importacion',             adminOnly: false },
    { label: 'Auditoría',    icon: 'manage_search',       route: '/auditoria',               adminOnly: true  },
    { label: 'Usuarios',     icon: 'group',               route: '/usuarios',                adminOnly: true  },
  ];

  get visibleMenu() {
    const user = this.auth.getUser();
    const rol = user?.rol ?? user?.rol_nombre ?? user?.role ?? '';
    const isAdmin = rol === 'Administrador';
    return this.menu.filter(m => !m['adminOnly'] || isAdmin);
  }

  get isAdmin(): boolean {
    const user = this.auth.getUser();
    const rol = user?.rol ?? user?.rol_nombre ?? user?.role ?? '';
    return rol === 'Administrador';
  }

  toggleSidebar()  { this.isSidebarOpen = !this.isSidebarOpen; }
  toggleUserMenu() { this.showUserMenu  = !this.showUserMenu; }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
