import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.css'
})
export class UserRegistrationComponent implements OnInit {
  userForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      firstName: ['', [
        Validators.required, 
        Validators.minLength(3)
      ]],
      lastName: ['', [
        Validators.required, 
        Validators.minLength(3)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      permanentAddress: ['', Validators.required],
      currentAddress: ['', Validators.required],
      contactNumber: ['', [
        Validators.required, 
        Validators.pattern('^[6-9]\\d{9}$') // Indian phone number validation
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(6)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: AbstractControl): {[key: string]: boolean} | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value !== confirmPassword.value 
      ? { 'passwordMismatch': true } 
      : null;
  }

  // Method to copy permanent address to current address
  copyPermanentAddress(): void {
    const permanentAddress = this.userForm.get('permanentAddress')?.value ?? '';
    this.userForm.get('currentAddress')?.setValue(permanentAddress);
  }

  // Form submission method
  onSubmit(): void {
    if (this.userForm.valid) {
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach(field => {
        const control = this.userForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });
    }
  }

  // Getter methods with null safety
  get firstName(): AbstractControl | null { 
    return this.userForm.get('firstName') ?? null; 
  }

  get lastName(): AbstractControl | null { 
    return this.userForm.get('lastName') ?? null; 
  }

  get email(): AbstractControl | null { 
    return this.userForm.get('email') ?? null; 
  }

  get permanentAddress(): AbstractControl | null { 
    return this.userForm.get('permanentAddress') ?? null; 
  }

  get currentAddress(): AbstractControl | null { 
    return this.userForm.get('currentAddress') ?? null; 
  }

  get contactNumber(): AbstractControl | null { 
    return this.userForm.get('contactNumber') ?? null; 
  }

  get password(): AbstractControl | null { 
    return this.userForm.get('password') ?? null; 
  }

  get confirmPassword(): AbstractControl | null { 
    return this.userForm.get('confirmPassword') ?? null; 
  }
}