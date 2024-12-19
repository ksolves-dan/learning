import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <div class="max-w-md mx-auto bg-secondary p-8 rounded-lg shadow-xl">
      <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium mb-1">Name</label>
          <input type="text" id="name" formControlName="name" class="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-primary-foreground focus:outline-none focus:ring-2 focus:ring-accent">
          <p *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched" class="mt-1 text-red-500 text-xs">Name is required</p>
        </div>
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium mb-1">Email</label>
          <input type="email" id="email" formControlName="email" class="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-primary-foreground focus:outline-none focus:ring-2 focus:ring-accent">
          <p *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="mt-1 text-red-500 text-xs">
            <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
            <span *ngIf="registerForm.get('email')?.errors?.['email']">Invalid email format</span>
          </p>
        </div>
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium mb-1">Password</label>
          <input type="password" id="password" formControlName="password" class="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-primary-foreground focus:outline-none focus:ring-2 focus:ring-accent">
          <p *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="mt-1 text-red-500 text-xs">
            <span *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</span>
            <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters long</span>
          </p>
        </div>
        <div class="mb-4">
          <label for="confirmPassword" class="block text-sm font-medium mb-1">Confirm Password</label>
          <input type="password" id="confirmPassword" formControlName="confirmPassword" class="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-primary-foreground focus:outline-none focus:ring-2 focus:ring-accent">
          <p *ngIf="registerForm.errors?.['mismatch'] && registerForm.get('confirmPassword')?.touched" class="mt-1 text-red-500 text-xs">Passwords do not match</p>
        </div>
        <div class="mb-6">
          <label for="role" class="block text-sm font-medium mb-1">Role</label>
          <select id="role" formControlName="role" class="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md text-primary-foreground focus:outline-none focus:ring-2 focus:ring-accent">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" [disabled]="registerForm.invalid || isLoading" class="w-full bg-accent text-white py-2 px-4 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isLoading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      <p class="mt-4 text-center">
        Already have an account? <a routerLink="/login" class="text-accent hover:underline">Login here</a>
      </p>
      <p *ngIf="error" class="mt-4 text-red-500 text-center">{{ error }}</p>
    </div>
  `,
})
export class SignupComponent {
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['user', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = null;
      const { name, email, password, role } = this.registerForm.value;
      this.authService.register(name, email, password, role).subscribe({
        next: () => {
          this.router.navigate(['/blogs']);
        },
        error: (err) => {
          this.error = 'Registration failed';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }
}

