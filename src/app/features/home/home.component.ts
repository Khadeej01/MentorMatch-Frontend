import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../core/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  mentors: Mentor[] = [];
  filteredMentors: Mentor[] = [];
  availableSpecialties: string[] = [];
  selectedSpecialty: string = '';
  searchTerm: string = '';

  private slideshowTimerId: any;
  private currentImageIndex = 0;
  private activeLayerA = true;

  // Add your image files here - they should be in src/assets/
  heroImages: string[] = [
    'assets/pexels-fauxels-3184339.jpg',
    'assets/pexels-airamdphoto-15189552.jpg',
    'assets/pexels-cottonbro-6766999.jpg',
    'assets/pexels-ivan-samkov-7213210.jpg',
    'assets/pexels-airamdphoto-15189552.jpg'
  ];

  heroStyleA: { [key: string]: string } = {};
  heroStyleB: { [key: string]: string } = {};
  heroOpacityA = 1;
  heroOpacityB = 0;

  import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../core/footer/footer.component';
import { MentorService } from '../../data/mentor.service';
import { Mentor } from '../../domain/mentor.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  mentors: Mentor[] = [];
  filteredMentors: Mentor[] = [];
  availableSpecialties: string[] = [];
  selectedSpecialty: string = '';
  searchTerm: string = '';

  private slideshowTimerId: any;
  private currentImageIndex = 0;
  private activeLayerA = true;

  // Add your image files here - they should be in src/assets/
  heroImages: string[] = [
    'assets/pexels-fauxels-3184339.jpg',
    'assets/pexels-airamdphoto-15189552.jpg',
    'assets/pexels-cottonbro-6766999.jpg',
    'assets/pexels-ivan-samkov-7213210.jpg',
    'assets/pexels-airamdphoto-15189552.jpg'
  ];

  heroStyleA: { [key: string]: string } = {};
  heroStyleB: { [key: string]: string } = {};
  heroOpacityA = 1;
  heroOpacityB = 0;

  constructor(private mentorService: MentorService) { }

  ngOnInit(): void {
    // Initialize first image on layer A
    this.setLayerStyle('A', this.heroImages[this.currentImageIndex]);
    this.heroOpacityA = 1;
    this.heroOpacityB = 0;

    if (this.heroImages.length > 1) {
      this.slideshowTimerId = setInterval(() => {
        const nextIndex = (this.currentImageIndex + 1) % this.heroImages.length;
        const nextUrl = this.heroImages[nextIndex];

        // Prepare inactive layer with next image
        if (this.activeLayerA) {
          this.setLayerStyle('B', nextUrl);
          // Fade B in, A out
          this.heroOpacityB = 1;
          this.heroOpacityA = 0;
        } else {
          this.setLayerStyle('A', nextUrl);
          // Fade A in, B out
          this.heroOpacityA = 1;
          this.heroOpacityB = 0;
        }

        this.activeLayerA = !this.activeLayerA;
        this.currentImageIndex = nextIndex;
      }, 4000); // switch every 4 seconds
    }

    this.mentorService.getMentors().subscribe(mentors => {
      this.mentors = mentors;
      this.filteredMentors = mentors;
      this.availableSpecialties = [...new Set(mentors.map(m => m.specialty))];
    });
  }

  ngOnDestroy(): void {
    if (this.slideshowTimerId) {
      clearInterval(this.slideshowTimerId);
    }
  }

  private setLayerStyle(layer: 'A' | 'B', url: string): void {
    const style = {
      'background-image': `linear-gradient(rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.2) 100%), url('${url}')`,
      'background-size': 'contain',
      'background-position': 'top center',
      'background-repeat': 'no-repeat',
      'background-color': '#f1f5f9'
    };
    if (layer === 'A') {
      this.heroStyleA = style;
    } else {
      this.heroStyleB = style;
    }
  }

  filterMentors(): void {
    let tempMentors = this.mentors;

    // Apply specialty filter
    if (this.selectedSpecialty) {
      tempMentors = tempMentors.filter(mentor => mentor.specialty === this.selectedSpecialty);
    }

    // Apply search term filter
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempMentors = tempMentors.filter(mentor => 
        mentor.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        mentor.bio.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    this.filteredMentors = tempMentors;
  }
}

  ngOnDestroy(): void {
    if (this.slideshowTimerId) {
      clearInterval(this.slideshowTimerId);
    }
  }

  private setLayerStyle(layer: 'A' | 'B', url: string): void {
    const style = {
      'background-image': `linear-gradient(rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.2) 100%), url('${url}')`,
      'background-size': 'contain',
      'background-position': 'top center',
      'background-repeat': 'no-repeat',
      'background-color': '#f1f5f9'
    };
    if (layer === 'A') {
      this.heroStyleA = style;
    } else {
      this.heroStyleB = style;
    }
  }
}