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

  get userRole(): string {
    const user = this.auth.getUser();
    return user?.rol || user?.rol_nombre || '';
  }

  menu = [
    { label: 'Inicio',       icon: '🏠', route: '/home' },
    { label: 'Dashboard',    icon: '📊', route: '/dashboard' },
    { label: 'Artículos',    icon: '📦', route: '/inventario/articulos' },
    { label: 'Movimientos',  icon: '🔄', route: '/inventario/movimientos' },
    { label: 'Alertas',      icon: '⚠️', route: '/inventario/alertas' },
    { label: 'Compras',      icon: '🛒', route: '/compras/ordenes' },
    { label: 'Pronósticos',  icon: '📈', route: '/pronosticos' },
    { label: 'Importación',  icon: '📂', route: '/importacion' },
    { label: 'Auditoría',    icon: '🔍', route: '/auditoria', adminOnly: true },
  ];

  get visibleMenu() {
    const user = this.auth.getUser();
    const isAdmin = user?.rol === 'Administrador';
    return this.menu.filter(m => !m['adminOnly'] || isAdmin);
  }

  toggleSidebar()  { this.isSidebarOpen = !this.isSidebarOpen; }
  toggleUserMenu() { this.showUserMenu  = !this.showUserMenu; }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
