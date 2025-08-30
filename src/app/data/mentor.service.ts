import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Mentor } from '../domain/mentor.model';

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private mentors: Mentor[] = [
    { id: '1', name: 'Sarah Chen', email: 'sarah.c@example.com', specialty: 'Product Management', bio: 'Experienced product leader.' },
    { id: '2', name: 'David Lee', email: 'david.l@example.com', specialty: 'Software Engineering', bio: 'Senior software engineer with a passion for open source.' },
    { id: '3', name: 'Emily Rodriguez', email: 'emily.r@example.com', specialty: 'UX Design', bio: 'Award-winning UX designer.' },
  ];

  constructor() { }

  getMentors(): Observable<Mentor[]> {
    return of(this.mentors).pipe(delay(500));
  }

  getMentorById(id: string): Observable<Mentor | undefined> {
    return of(this.mentors.find(mentor => mentor.id === id)).pipe(delay(500));
  }

  createMentor(mentor: Mentor): Observable<Mentor> {
    mentor.id = String(this.mentors.length + 1); // Simple ID generation
    this.mentors.push(mentor);
    return of(mentor).pipe(delay(500));
  }

  updateMentor(mentor: Mentor): Observable<Mentor> {
    const index = this.mentors.findIndex(m => m.id === mentor.id);
    if (index > -1) {
      this.mentors[index] = mentor;
    }
    return of(mentor).pipe(delay(500));
  }

  deleteMentor(id: string): Observable<boolean> {
    const initialLength = this.mentors.length;
    this.mentors = this.mentors.filter(mentor => mentor.id !== id);
    return of(this.mentors.length < initialLength).pipe(delay(500));
  }
}
