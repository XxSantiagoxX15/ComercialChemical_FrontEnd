import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

/**
 * «¿Olvidaste tu contraseña?»: el usuario pide un código, lo recibe en su
 * correo y con él define una contraseña nueva. Es una pantalla pública.
 *
 * El estado va en signals para que la vista se actualice sola cuando responde
 * el backend (la app no usa zone.js).
 */
@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <main class="pagina">
      <div class="tarjeta">
        <img src="assets/images/LogoComercialFin.png" alt="Comercial Chemical" class="logo" />

        @if (error()) {
          <div class="mensaje error" role="alert">
            <mat-icon>error_outline</mat-icon> {{ error() }}
          </div>
        }
        @if (aviso()) {
          <div class="mensaje aviso" role="status">
            <mat-icon>mark_email_read</mat-icon> {{ aviso() }}
          </div>
        }

        @switch (paso()) {

          @case ('correo') {
            <h1>Recupera tu contraseña</h1>
            <p class="guia">Escribe el correo de tu cuenta y te enviaremos un código de 6 dígitos.</p>

            <form [formGroup]="formCorreo" (ngSubmit)="enviarCodigo()">
              <label for="correo">Correo electrónico</label>
              <input id="correo" type="email" formControlName="correo"
                     placeholder="usuario@empresa.com" autocomplete="email" />

              <button type="submit" class="principal" [disabled]="formCorreo.invalid || enviando()">
                {{ enviando() ? 'Enviando…' : 'Enviar código' }}
              </button>
            </form>
          }

          @case ('codigo') {
            <h1>Escribe el código</h1>
            <p class="guia">
              Si <strong>{{ correo }}</strong> está registrado, le llegó un código de 6 dígitos.
              Vence en {{ minutos() }} minutos.
            </p>

            <form [formGroup]="formCodigo" (ngSubmit)="cambiar()">
              <label for="codigo">Código</label>
              <input id="codigo" class="codigo" type="text" formControlName="codigo"
                     inputmode="numeric" maxlength="6" placeholder="000000"
                     autocomplete="one-time-code" />

              <label for="nueva">Contraseña nueva</label>
              <div class="con-boton">
                <input id="nueva" [type]="verPassword() ? 'text' : 'password'" formControlName="nueva"
                       placeholder="Mínimo 6 caracteres" autocomplete="new-password" />
                <button type="button" class="ver" (click)="verPassword.set(!verPassword())"
                        [attr.aria-label]="verPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                  <mat-icon>{{ verPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>

              <label for="confirmar">Repite la contraseña</label>
              <input id="confirmar" [type]="verPassword() ? 'text' : 'password'" formControlName="confirmar"
                     autocomplete="new-password" />
              @if (noCoinciden) {
                <div class="campo-error">Las dos contraseñas no son iguales.</div>
              }

              <button type="submit" class="principal"
                      [disabled]="formCodigo.invalid || noCoinciden || enviando()">
                {{ enviando() ? 'Guardando…' : 'Cambiar contraseña' }}
              </button>
            </form>

            <div class="secundarias">
              <button type="button" class="enlace" (click)="enviarCodigo(true)" [disabled]="enviando()">
                Enviar otro código
              </button>
              <button type="button" class="enlace" (click)="cambiarCorreo()">Usar otro correo</button>
            </div>
          }

          @case ('listo') {
            <mat-icon class="exito">check_circle</mat-icon>
            <h1>Contraseña actualizada</h1>
            <p class="guia">Ya puedes entrar con tu contraseña nueva.</p>
            <a routerLink="/login" class="principal">Ir a iniciar sesión</a>
          }
        }

        @if (paso() !== 'listo') {
          <a routerLink="/login" class="volver">Volver a iniciar sesión</a>
        }
      </div>
    </main>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .pagina {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 24px; background: #f0f2f8; font-family: 'Inter', 'Segoe UI', sans-serif;
    }
    .tarjeta {
      width: 100%; max-width: 420px; background: #fff; border-radius: 20px;
      padding: 28px 40px 32px; text-align: center; border-top: 4px solid #1a237e;
      box-shadow: 0 20px 60px rgba(26,35,126,0.12), 0 4px 16px rgba(0,0,0,0.06);
    }
    /* La imagen del logo trae mucho margen propio: los márgenes negativos lo compensan. */
    .logo { width: 230px; max-width: 80%; height: auto; margin: -38px 0 -48px; }
    h1 { margin: 0 0 8px; font-size: 1.45rem; font-weight: 800; color: #111827; }
    .guia { margin: 0 0 22px; font-size: 0.9rem; line-height: 1.55; color: #6b7280; }
    form { text-align: left; }
    label { display: block; margin: 14px 0 6px; font-size: 12.5px; font-weight: 600; color: #374151; }
    input {
      width: 100%; padding: 12px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px;
      font: inherit; font-size: 14px; color: #111827; background: #fafafa; outline: none;
    }
    input:focus { border-color: #1a237e; background: #fff; box-shadow: 0 0 0 3px rgba(26,35,126,0.1); }
    input.codigo { text-align: center; font-size: 24px; font-weight: 700; letter-spacing: 8px; }
    .con-boton { position: relative; }
    .con-boton input { padding-right: 44px; }
    .ver {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      display: flex; padding: 4px; border: 0; border-radius: 6px; background: none;
      color: #9ca3af; cursor: pointer;
    }
    .ver mat-icon { font-size: 19px; width: 19px; height: 19px; }
    .campo-error { margin-top: 5px; font-size: 11.5px; color: #dc2626; }
    .principal {
      display: block; width: 100%; margin-top: 22px; padding: 13px; border: 0; border-radius: 11px;
      background: linear-gradient(135deg, #1a237e, #3949ab); color: #fff;
      font: inherit; font-size: 14.5px; font-weight: 700; text-decoration: none; cursor: pointer;
    }
    .principal:disabled { opacity: 0.55; cursor: default; }
    .secundarias { display: flex; justify-content: space-between; gap: 12px; margin-top: 16px; }
    .enlace, .volver {
      border: 0; background: none; padding: 0; font: inherit; font-size: 12.5px;
      font-weight: 600; color: #1a237e; text-decoration: none; cursor: pointer;
    }
    .enlace:hover, .volver:hover { text-decoration: underline; }
    .enlace:disabled { opacity: 0.5; cursor: default; }
    .volver { display: inline-block; margin-top: 22px; color: #6b7280; }
    .mensaje {
      display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 10px 12px;
      border-radius: 10px; font-size: 13px; text-align: left;
    }
    .mensaje mat-icon { flex-shrink: 0; font-size: 18px; width: 18px; height: 18px; }
    .error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
    .aviso { background: #eef0fb; border: 1px solid #c5cae9; color: #1a237e; }
    .exito { font-size: 44px; width: 44px; height: 44px; color: #2e7d32; margin: 6px 0 4px; }
    button:focus-visible, a:focus-visible { outline: 3px solid #9fa8da; outline-offset: 2px; }
  `],
})
export class RecuperarPasswordComponent implements OnInit {
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);
  private route = inject(ActivatedRoute);

  paso        = signal<'correo' | 'codigo' | 'listo'>('correo');
  enviando    = signal(false);
  error       = signal<string | null>(null);
  aviso       = signal<string | null>(null);
  verPassword = signal(false);
  minutos     = signal(15);

  formCorreo = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
  });

  formCodigo = this.fb.nonNullable.group({
    codigo:    ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    nueva:     ['', [Validators.required, Validators.minLength(6)]],
    confirmar: ['', [Validators.required]],
  });

  get correo(): string {
    return this.formCorreo.controls.correo.value.trim();
  }

  get noCoinciden(): boolean {
    const { nueva, confirmar } = this.formCodigo.getRawValue();
    return confirmar.length > 0 && nueva !== confirmar;
  }

  ngOnInit() {
    // El botón del correo trae la dirección en el enlace: quien llega por ahí
    // ya tiene el código, así que pasa directo a escribirlo.
    const correo = this.route.snapshot.queryParamMap.get('correo');
    if (correo) {
      this.formCorreo.setValue({ correo });
      if (this.formCorreo.valid) this.paso.set('codigo');
    }
  }

  enviarCodigo(esReenvio = false) {
    if (this.formCorreo.invalid || this.enviando()) return;
    this.enviando.set(true);
    this.error.set(null);
    this.aviso.set(null);

    this.auth.solicitarCodigoPassword(this.correo).subscribe({
      next: (res) => {
        this.enviando.set(false);
        if (res?.minutos_validez) this.minutos.set(res.minutos_validez);
        this.paso.set('codigo');
        if (esReenvio) {
          this.aviso.set('Listo. Si pasó más de un minuto desde el anterior, te enviamos un código nuevo.');
        }
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(this.mensajeDeError(err));
      },
    });
  }

  cambiar() {
    if (this.formCodigo.invalid || this.noCoinciden || this.enviando()) return;
    this.enviando.set(true);
    this.error.set(null);
    this.aviso.set(null);

    const { codigo, nueva } = this.formCodigo.getRawValue();
    this.auth.restablecerPassword({ correo: this.correo, codigo, nueva_password: nueva }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.paso.set('listo');
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(this.mensajeDeError(err));
      },
    });
  }

  cambiarCorreo() {
    this.error.set(null);
    this.aviso.set(null);
    this.formCodigo.reset();
    this.paso.set('correo');
  }

  private mensajeDeError(err: any): string {
    if (err?.status === 0)   return 'No hay conexión con el servidor. Inténtalo de nuevo.';
    if (err?.status === 429) return 'Demasiados intentos. Espera un minuto y vuelve a probar.';
    const e = err?.error ?? {};
    return e.error
      ?? e.nueva_password?.[0] ?? e.codigo?.[0] ?? e.correo?.[0]
      ?? 'No se pudo completar la solicitud. Inténtalo de nuevo.';
  }
}