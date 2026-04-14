import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { LoginUseCase } from '../../application/use-cases/login.use-case';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly mode = signal<'login' | 'register'>('login');
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
    this.error.set(null);
    this.success.set(null);
    this.form.controls.password.reset('');
    this.form.controls.rememberMe.reset(false);
  }

  submit(): void {
    this.error.set(null);
    this.success.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, email, password } = this.form.getRawValue();
    this.isLoading.set(true);

    if (this.mode() === 'register') {
      if (!email) {
        this.isLoading.set(false);
        this.error.set('Email is required for registration.');
        return;
      }

      this.loginUseCase.register({ username, email, password }).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.success.set('Registration successful. Now sign in.');
          this.setMode('login');
        },
        error: (error: Error) => {
          this.isLoading.set(false);
          this.error.set(error.message);
        },
      });
      return;
    }

    this.loginUseCase.execute({ username, password }).subscribe({
      next: (result) => {
        this.authService.setTokens(result.accessToken, result.refreshToken);
        this.isLoading.set(false);
        this.success.set('Signed in successfully.');
        this.router.navigate(['/dashboard']);
      },
      error: (error: Error) => {
        this.isLoading.set(false);
        this.error.set(error.message);
      },
    });
  }
}
