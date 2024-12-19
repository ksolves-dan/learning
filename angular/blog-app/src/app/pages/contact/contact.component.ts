import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  submitMessage: string | null = null;
  submitSuccess = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitMessage = null;

      this.http.post(`${environment.apiUrl}/contact/submit`, this.contactForm.value)
        .subscribe({
          next: (response: any) => {
            this.isSubmitting = false;
            this.submitSuccess = true;
            this.submitMessage = response.message;
            this.contactForm.reset();
          },
          error: (error) => {
            this.isSubmitting = false;
            this.submitSuccess = false;
            this.submitMessage = 'An error occurred while sending your message. Please try again.';
            console.error('Error submitting contact form:', error);
          }
        });
    }
  }
}

