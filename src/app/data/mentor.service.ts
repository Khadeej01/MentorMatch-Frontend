import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Mentor, MentorCreateRequest, MentorUpdateRequest } from '../domain/mentor.model';

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // Récupérer tous les mentors avec filtres optionnels
  getMentors(filters?: {
    available?: boolean;
    competences?: string;
    search?: string;
  }): Observable<Mentor[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.available !== undefined) {
        params = params.set('available', filters.available.toString());
      }
      if (filters.competences) {
        params = params.set('competences', filters.competences);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }

    return this.http.get<Mentor[]>(`${this.apiUrl}/mentors`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Récupérer un mentor par ID
  getMentorById(id: number): Observable<Mentor> {
    return this.http.get<Mentor>(`${this.apiUrl}/mentors/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Créer un nouveau mentor
  createMentor(mentor: MentorCreateRequest): Observable<Mentor> {
    return this.http.post<Mentor>(`${this.apiUrl}/mentors`, mentor)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Mettre à jour un mentor
  updateMentor(id: number, mentor: MentorUpdateRequest): Observable<Mentor> {
    return this.http.put<Mentor>(`${this.apiUrl}/mentors/${id}`, mentor)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Supprimer un mentor
  deleteMentor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mentors/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Rechercher des mentors
  searchMentors(query: string): Observable<Mentor[]> {
    return this.http.get<Mentor[]>(`${this.apiUrl}/mentors/search`, {
      params: { q: query }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Rechercher par compétences
  getMentorsByCompetences(competences: string): Observable<Mentor[]> {
    return this.http.get<Mentor[]>(`${this.apiUrl}/mentors/competences/${competences}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Initialiser des mentors de test
  initTestMentors(): Observable<any> {
    return this.http.post(`${this.apiUrl}/test/mentors/init`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur dans MentorService:', error);
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
