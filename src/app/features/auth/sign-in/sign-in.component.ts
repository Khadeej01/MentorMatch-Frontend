import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }
    this.isSubmitting = true;
    this.authService.signIn({ email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          console.log('Signed in successfully', response);
          if (response.user.role === 'mentor') {
            this.router.navigate(['/mentor-dashboard']);
          } else {
            this.router.navigate(['/learner-dashboard']);
          }
        },
        error: (err) => {
          const serverMsg = err?.error?.error || err?.error?.message || err?.message;
          this.errorMessage = serverMsg ? `Sign in failed: ${serverMsg}` : 'Sign in failed. Please try again.';
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


