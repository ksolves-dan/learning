import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass, NgFor, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass, NgFor, DatePipe],
  templateUrl: './contact.component.html',
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  submitMessage: string | null = null;
  submitSuccess = false;
  submissions: ContactSubmission[] = [];
  isLoadingSubmissions = false;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    if (this.isAdmin) {
      this.loadSubmissions();
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitMessage = null;

      this.http.post(`${environment.apiUrl}/contact`, this.contactForm.value)
        .subscribe({
          next: (response: any) => {
            this.isSubmitting = false;
            this.submitSuccess = true;
            this.submitMessage = response.message;
            this.contactForm.reset();
            if (this.isAdmin) {
              this.loadSubmissions();
            }
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

  loadSubmissions(): void {
    this.isLoadingSubmissions = true;
    this.http.get<ContactSubmission[]>(`${environment.apiUrl}/contact`)
      .subscribe({
        next: (submissions) => {
          this.submissions = submissions;
          this.isLoadingSubmissions = false;
        },
        error: (error) => {
          console.error('Error loading submissions:', error);
          this.isLoadingSubmissions = false;
        }
      });
  }
}

