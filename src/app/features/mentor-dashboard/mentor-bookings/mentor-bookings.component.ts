import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../data/booking.service';
import { Booking } from '../../../domain/booking.model';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-mentor-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mentor-bookings.component.html',
  styleUrls: ['./mentor-bookings.component.css']
})
export class MentorBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading: boolean = true;
  error: string | null = null;
  currentUser: User | null = null;

  constructor(private bookingService: BookingService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser && this.currentUser.role === 'mentor') {
        this.loadBookings(this.currentUser.id);
      } else {
        this.error = 'You must be logged in as a mentor to view bookings.';
        this.loading = false;
      }
    });
  }

  loadBookings(mentorId: string): void {
    this.loading = true;
    this.error = null;
    this.bookingService.getBookingsForMentor(mentorId).subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load bookings.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): void {
    this.bookingService.updateBookingStatus(bookingId, status).subscribe({
      next: (updatedBooking) => {
        if (updatedBooking) {
          const index = this.bookings.findIndex(b => b.id === updatedBooking.id);
          if (index > -1) {
            this.bookings[index] = updatedBooking;
          }
        }
      },
      error: (err) => {
        this.error = 'Failed to update booking status.';
        console.error(err);
      }
    });
  }
}
