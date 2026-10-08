import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, RUTA_SIN_PERMISOS } from '../../core/services/auth.service';

/**
 * Pantalla para un usuario cuyo rol no tiene ningún módulo activo: el logo de
 * la empresa y una explicación, en vez de cerrarle la sesión sin decir por qué.
 */
@Component({
  selector: 'app-sin-acceso',
  standalone: true,
  template: `
    <section class="sin-acceso">
      <img src="assets/images/LogoComercialFin.png" alt="Comercial Chemical" class="logo" />

      <h1>Todavía no tienes módulos asignados</h1>
      <p>
        Tu cuenta está activa, pero tu rol aún no tiene acceso a ninguna parte
        del sistema. Pide a un administrador que te habilite los módulos que
        necesitas.
      </p>

      <div class="acciones">
        <button type="button" class="primario" (click)="comprobar()" [disabled]="comprobando()">
          {{ comprobando() ? 'Comprobando…' : 'Volver a comprobar' }}
        </button>
        
      </div>

      @if (sinCambios()) {
        <p class="aviso" role="status">Tu rol sigue sin módulos asignados.</p>
      }
    </section>
  `,
  styles: [`
    .sin-acceso {
      max-width: 480px;
      margin: 6vh auto 0;
      padding: 0 20px;
      text-align: center;
      color: #37474f;
    }
    .logo {
      width: 260px;
      max-width: 70%;
      height: auto;
      margin-bottom: 4px;
    }
    h1 {
      font-size: 1.35rem;
      font-weight: 600;
      color: #1a237e;
      margin: 0 0 10px;
    }
    p { font-size: 0.95rem; line-height: 1.55; margin: 0 0 22px; }
    .acciones { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    button {
      font: inherit;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid #c5cae9;
      background: #fff;
      color: #1a237e;
    }
    button.primario { background: #1a237e; border-color: #1a237e; color: #fff; }
    button:disabled { opacity: 0.6; cursor: default; }
    button:focus-visible { outline: 3px solid #9fa8da; outline-offset: 2px; }
    .aviso { margin: 16px 0 0; font-size: 0.85rem; color: #78909c; }
  `],
})
export class SinAccesoComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);

  // Signals: la pantalla se redibuja sola cuando llega la respuesta del
  // backend (la app no usa zone.js).
  comprobando = signal(false);
  sinCambios = signal(false);

  ngOnInit() {
    // Si alguien llega aquí teniendo módulos (o el Administrador ya se los
    // dio), se le lleva directo a su primera pantalla.
    this.comprobar(false);
  }

  comprobar(avisar = true) {
    this.comprobando.set(true);
    this.sinCambios.set(false);
    this.auth.refrescarPerfil().subscribe({
      next: () => this.terminar(avisar),
      error: () => this.terminar(avisar),
    });
  }

  private terminar(avisar: boolean) {
    this.comprobando.set(false);
    const destino = this.auth.rutaInicial();
    if (destino !== RUTA_SIN_PERMISOS) this.router.navigateByUrl(destino);
    else this.sinCambios.set(avisar);
  }
}