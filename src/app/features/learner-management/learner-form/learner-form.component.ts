import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LearnerService } from '../../../data/learner.service';
import { Learner } from '../../../domain/learner.model';

@Component({
  selector: 'app-learner-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './learner-form.component.html',
  styleUrls: ['./learner-form.component.css']
})
export class LearnerFormComponent implements OnInit {
  learner: Learner = { id: '', nom: '', email: '', role: 'APPRENANT', objectifs: '', niveau: '' };
  isEditMode: boolean = false;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private learnerService: LearnerService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loading = true;
      this.learnerService.getLearnerById(id).subscribe({
        next: (data) => {
          if (data) {
            this.learner = data;
          } else {
            this.error = 'Learner not found.';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load learner.';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.error = null;
    if (this.isEditMode) {
      this.learnerService.updateLearner(this.learner.id, this.learner).subscribe({
        next: () => {
          this.router.navigate(['/learners']);
        },
        error: (err) => {
          this.error = 'Failed to update learner.';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.learnerService.createLearner(this.learner).subscribe({
        next: () => {
          this.router.navigate(['/learners']);
        },
        error: (err) => {
          this.error = 'Failed to create learner.';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }
}
