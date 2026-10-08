import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

const MOBILE_BREAKPOINT = 1024;

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

  // En tablet/celular el sidebar pasa de "colapsar a iconos" (desktop) a
  // "overlay que se desliza sobre el contenido" — por eso arranca cerrado
  // ahí, para no tapar la pantalla completa al entrar.
  isMobile      = window.innerWidth <= MOBILE_BREAKPOINT;
  isSidebarOpen = !this.isMobile;
  showUserMenu  = false;

  @HostListener('window:resize')
  onResize() {
    const eraMobile = this.isMobile;
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    if (this.isMobile !== eraMobile) {
      this.isSidebarOpen = !this.isMobile;
    }
  }

  closeSidebarIfMobile() {
    if (this.isMobile) this.isSidebarOpen = false;
  }

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
    { label: 'Calculadora de precios', icon: 'calculate', route: '/inventario/calculadora',     adminOnly: false },
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
  /** true si el rol del usuario tiene el módulo de esa pantalla. */
  puede(ruta: string): boolean {
    return this.auth.puedeVerRuta(ruta);
  }

  /** true si puede ver al menos una de esas pantallas (para los títulos de sección). */
  puedeAlguna(...rutas: string[]): boolean {
    return rutas.some(ruta => this.auth.puedeVerRuta(ruta));
  }
   cerrarMenuUsuario() {
    if (this.showUserMenu) this.showUserMenu = false;
  }
  toggleSidebar()  { this.isSidebarOpen = !this.isSidebarOpen; }
  toggleUserMenu() { this.showUserMenu  = !this.showUserMenu; }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
