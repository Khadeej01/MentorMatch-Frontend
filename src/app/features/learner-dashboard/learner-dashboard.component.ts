import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../data/booking.service';
import { Booking } from '../../domain/booking.model';
import { AuthService, User } from '../../core/auth/auth.service';
import { MentorService } from '../../data/mentor.service';
import { Mentor } from '../../domain/mentor.model';

@Component({
  selector: 'app-learner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './learner-dashboard.component.html',
})
export class LearnerDashboardComponent implements OnInit {
  currentUser: User | null = null;
  bookings: Booking[] = [];
  suggestedMentors: Mentor[] = [];
  searchResults: Mentor[] = [];
  loading = false;
  error: string | null = null;

  // Simple local profile enhancements for learner
  level: string = '';
  objectives: string = '';

  // Search & booking
  searchTerm: string = '';
  bookingModalOpen = false;
  bookingSelectedMentor: Mentor | null = null;
  bookingDate: string = '';
  bookingTime: string = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private mentorService: MentorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.restoreLearnerProfile();
        this.loadBookings();
        this.loadMentors();
      },
      error: () => {
        this.error = 'Unable to load user profile';
      }
    });
  }

  loadBookings(): void {
    const learnerId = this.currentUser?.id;
    if (!learnerId) return;
    this.loading = true;
    this.error = null;
    this.bookingService.getBookingsForLearner(learnerId).subscribe({
      next: (data) => { 
        this.bookings = data; 
        this.loading = false; 
      },
      error: (err) => { 
        this.error = 'Failed to load bookings'; 
        this.loading = false; 
        console.error('Booking load error:', err); 
      }
    });
  }

  loadMentors(): void {
    this.mentorService.getMentors({ available: true }).subscribe({
      next: (mentors) => {
        // Simple recommendation: first 6 mentors
        this.suggestedMentors = mentors.slice(0, 6);
      },
      error: (err) => { console.error(err); }
    });
  }

  searchMentors(): void {
    const term = (this.searchTerm || '').trim();
    if (!term) {
      this.searchResults = [];
      return;
    }
    this.mentorService.searchMentors(term).subscribe({
      next: (res) => this.searchResults = res,
      error: (e) => { console.error(e); this.searchResults = []; }
    });
  }

  openBooking(mentor: Mentor): void {
    this.bookingSelectedMentor = mentor;
    this.bookingDate = '';
    this.bookingTime = '';
    this.bookingModalOpen = true;
  }

  closeBooking(): void {
    this.bookingModalOpen = false;
  }

  confirmBooking(): void {
    if (!this.currentUser?.id || !this.bookingSelectedMentor || !this.bookingDate || !this.bookingTime) return;
    const dateTimeIso = `${this.bookingDate}T${this.bookingTime}:00`;
    const dto = {
      mentorId: Number(this.bookingSelectedMentor.id),
      apprenantId: Number(this.currentUser.id),
      dateTime: dateTimeIso
    };
    this.bookingService.createBooking(dto).subscribe({
      next: () => {
        this.bookingModalOpen = false;
        this.loadBookings();
      },
      error: (e) => console.error(e)
    });
  }

  saveLearnerProfile(): void {
    const key = 'learner-profile';
    const data = { level: this.level, objectives: this.objectives };
    localStorage.setItem(key, JSON.stringify(data));
  }

  restoreLearnerProfile(): void {
    const key = 'learner-profile';
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.level = parsed.level || '';
        this.objectives = parsed.objectives || '';
      } catch {}
    }
  }

  goToMentor(mentor: Mentor): void {
    this.router.navigate(['/mentors', mentor.id]);
  }
}
