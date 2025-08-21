import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router) {}

  async onSubmit() {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }
    this.isSubmitting = true;
    try {
      // Simulated auth request; replace with real API later
      await new Promise((resolve) => setTimeout(resolve, 800));
      this.router.navigateByUrl('/');
    } catch (err) {
      this.errorMessage = 'Sign in failed. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  close() {
    this.router.navigateByUrl('/');
  }
}


