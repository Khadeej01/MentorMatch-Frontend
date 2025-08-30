import { Component } from '@angular/core';
import { MentorBookingsComponent } from './mentor-bookings/mentor-bookings.component';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [MentorBookingsComponent],
  templateUrl: './mentor-dashboard.component.html',
})
export class MentorDashboardComponent {}
