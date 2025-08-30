import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

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
  role: 'mentor' | 'learner' = 'learner';
  acceptTerms: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    this.errorMessage = '';
    if (!this.fullName || !this.email || !this.password || !this.role) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }
    if (!this.acceptTerms) {
      this.errorMessage = 'You must accept the terms to continue.';
      return;
    }
    this.isSubmitting = true;
    this.authService.signUp({ 
      fullName: this.fullName, 
      email: this.email, 
      password: this.password, 
      role: this.role 
    })
      .subscribe({
        next: (response) => {
          console.log('Signed up successfully', response);
          if (response.user.role === 'mentor') {
            this.router.navigate(['/mentor-dashboard']);
          } else {
            this.router.navigate(['/learner-dashboard']);
          }
        },
        error: (err) => {
          this.errorMessage = 'Sign up failed. Please try again.';
          console.error(err);
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
  }

  close() {
    this.router.navigateByUrl('/');
  }
}


