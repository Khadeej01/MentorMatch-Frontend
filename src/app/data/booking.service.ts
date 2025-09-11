import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Booking } from '../domain/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) { }

  getBookingsForMentor(mentorId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/mentor/${mentorId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getBookingsForLearner(learnerId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/apprenant/${learnerId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Backend expects BookingDTO: { mentorId: number, apprenantId: number, dateTime: string, notes?: string }
  createBooking(dto: { mentorId: number | string, apprenantId: number | string, dateTime: string, notes?: string }): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, dto)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Backend endpoint expects status as request param: PUT /{id}/status?status=CONFIRMED
  updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed'): Observable<Booking> {
    // Map to backend's uppercase values if needed
    const mapped = status.toUpperCase();
    return this.http.put<Booking>(`${this.apiUrl}/${id}/status`, {}, { params: { status: mapped } })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur dans BookingService:', error);
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}