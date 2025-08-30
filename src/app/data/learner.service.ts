import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Learner } from '../domain/learner.model';

@Injectable({
  providedIn: 'root'
})
export class LearnerService {
  private learners: Learner[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice.j@example.com', interests: 'Web Development' },
    { id: '2', name: 'Bob Williams', email: 'bob.w@example.com', interests: 'Data Science' },
    { id: '3', name: 'Charlie Brown', email: 'charlie.b@example.com', interests: 'Mobile App Development' },
  ];

  constructor() { }

  getLearners(): Observable<Learner[]> {
    return of(this.learners).pipe(delay(500));
  }

  getLearnerById(id: string): Observable<Learner | undefined> {
    return of(this.learners.find(learner => learner.id === id)).pipe(delay(500));
  }

  createLearner(learner: Learner): Observable<Learner> {
    learner.id = String(this.learners.length + 1); // Simple ID generation
    this.learners.push(learner);
    return of(learner).pipe(delay(500));
  }

  updateLearner(learner: Learner): Observable<Learner> {
    const index = this.learners.findIndex(l => l.id === learner.id);
    if (index > -1) {
      this.learners[index] = learner;
    }
    return of(learner).pipe(delay(500));
  }

  deleteLearner(id: string): Observable<boolean> {
    const initialLength = this.learners.length;
    this.learners = this.learners.filter(learner => learner.id !== id);
    return of(this.learners.length < initialLength).pipe(delay(500));
  }
}
