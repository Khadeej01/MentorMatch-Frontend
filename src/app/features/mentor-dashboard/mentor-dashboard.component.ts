import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../data/booking.service';
import { AuthService, User } from '../../core/auth/auth.service';
import { Booking } from '../../domain/booking.model';
import { LearnerService } from '../../data/learner.service';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mentor-dashboard.component.html',
})
export class MentorDashboardComponent implements OnInit {
  currentUser: User | null = null;
  // profile summary
  competences = '';
  experience = '';
  available = true;
  // requests and upcoming
  pendingRequests: Booking[] = [];
  upcomingSessions: Booking[] = [];
  completedSessions: Booking[] = [];
  // availability
  weeklyAvailability: { [key: string]: { start: string; end: string; enabled: boolean } } = {
    'Mon': { start: '09:00', end: '17:00', enabled: true },
    'Tue': { start: '09:00', end: '17:00', enabled: true },
    'Wed': { start: '09:00', end: '17:00', enabled: true },
    'Thu': { start: '09:00', end: '17:00', enabled: true },
    'Fri': { start: '09:00', end: '17:00', enabled: true },
    'Sat': { start: '10:00', end: '15:00', enabled: false },
    'Sun': { start: '10:00', end: '15:00', enabled: false }
  };

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private learnerService: LearnerService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      if (this.currentUser && this.currentUser.role === 'mentor') {
        this.restoreMentorProfile();
        this.restoreAvailability();
        this.loadBookings(this.currentUser.id);
      }
    });
  }

  loadBookings(mentorId: string): void {
    this.bookingService.getBookingsForMentor(mentorId).subscribe((bookings: Booking[]) => {
      this.pendingRequests = bookings.filter(b => b.status === 'pending');
      this.upcomingSessions = bookings.filter(b => b.status === 'confirmed');
      this.completedSessions = bookings.filter(b => b.status === 'completed');
      // Preload learner names for display where possible
      const uniqueLearnerIds = Array.from(new Set(bookings.map(b => String(b.apprenantId))));
      uniqueLearnerIds.forEach(id => {
        this.learnerService.getLearnerById(String(id)).subscribe({
          next: (lrn) => {
            if (lrn) {
              // Replace occurrences of numeric id in titles if needed (kept simple here)
            }
          }
        });
      });
    });
  }


  // Local persistence for mentor profile fields
  saveMentorProfile(): void {
    const key = 'mentor-profile';
    const data = { competences: this.competences, experience: this.experience, available: this.available };
    localStorage.setItem(key, JSON.stringify(data));
  }

  restoreMentorProfile(): void {
    const key = 'mentor-profile';
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.competences = parsed.competences || '';
        this.experience = parsed.experience || '';
        this.available = parsed.available !== undefined ? parsed.available : true;
      } catch {}
    }
  }

  acceptRequest(b: Booking): void {
    this.bookingService.updateBookingStatus(b.id, 'confirmed').subscribe({
      next: () => this.loadBookings(this.currentUser!.id),
      error: (e) => console.error(e)
    });
  }
  declineRequest(b: Booking): void {
    this.bookingService.updateBookingStatus(b.id, 'cancelled').subscribe({
      next: () => this.loadBookings(this.currentUser!.id),
      error: (e) => console.error(e)
    });
  }
  proposeNewTime(b: Booking): void {
    this.router.navigate(['/calendar']);
  }

  // Mark a confirmed session as completed ("passer la séance")
  completeSession(b: Booking): void {
    this.bookingService.updateBookingStatus(b.id, 'completed').subscribe({
      next: () => this.loadBookings(this.currentUser!.id),
      error: (e) => console.error(e)
    });
  }

  cancelSession(b: Booking): void {
    this.bookingService.updateBookingStatus(b.id, 'cancelled').subscribe({
      next: () => this.loadBookings(this.currentUser!.id),
      error: (e) => console.error(e)
    });
  }

  joinSession(booking: Booking) {
    // For now, this will open a simple alert with session details
    // In a real app, this would open a video call or meeting room
    const sessionTime = new Date(booking.dateTime).toLocaleString();
    alert(`Joining session with Learner ${booking.apprenantName || booking.apprenantId}\nTime: ${sessionTime}\n\nThis would normally open a video call or meeting room.`);
  }

  startVideoCall(booking: Booking) {
    // Alternative method for starting video calls
    const sessionTime = new Date(booking.dateTime).toLocaleString();
    const meetingUrl = `https://meet.example.com/session-${booking.id}`;
    window.open(meetingUrl, '_blank');
  }

  openChat(booking: Booking) {
    // Open chat with the learner
    const chatUrl = `/chat/${booking.apprenantId}`;
    this.router.navigate([chatUrl]);
  }

  // Availability management
  saveAvailability(): void {
    const key = 'mentor-availability';
    localStorage.setItem(key, JSON.stringify(this.weeklyAvailability));
    alert('Availability saved successfully!');
  }

  restoreAvailability(): void {
    const key = 'mentor-availability';
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.weeklyAvailability = { ...this.weeklyAvailability, ...parsed };
      } catch (e) {
        console.error('Error restoring availability:', e);
      }
    }
  }

  updateAvailability(day: string, field: 'start' | 'end', value: string): void {
    if (this.weeklyAvailability[day]) {
      this.weeklyAvailability[day][field] = value;
    }
  }

  onTimeChange(day: string, field: 'start' | 'end', event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && this.weeklyAvailability[day]) {
      this.weeklyAvailability[day][field] = target.value;
    }
  }

  toggleDayAvailability(day: string): void {
    if (this.weeklyAvailability[day]) {
      this.weeklyAvailability[day].enabled = !this.weeklyAvailability[day].enabled;
    }
  }
}