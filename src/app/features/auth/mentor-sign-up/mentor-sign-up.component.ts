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
        next: () => this.router.navigate(['/sign-in']),
        error: (err) => {
          const serverMsg = err?.error?.error || err?.error?.message || err?.message;
          this.errorMessage = serverMsg ? `Sign up failed: ${serverMsg}` : 'Sign up failed. Please try again.';
          console.error(err);
        },
        complete: () => this.isSubmitting = false
      });
  }

  close() { this.router.navigateByUrl('/'); }
}


