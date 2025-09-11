import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MentorService } from '../../../data/mentor.service';
import { Mentor } from '../../../domain/mentor.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mentor-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mentor-list.component.html',
  styleUrls: ['./mentor-list.component.css']
})
export class MentorListComponent implements OnInit {
  mentors: Mentor[] = [];
  filteredMentors: Mentor[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  // Filtres
  searchTerm: string = '';
  selectedCompetence: string = '';
  showAvailableOnly: boolean = false;
  
  // Compétences disponibles pour le filtre
  competences: string[] = [
    'Java', 'Spring Boot', 'React', 'Angular', 'TypeScript', 
    'Python', 'Data Science', 'Machine Learning', 'DevOps', 
    'Docker', 'Kubernetes', 'Node.js', 'Express', 'MongoDB'
  ];

  constructor(private mentorService: MentorService) { }

  ngOnInit(): void {
    this.loadMentors();
  }

  loadMentors(): void {
    this.loading = true;
    this.error = null;
    
    const filters: any = {};
    if (this.showAvailableOnly) {
      filters.available = true;
    }
    if (this.selectedCompetence) {
      filters.competences = this.selectedCompetence;
    }
    if (this.searchTerm) {
      filters.search = this.searchTerm;
    }

    this.mentorService.getMentors(filters).subscribe({
      next: (data) => {
        this.mentors = data;
        this.filteredMentors = [...data];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des mentors.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSearchChange(): void {
    this.loadMentors();
  }

  onFilterChange(): void {
    this.loadMentors();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCompetence = '';
    this.showAvailableOnly = false;
    this.loadMentors();
  }

  deleteMentor(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce mentor ?')) {
      this.mentorService.deleteMentor(id).subscribe({
        next: () => {
          this.mentors = this.mentors.filter(mentor => mentor.id !== id);
          this.filteredMentors = this.filteredMentors.filter(mentor => mentor.id !== id);
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression du mentor.';
          console.error(err);
        }
      });
    }
  }

  initTestMentors(): void {
    this.loading = true;
    this.mentorService.initTestMentors().subscribe({
      next: () => {
        this.loadMentors();
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'initialisation des mentors de test.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getCompetencesList(competences: string): string[] {
    return competences.split(',').map(c => c.trim());
  }

  getAvailabilityBadgeClass(available: boolean): string {
    return available 
      ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs'
      : 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs';
  }
}
