import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'MentorMatch-Frontend';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.getUserProfile().subscribe({
        next: (user) => {
          console.log('User profile loaded on startup:', user);
        },
        error: (err) => {
          console.error('Failed to load user profile on startup:', err);
          this.authService.signOut(); // Sign out if profile loading fails
        }
      });
    }
  }
}