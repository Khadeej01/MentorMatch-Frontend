import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Learner } from '../domain/learner.model';

@Injectable({
  providedIn: 'root'
})
export class LearnerService {
  private apiUrl = 'http://localhost:8080/api/apprenants';

  constructor(private http: HttpClient) { }

  getLearners(): Observable<Learner[]> {
    return this.http.get<Learner[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getLearnerById(id: string): Observable<Learner> {
    return this.http.get<Learner>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createLearner(learner: Partial<Learner>): Observable<Learner> {
    return this.http.post<Learner>(this.apiUrl, learner)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateLearner(id: string, learner: Partial<Learner>): Observable<Learner> {
    return this.http.put<Learner>(`${this.apiUrl}/${id}`, learner)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteLearner(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur dans LearnerService:', error);
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}