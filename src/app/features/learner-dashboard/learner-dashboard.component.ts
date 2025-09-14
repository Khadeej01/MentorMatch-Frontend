import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../data/booking.service';
import { Booking } from '../../domain/booking.model';
import { AuthService, User } from '../../core/auth/auth.service';
import { MentorService } from '../../data/mentor.service';
import { Mentor } from '../../domain/mentor.model';
import { LearnerService } from '../../data/learner.service';
import { Learner } from '../../domain/learner.model';

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
  profileSaveMessage: string = '';
  backendLearner: Learner | null = null;

  // Edit modal state
  editOpen = false;
  editFullName: string = '';
  editObjectifs: string = '';
  editNiveau: string = '';

  // Search & booking
  searchTerm: string = '';
  selectedCompetence: string = '';
  showAvailableOnly: boolean = false;
  competences: string[] = [
    'Java', 'Spring Boot', 'React', 'Angular', 'TypeScript',
    'Python', 'Data Science', 'Machine Learning', 'DevOps',
    'Docker', 'Kubernetes', 'Node.js', 'Express', 'MongoDB'
  ];
  bookingModalOpen = false;
  bookingSelectedMentor: Mentor | null = null;
  bookingDate: string = '';
  bookingTime: string = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private mentorService: MentorService,
    private router: Router,
    private learnerService: LearnerService
  ) {}

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.loadLearnerFromBackend(user.id);
        this.restoreLearnerProfile(); // fallback/local augmentation
        this.loadBookings();
        this.loadMentors();
      },
      error: () => {
        this.error = 'Unable to load user profile';
      }
    });
  }

  private loadLearnerFromBackend(id: string): void {
    this.learnerService.getLearnerById(String(id)).subscribe({
      next: (lrn) => {
        this.applyLearnerToState(lrn);
      },
      error: (e) => {
        console.warn('Failed to load learner by id, will try by email', e);
        const email = this.currentUser?.email;
        if (!email) return;
        this.learnerService.getLearners().subscribe({
          next: (all) => {
            const found = (all || []).find(x => (x.email || '').toLowerCase() === email.toLowerCase());
            if (found) {
              this.applyLearnerToState(found);
            }
          },
          error: (err) => console.warn('Fallback load learners failed', err)
        });
      }
    });
  }

  private applyLearnerToState(lrn: Learner): void {
    this.backendLearner = lrn;
    // Map backend fields to UI
    this.level = lrn.niveau || this.level || '';
    this.objectives = lrn.objectifs || this.objectives || '';
    // Prefill edit model too
    this.editFullName = lrn.nom || this.currentUser?.fullName || '';
    this.editObjectifs = lrn.objectifs || '';
    this.editNiveau = lrn.niveau || '';
  }

  loadBookings(): void {
    const learnerId = this.backendLearner?.id || this.currentUser?.id;
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
    const term = (this.searchTerm || '').trim().toLowerCase();
    
    const filters: { available?: boolean } = {};
    if (this.showAvailableOnly) {
      filters.available = true;
    }

    this.mentorService.getMentors(filters).subscribe({
      next: (mentors) => {
        let result = mentors;
        if (this.selectedCompetence) {
          result = result.filter(m => (m.competences || '').toLowerCase().includes(this.selectedCompetence.toLowerCase()));
        }
        if (term) {
          result = result.filter(m => {
            const nom = (m.nom || '').toLowerCase();
            const email = (m.email || '').toLowerCase();
            const comps = (m.competences || '').toLowerCase();
            return nom.includes(term) || email.includes(term) || comps.includes(term);
          });
        }
        this.searchResults = result;
      },
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
    // Always persist locally for UX
    const key = 'learner-profile';
    const data = { level: this.level, objectives: this.objectives };
    localStorage.setItem(key, JSON.stringify(data));

    // If logged in and we have a backend record, update server
    const learnerId = this.currentUser?.id;
    if (!learnerId) return;

    const base: Learner = this.backendLearner || {
      id: learnerId,
      nom: this.currentUser?.fullName || '',
      email: this.currentUser?.email || '',
      role: 'APPRENANT',
      objectifs: '',
      niveau: ''
    } as unknown as Learner;

    const payload: Partial<Learner> = {
      nom: base.nom,
      email: base.email,
      role: base.role || 'APPRENANT',
      objectifs: this.objectives,
      niveau: this.level
    };

    this.learnerService.updateLearner(String(learnerId), payload).subscribe({
      next: (updated) => {
        this.backendLearner = { ...(this.backendLearner as Learner), ...updated } as Learner;
        this.profileSaveMessage = 'Profile saved';
        setTimeout(() => (this.profileSaveMessage = ''), 2000);
      },
      error: (e) => {
        console.error('Failed to save learner profile', e);
      }
    });
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

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCompetence = '';
    this.showAvailableOnly = false;
    this.searchResults = [];
  }

  openEditProfile(): void {
    // Ensure latest values
    this.editFullName = this.backendLearner?.nom || this.currentUser?.fullName || '';
    this.editObjectifs = this.backendLearner?.objectifs || this.objectives || '';
    this.editNiveau = this.backendLearner?.niveau || this.level || '';
    this.editOpen = true;
  }

  closeEditProfile(): void {
    this.editOpen = false;
  }

  submitEditProfile(): void {
    const learnerId = this.currentUser?.id;
    if (!learnerId) return;

    const payload: Partial<Learner> = {
      nom: this.editFullName,
      email: this.backendLearner?.email || this.currentUser?.email,
      role: this.backendLearner?.role || 'APPRENANT',
      objectifs: this.editObjectifs,
      niveau: this.editNiveau
    };

    this.learnerService.updateLearner(String(learnerId), payload).subscribe({
      next: (updated) => {
        this.backendLearner = { ...(this.backendLearner as Learner), ...updated } as Learner;
        // Reflect in display
        this.level = updated.niveau || '';
        this.objectives = updated.objectifs || '';
        // Update stored name in auth if changed
        if (updated.nom && this.currentUser) {
          const authData = this.authService.getAuthData();
          if (authData) {
            authData.user.fullName = updated.nom;
            localStorage.setItem('auth-data', JSON.stringify(authData));
          }
        }
        this.editOpen = false;
        this.profileSaveMessage = 'Profile saved';
        setTimeout(() => (this.profileSaveMessage = ''), 2000);
      },
      error: (e) => console.error('Failed to update profile', e)
    });
  }
}
