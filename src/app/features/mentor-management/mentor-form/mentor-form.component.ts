import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MentorService } from '../../../data/mentor.service';
import { Mentor, MentorCreateRequest, MentorUpdateRequest } from '../../../domain/mentor.model';

@Component({
  selector: 'app-mentor-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mentor-form.component.html',
  styleUrls: ['./mentor-form.component.css']
})
export class MentorFormComponent implements OnInit {
  mentor: Mentor = { 
    id: 0, 
    nom: '', 
    email: '', 
    competences: '', 
    experience: '', 
    available: true, 
    role: 'MENTOR' 
  };
  
  isEditMode: boolean = false;
  loading: boolean = false;
  error: string | null = null;

  // Compétences disponibles
  competences: string[] = [
    'Java', 'Spring Boot', 'React', 'Angular', 'TypeScript', 
    'Python', 'Data Science', 'Machine Learning', 'DevOps', 
    'Docker', 'Kubernetes', 'Node.js', 'Express', 'MongoDB',
    'Vue.js', 'JavaScript', 'CSS', 'HTML', 'SQL', 'Git'
  ];

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
      this.mentorService.getMentorById(+id).subscribe({
        next: (data) => {
          this.mentor = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement du mentor.';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.loading = true;
    this.error = null;

    if (this.isEditMode) {
      const updateRequest: MentorUpdateRequest = {
        id: this.mentor.id,
        nom: this.mentor.nom,
        email: this.mentor.email,
        competences: this.mentor.competences,
        experience: this.mentor.experience,
        available: this.mentor.available,
        role: this.mentor.role
      };

      this.mentorService.updateMentor(this.mentor.id, updateRequest).subscribe({
        next: () => {
          this.router.navigate(['/mentors']);
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour du mentor.';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      const createRequest: MentorCreateRequest = {
        nom: this.mentor.nom,
        email: this.mentor.email,
        competences: this.mentor.competences,
        experience: this.mentor.experience,
        available: this.mentor.available,
        role: this.mentor.role
      };

      this.mentorService.createMentor(createRequest).subscribe({
        next: () => {
          this.router.navigate(['/mentors']);
        },
        error: (err) => {
          this.error = 'Erreur lors de la création du mentor.';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  private isFormValid(): boolean {
    return !!(this.mentor.nom && this.mentor.email && this.mentor.competences && this.mentor.experience);
  }

  addCompetence(competence: string): void {
    if (competence && !this.mentor.competences.includes(competence)) {
      if (this.mentor.competences) {
        this.mentor.competences += ', ' + competence;
      } else {
        this.mentor.competences = competence;
      }
    }
  }

  removeCompetence(competence: string): void {
    const competences = this.mentor.competences.split(',').map(c => c.trim());
    const filtered = competences.filter(c => c !== competence);
    this.mentor.competences = filtered.join(', ');
  }

  getCompetencesList(): string[] {
    return this.mentor.competences ? this.mentor.competences.split(',').map(c => c.trim()) : [];
  }
}
