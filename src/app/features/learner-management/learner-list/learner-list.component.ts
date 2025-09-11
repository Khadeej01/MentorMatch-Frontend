import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearnerService } from '../../../data/learner.service';
import { Learner } from '../../../domain/learner.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-learner-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './learner-list.component.html',
  styleUrls: ['./learner-list.component.css']
})
export class LearnerListComponent implements OnInit {
  learners: Learner[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private learnerService: LearnerService) { }

  ngOnInit(): void {
    this.loadLearners();
  }

  loadLearners(): void {
    this.loading = true;
    this.error = null;
    this.learnerService.getLearners().subscribe({
      next: (data) => {
        this.learners = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load learners.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteLearner(id: string): void {
    if (confirm('Are you sure you want to delete this learner?')) {
      this.learnerService.deleteLearner(id).subscribe({
        next: () => {
          this.learners = this.learners.filter(learner => learner.id !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete learner.';
          console.error(err);
        }
      });
    }
  }
}
