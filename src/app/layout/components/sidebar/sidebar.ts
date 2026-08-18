import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatExpansionModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  inventarioOpen = false;

  ngOnInit() {
    // Si no hay token válido, redirigir al login
    if (!this.auth.getToken()) {
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }

  get userRol(): string {
    const user = this.auth.getUser();
    // El login guarda user.rol como nombre del rol
    if (user?.rol && typeof user.rol === 'string') return user.rol;
    // Fallback: decodifica el JWT (tiene claim 'rol' como nombre)
    const token = this.auth.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol || '';
    } catch {
      return '';
    }
  }

  get isAdmin(): boolean {
    return this.userRol === 'Administrador';
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith('/' + path);
  }
}
