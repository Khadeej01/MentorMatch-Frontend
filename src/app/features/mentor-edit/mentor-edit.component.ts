import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MentorService } from '../../data/mentor.service';
import { AuthService } from '../../core/auth/auth.service';
import { Mentor, MentorUpdateRequest } from '../../domain/mentor.model';

@Component({
  selector: 'app-mentor-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mentor-edit.component.html',
})
export class MentorEditComponent implements OnInit {
  mentor: Mentor | null = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private mentorService: MentorService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getAuthData()?.user;
    if (currentUser && currentUser.id) {
      this.mentorService.getMentorById(Number(currentUser.id)).subscribe({
        next: (mentorData) => {
          this.mentor = mentorData;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load mentor data.';
          console.error(err);
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.mentor) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateRequest: MentorUpdateRequest = {
      id: this.mentor.id,
      nom: this.mentor.nom,
      email: this.mentor.email,
      competences: this.mentor.competences,
      experience: this.mentor.experience,
      available: this.mentor.available,
      active: this.mentor.active,
      role: this.mentor.role
    };

    this.mentorService.updateMentor(this.mentor.id, updateRequest).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.router.navigate(['/mentor-dashboard']), 2000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to update profile. Please try again.';
        console.error(err);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/mentor-dashboard']);
  }
}
