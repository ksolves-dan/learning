import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="max-w-md mx-auto bg-secondary p-8 rounded-lg shadow-xl">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium mb-1">Email</label>
          <input type="email" id="email" formControlName="email" class="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-primary-foreground focus:outline-none focus:ring-2 focus:ring-accent">
          <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="mt-1 text-red-500 text-xs">
            <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
            <span *ngIf="loginForm.get('email')?.errors?.['email']">Invalid email format</span>
          </p>
        </div>
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium mb-1">Password</label>
          <input type="password" id="password" formControlName="password" class="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-primary-foreground focus:outline-none focus:ring-2 focus:ring-accent">
          <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="mt-1 text-red-500 text-xs">
            <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
            <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters long</span>
          </p>
        </div>
        <button type="submit" [disabled]="loginForm.invalid || isLoading" class="w-full bg-accent text-white py-2 px-4 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <p class="mt-4 text-center">
        Don't have an account? <a routerLink="/register" class="text-accent hover:underline">Register here</a>
      </p>
      <p *ngIf="error" class="mt-4 text-red-500 text-center">{{ error }}</p>
    </div>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = null;
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/blogs']);
        },
        error: (err) => {
          this.error = 'Invalid credentials';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}

