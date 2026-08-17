import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isLoading    = false;
  errorMessage: string | null = null;
  hidePassword = true;

  loginForm = this.fb.nonNullable.group({
    correo:    ['', [Validators.required, Validators.email]],
    contrasena:['', [Validators.required, Validators.minLength(6)]],
    remember:  [false]
  });

  get emailControl()    { return this.loginForm.get('correo')!; }
  get passwordControl() { return this.loginForm.get('contrasena')!; }

  submit() {
    if (this.loginForm.invalid) return;
    this.isLoading    = true;
    this.errorMessage = null;

    const { correo, contrasena } = this.loginForm.getRawValue();

    this.auth.login({ correo, contrasena }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.auth.saveSession(res);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading    = false;
        this.errorMessage = 'Credenciales inválidas';
        this.cdr.detectChanges();
      }
    });
  }
}
