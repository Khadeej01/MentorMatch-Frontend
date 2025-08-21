import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  fullName: string = '';
  email: string = '';
  password: string = '';
  acceptTerms: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router) {}

  async onSubmit() {
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
    try {
      // Simulate API call; replace with real registration flow
      await new Promise((resolve) => setTimeout(resolve, 900));
      this.router.navigateByUrl('/');
    } catch (err) {
      this.errorMessage = 'Sign up failed. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  close() {
    this.router.navigateByUrl('/');
  }
}


