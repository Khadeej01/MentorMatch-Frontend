import { Component, OnInit } from '@angular/core';
import { CalendarComponent } from '../../calendar/calendar.component';
import { BookingService } from '../../../data/booking.service';
import { AuthService, User } from '../../../core/auth/auth.service';
import { EventInput } from '@fullcalendar/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, CalendarComponent],
  templateUrl: './mentor-dashboard.component.html',
})
export class MentorDashboardComponent implements OnInit {
  calendarEvents: EventInput[] = [];
  currentUser: User | null = null;

  constructor(private bookingService: BookingService, private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser && this.currentUser.role === 'mentor') {
        this.loadBookings(this.currentUser.id);
      }
    });
  }

  loadBookings(mentorId: string): void {
    this.bookingService.getBookingsForMentor(mentorId).subscribe(bookings => {
      this.calendarEvents = bookings.map(booking => ({
        id: booking.id,
        title: `Session with Learner ${booking.learnerId} (${booking.status})`,
        start: `${booking.date}T${booking.time}`,
        // You might want to add end date/time, color, etc.
        extendedProps: {
          status: booking.status,
          learnerId: booking.learnerId
        }
      }));
    });
  }

  handleDateClick(arg: any) {
    alert('date click! ' + arg.dateStr);
  }

  handleEventClick(arg: any) {
    alert('event click! ' + arg.event.title);
  }
}

