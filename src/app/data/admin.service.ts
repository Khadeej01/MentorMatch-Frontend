import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mentor } from '../domain/mentor.model';
import { Learner } from '../domain/learner.model';
import { Booking } from '../domain/booking.model';

export interface AdminMentorStats {
  totalSessions: number;
  totalEvaluations: number;
  averageRating: number;
}

export interface AdminLearnerStats {
  totalSessions: number;
  totalEvaluations: number;
  averageRatingGiven: number;
}

export interface AdminEvaluation {
  id: number;
  note: number;
  commentaire: string;
  sessionId: number;
  date: string;
}

export interface AdminSession {
  id: number;
  dateHeure: string;
  sujet: string;
  mentorId: number;
  apprenantId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }

  // Mentor Management
  getAllMentors(status?: string): Observable<Mentor[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Mentor[]>(`${this.apiUrl}/mentors`, { params });
  }

  getMentorById(id: number): Observable<Mentor> {
    return this.http.get<Mentor>(`${this.apiUrl}/mentors/${id}`);
  }

  updateMentorStatus(id: number, status: string, reason?: string): Observable<Mentor> {
    const body: any = { status };
    if (reason) {
      body.reason = reason;
    }
    return this.http.put<Mentor>(`${this.apiUrl}/mentors/${id}/status`, body);
  }

  updateMentor(id: number, mentor: Partial<Mentor>): Observable<Mentor> {
    return this.http.put<Mentor>(`${this.apiUrl}/mentors/${id}`, mentor);
  }

  deleteMentor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mentors/${id}`);
  }

  // Evaluation Management
  getMentorEvaluations(mentorId: number): Observable<AdminEvaluation[]> {
    return this.http.get<AdminEvaluation[]>(`${this.apiUrl}/mentors/${mentorId}/evaluations`);
  }

  getAllEvaluations(mentorId?: number, minRating?: number): Observable<AdminEvaluation[]> {
    let params = new HttpParams();
    if (mentorId) {
      params = params.set('mentorId', mentorId.toString());
    }
    if (minRating) {
      params = params.set('minRating', minRating.toString());
    }
    return this.http.get<AdminEvaluation[]>(`${this.apiUrl}/evaluations`, { params });
  }

  // Session Management
  getMentorSessions(mentorId: number): Observable<AdminSession[]> {
    return this.http.get<AdminSession[]>(`${this.apiUrl}/mentors/${mentorId}/sessions`);
  }

  getAllSessions(mentorId?: number, apprenantId?: number, status?: string): Observable<AdminSession[]> {
    let params = new HttpParams();
    if (mentorId) {
      params = params.set('mentorId', mentorId.toString());
    }
    if (apprenantId) {
      params = params.set('apprenantId', apprenantId.toString());
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<AdminSession[]>(`${this.apiUrl}/sessions`, { params });
  }

  // Statistics
  getMentorStats(mentorId: number): Observable<AdminMentorStats> {
    return this.http.get<AdminMentorStats>(`${this.apiUrl}/mentors/${mentorId}/stats`);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
  }
  
  // Learner Management
  getAllLearners(active?: boolean): Observable<Learner[]> {
    let params = new HttpParams();
    if (active !== undefined) {
      params = params.set('active', active.toString());
    }
    return this.http.get<Learner[]>(`${this.apiUrl}/learners`, { params });
  }

  getLearnerById(id: string | number): Observable<Learner> {
    return this.http.get<Learner>(`${this.apiUrl}/learners/${id}`);
  }

  updateLearnerStatus(id: string | number, active: boolean): Observable<Learner> {
    return this.http.put<Learner>(`${this.apiUrl}/learners/${id}/status`, { active });
  }

  updateLearner(id: string | number, learner: Partial<Learner>): Observable<Learner> {
    return this.http.put<Learner>(`${this.apiUrl}/learners/${id}`, learner);
  }

  deleteLearner(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/learners/${id}`);
  }

  getLearnerSessions(learnerId: string | number): Observable<AdminSession[]> {
    return this.http.get<AdminSession[]>(`${this.apiUrl}/learners/${learnerId}/sessions`);
  }

  getLearnerStats(learnerId: string | number): Observable<AdminLearnerStats> {
    return this.http.get<AdminLearnerStats>(`${this.apiUrl}/learners/${learnerId}/stats`);
  }
  
  // Advanced Booking Management
  getAllBookingsWithFilters(filters: {
    mentorId?: number;
    learnerId?: number;
    status?: string;
    competence?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<Booking[]> {
    let params = new HttpParams();
    if (filters.mentorId) params = params.set('mentorId', filters.mentorId.toString());
    if (filters.learnerId) params = params.set('learnerId', filters.learnerId.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.competence) params = params.set('competence', filters.competence);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`, { params });
  }
  
  forceCancelBooking(bookingId: number | string, reason: string, type: string = 'ADMIN_FORCED'): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/bookings/${bookingId}/force-cancel`, {
      reason,
      type
    });
  }
  
  getBookingStatistics(period: string = 'all'): Observable<any> {
    let params = new HttpParams().set('period', period);
    return this.http.get<any>(`${this.apiUrl}/bookings/statistics`, { params });
  }
  
  getCalendarView(month?: string, year?: string): Observable<any> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    
    return this.http.get<any>(`${this.apiUrl}/bookings/calendar`, { params });
  }
}