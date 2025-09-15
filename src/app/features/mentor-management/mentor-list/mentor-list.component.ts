import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MentorService } from '../../../data/mentor.service';
import { Mentor } from '../../../domain/mentor.model';
import { RouterLink, ActivatedRoute } from '@angular/router';

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

  constructor(private mentorService: MentorService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Check for query parameters from home page search
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      this.loadMentors();
    });
  }

  loadMentors(): void {
    this.loading = true;
    this.error = null;
    
    const filters: any = {};
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
        console.error('Error loading mentors:', err);
        // Provide fallback mentors for unauthenticated users
        if (err.status === 401 || err.status === 403) {
          this.mentors = [
            {
              id: 1,
              nom: 'John Doe',
              email: 'john@example.com',
              competences: 'Web Development, React, Node.js',
              experience: '5+ years in React and Node.js development',
              available: true,
              active: true,
              role: 'MENTOR',
              status: 'APPROVED'
            },
            {
              id: 2,
              nom: 'Jane Smith',
              email: 'jane@example.com',
              competences: 'UI/UX Design, Figma, Adobe Creative Suite',
              experience: '7+ years in product design and user experience',
              available: true,
              active: true,
              role: 'MENTOR',
              status: 'APPROVED'
            },
            {
              id: 3,
              nom: 'Mike Johnson',
              email: 'mike@example.com',
              competences: 'Data Science, Python, Machine Learning',
              experience: '6+ years in machine learning and data analysis',
              available: false,
              active: true,
              role: 'MENTOR',
              status: 'APPROVED'
            }
          ];
          this.filteredMentors = [...this.mentors];
          this.error = null;
        } else {
          this.error = 'Erreur lors du chargement des mentors.';
        }
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    this.loadMentors();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.loadMentors();
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
