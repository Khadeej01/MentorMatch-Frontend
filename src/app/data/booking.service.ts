import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Booking } from '../domain/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookings: Booking[] = [
    { id: 'b1', mentorId: '1', learnerId: '1', date: '2025-09-10', time: '10:00 AM', status: 'confirmed' },
    { id: 'b2', mentorId: '1', learnerId: '2', date: '2025-09-12', time: '02:00 PM', status: 'pending' },
    { id: 'b3', mentorId: '2', learnerId: '1', date: '2025-09-15', time: '11:00 AM', status: 'completed' },
  ];

  constructor() { }

  getBookingsForMentor(mentorId: string): Observable<Booking[]> {
    return of(this.bookings.filter(b => b.mentorId === mentorId)).pipe(delay(500));
  }

  createBooking(booking: Booking): Observable<Booking> {
    booking.id = 'b' + (this.bookings.length + 1);
    this.bookings.push(booking);
    return of(booking).pipe(delay(500));
  }

  updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Observable<Booking | undefined> {
    const booking = this.bookings.find(b => b.id === id);
    if (booking) {
      booking.status = status;
    }
    return of(booking).pipe(delay(500));
  }
}
