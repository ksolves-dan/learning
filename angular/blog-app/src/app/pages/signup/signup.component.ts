import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './signup.component.html',
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
      name: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        this.nameValidator()
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.maxLength(100)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.maxLength(64),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator() });
  }

  // Custom validator for name (only letters and spaces)
  nameValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const valid = /^[a-zA-Z\s]*$/.test(control.value);
      return valid ? null : { invalidName: true };
    };
  }

  // Custom validator for password strength
  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const value = control.value;
      
      // Check for at least one uppercase letter
      const hasUpperCase = /[A-Z]/.test(value);
      
      // Check for at least one lowercase letter
      const hasLowerCase = /[a-z]/.test(value);
      
      // Check for at least one number
      const hasNumber = /[0-9]/.test(value);
      
      // Check for at least one special character
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
      
      const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
      
      return passwordValid ? null : { passwordStrength: true };
    };
  }

  // Custom validator to ensure password and confirm password match
  passwordMatchValidator(): ValidatorFn {
    return (group: AbstractControl): {[key: string]: any} | null => {
      const password = group.get('password');
      const confirmPassword = group.get('confirmPassword');
      
      return password && confirmPassword && password.value === confirmPassword.value 
        ? null 
        : { passwordMismatch: true };
    };
  }

  // Get error messages for form controls
  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    
    if (control?.errors) {
      if (control.errors['required']) return 'This field is required';
      
      switch(controlName) {
        case 'name':
          if (control.errors['minlength']) return 'Name must be at least 2 characters';
          if (control.errors['maxlength']) return 'Name cannot exceed 50 characters';
          if (control.errors['invalidName']) return 'Name can only contain letters and spaces';
          break;
        
        case 'email':
          if (control.errors['email']) return 'Please enter a valid email address';
          if (control.errors['maxlength']) return 'Email cannot exceed 100 characters';
          break;
        
        case 'password':
          if (control.errors['minlength']) return 'Password must be at least 8 characters';
          if (control.errors['maxlength']) return 'Password cannot exceed 64 characters';
          if (control.errors['passwordStrength']) 
            return 'Password must include uppercase, lowercase, number, and special character';
          break;
        
        case 'confirmPassword':
          if (this.registerForm.errors?.['passwordMismatch']) 
            return 'Passwords do not match';
          break;
      }
    }
    return '';
  }

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.registerForm.markAllAsTouched();

    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = null;
      
      const { name, email, password } = this.registerForm.value;
      
      this.authService.register(name, email, password).subscribe({
        next: () => {
          this.router.navigate(['/blogs']);
        },
        error: (err) => {
          // More specific error handling
          this.error = err.error?.message || 'Registration failed';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}