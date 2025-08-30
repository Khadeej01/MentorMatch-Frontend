import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MentorService } from '../../../data/mentor.service';
import { Mentor } from '../../../domain/mentor.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mentor-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mentor-list.component.html',
  styleUrls: ['./mentor-list.component.css']
})
export class MentorListComponent implements OnInit {
  mentors: Mentor[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private mentorService: MentorService) { }

  ngOnInit(): void {
    this.loadMentors();
  }

  loadMentors(): void {
    this.loading = true;
    this.error = null;
    this.mentorService.getMentors().subscribe({
      next: (data) => {
        this.mentors = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load mentors.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteMentor(id: string): void {
    if (confirm('Are you sure you want to delete this mentor?')) {
      this.mentorService.deleteMentor(id).subscribe({
        next: (success) => {
          if (success) {
            this.mentors = this.mentors.filter(mentor => mentor.id !== id);
          } else {
            this.error = 'Failed to delete mentor.';
          }
        },
        error: (err) => {
          this.error = 'Failed to delete mentor.';
          console.error(err);
        }
      });
    }
  }
}
