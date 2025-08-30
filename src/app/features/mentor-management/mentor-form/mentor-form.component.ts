import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MentorService } from '../../../data/mentor.service';
import { Mentor } from '../../../domain/mentor.model';

@Component({
  selector: 'app-mentor-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mentor-form.component.html',
  styleUrls: ['./mentor-form.component.css']
})
export class MentorFormComponent implements OnInit {
  mentor: Mentor = { id: '', name: '', email: '', specialty: '', bio: '' };
  isEditMode: boolean = false;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private mentorService: MentorService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loading = true;
      this.mentorService.getMentorById(id).subscribe({
        next: (data) => {
          if (data) {
            this.mentor = data;
          } else {
            this.error = 'Mentor not found.';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load mentor.';
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
      this.mentorService.updateMentor(this.mentor).subscribe({
        next: () => {
          this.router.navigate(['/mentors']);
        },
        error: (err) => {
          this.error = 'Failed to update mentor.';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.mentorService.createMentor(this.mentor).subscribe({
        next: () => {
          this.router.navigate(['/mentors']);
        },
        error: (err) => {
          this.error = 'Failed to create mentor.';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }
}
