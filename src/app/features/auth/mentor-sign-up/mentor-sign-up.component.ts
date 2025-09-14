import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-mentor-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mentor-sign-up.component.html',
  styleUrls: ['./mentor-sign-up.component.css']
})
export class MentorSignUpComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  competences: string = '';
  experience: string = '';
  available: boolean = true;
  acceptTerms: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    this.errorMessage = '';
    if (!this.fullName || !this.email || !this.password) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }
    if (!this.acceptTerms) {
      this.errorMessage = 'You must accept the terms to continue.';
      return;
    }
    this.isSubmitting = true;
    const payload: any = {
      nom: this.fullName,
      email: this.email,
      password: this.password,
      role: 'mentor',
      competences: this.competences || undefined,
      experience: this.experience || undefined,
      available: String(this.available)
    };
    this.authService.signUpRaw(payload)
      .subscribe({
        next: (authResponse) => {
          console.log('Mentor registration successful:', authResponse);
          // Redirect to sign-in page after successful registration
          this.router.navigate(['/sign-in']);
        },
        error: (err) => {
          console.error('Mentor registration error details:', err);
          
          // Enhanced error message extraction
          let serverMsg = '';
          if (err?.error?.error) {
            serverMsg = err.error.error;
          } else if (err?.error?.message) {
            serverMsg = err.error.message;
          } else if (err?.message) {
            serverMsg = err.message;
          } else if (err?.status) {
            serverMsg = `Server error (${err.status}): ${err.statusText || 'Unknown error'}`;
          }
          
          this.errorMessage = serverMsg ? `Sign up failed: ${serverMsg}` : 'Sign up failed. Please try again.';
          
          // Additional debugging information
          console.error('Full error object:', {
            status: err?.status,
            statusText: err?.statusText,
            error: err?.error,
            message: err?.message,
            url: err?.url
          });
        },
        complete: () => this.isSubmitting = false
      });
  }

  close() { this.router.navigateByUrl('/'); }
}


