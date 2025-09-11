import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../core/auth/auth.service';
import { MentorService } from '../../data/mentor.service';
import { LearnerService } from '../../data/learner.service';
import { BookingService } from '../../data/booking.service';
import { Mentor } from '../../domain/mentor.model';
import { Learner } from '../../domain/learner.model';
import { Booking } from '../../domain/booking.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  
  // Data
  mentors: Mentor[] = [];
  learners: Learner[] = [];
  allBookings: Booking[] = [];
  
  // UI state
  loading = false;
  error: string | null = null;
  activeTab: 'mentors' | 'learners' | 'bookings' | 'stats' = 'mentors';
  
  // Search and filters
  searchTerm = '';
  statusFilter = 'all';
  
  // Stats
  totalMentors = 0;
  totalLearners = 0;
  totalBookings = 0;
  pendingBookings = 0;
  confirmedBookings = 0;

  constructor(
    private authService: AuthService,
    private mentorService: MentorService,
    private learnerService: LearnerService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (this.currentUser && this.currentUser.role === 'admin') {
        this.loadAllData();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  loadAllData(): void {
    this.loading = true;
    this.error = null;
    
    // Load mentors
    this.mentorService.getMentors({}).subscribe({
      next: (mentors) => {
        this.mentors = mentors;
        this.totalMentors = mentors.length;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load mentors';
        this.loading = false;
        console.error(err);
      }
    });

    // Load learners
    this.learnerService.getLearners().subscribe({
      next: (learners) => {
        this.learners = learners;
        this.totalLearners = learners.length;
      },
      error: (err) => {
        console.error('Failed to load learners:', err);
      }
    });

    // Load all bookings
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.allBookings = bookings;
        this.totalBookings = bookings.length;
        this.pendingBookings = bookings.filter(b => b.status === 'pending').length;
        this.confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
      }
    });
  }

  // Tab management
  setActiveTab(tab: 'mentors' | 'learners' | 'bookings' | 'stats'): void {
    this.activeTab = tab;
  }

  // Search and filtering
  getFilteredMentors(): Mentor[] {
    let filtered = this.mentors;
    
    if (this.searchTerm) {
      filtered = filtered.filter(m => 
        m.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        m.competences?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }

  getFilteredLearners(): Learner[] {
    let filtered = this.learners;
    
    if (this.searchTerm) {
      filtered = filtered.filter(l => 
        l.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        l.objectifs?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }

  getFilteredBookings(): Booking[] {
    let filtered = this.allBookings;
    
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === this.statusFilter);
    }
    
    if (this.searchTerm) {
      filtered = filtered.filter(b => 
        b.mentorName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        b.apprenantName?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }

  // User management actions
  toggleMentorAvailability(mentor: Mentor): void {
    // This would call a backend API to update mentor availability
    console.log('Toggle availability for mentor:', mentor.id);
  }

  deleteUser(userId: string | number, userType: 'mentor' | 'learner'): void {
    if (confirm('Are you sure you want to delete this user?')) {
      console.log('Delete user:', userId, userType);
      // This would call a backend API to delete the user
    }
  }

  viewUserDetails(userId: string | number, userType: 'mentor' | 'learner'): void {
    if (userType === 'mentor') {
      this.router.navigate(['/mentors', String(userId)]);
    } else {
      this.router.navigate(['/learners', String(userId)]);
    }
  }

  // Booking management
  updateBookingStatus(booking: Booking, status: string): void {
    this.bookingService.updateBookingStatus(booking.id, status as any).subscribe({
      next: () => {
        this.loadAllData(); // Reload data
      },
      error: (err) => {
        console.error('Failed to update booking status:', err);
      }
    });
  }

  deleteBooking(booking: Booking): void {
    if (confirm('Are you sure you want to delete this booking?')) {
      // This would call a backend API to delete the booking
      console.log('Delete booking:', booking.id);
    }
  }
}