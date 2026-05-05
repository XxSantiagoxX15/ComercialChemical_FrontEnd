import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private auth = inject(AuthService);
  private router = inject(Router);

  get userName(): string {
    // Primero intenta desde los datos guardados en sesión
    const user = this.auth.getUser();
    if (user?.nombre_completo) return user.nombre_completo;
    // Fallback: decodifica el JWT
    const token = this.auth.getToken();
    if (!token) return 'Usuario';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nombre_completo || payload.name || payload.email || 'Usuario';
    } catch {
      return 'Usuario';
    }
  }

  get userEmail(): string {
    const user = this.auth.getUser();
    if (user?.email) return user.email;
    const token = this.auth.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || '';
    } catch {
      return '';
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
