import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../core/footer/footer.component';
import { MentorService } from '../../data/mentor.service';
import { Mentor } from '../../domain/mentor.model';
import { SafeHtmlPipe } from '../../core/pipes/safe-html.pipe';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, SafeHtmlPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('howItWorksViewport') howItWorksViewport: ElementRef | undefined;

  mentors: Mentor[] = [];
  filteredMentors: Mentor[] = [];
  availableSpecialties: string[] = [];
  selectedSpecialty: string = '';
  searchTerm: string = '';

  private slideshowTimerId: any;
  private howItWorksTimerId: any;
  private currentImageIndex = 0;
  private activeLayerA = true;

  private _activeWorkCardIndex = 0;
  get activeWorkCardIndex(): number {
    return this._activeWorkCardIndex;
  }
  set activeWorkCardIndex(index: number) {
    this._activeWorkCardIndex = index;
    setTimeout(() => this.scrollToActiveCard(), 0);
  }

  howItWorksCards = [
    {
      title: 'Create Profile',
      description: 'Set up your profile with your skills and interests.',
      image: 'assets/pexels-jay-soundo-2148060180-32444182.jpg',
      icon: '<path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,0,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"/>'
    },
    {
      title: 'Find a Mentor',
      description: 'Browse mentors and find the perfect match for your goals.',
      image: 'assets/pexels-yankrukov-8199135.jpg',
      icon: '<path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>'
    },
    {
      title: 'Book a Session',
      description: 'Schedule a session at a time that works for both of you.',
      image: 'assets/pexels-mart-production-8472879.jpg',
      icon: '<path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z"/>'
    },
    {
      title: 'Start Learning',
      description: 'Begin your mentorship journey and achieve your goals.',
      image: 'assets/pexels-tara-winstead-8849288.jpg',
      icon: '<path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"/>'
    }
  ];

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

  constructor(private mentorService: MentorService, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    // If already logged in, redirect to appropriate dashboard
    try {
      if (this.authService.isLoggedIn()) {
        const role = this.authService.getUserRole();
        if (role === 'mentor') {
          this.router.navigate(['/mentor-dashboard']);
          return;
        }
        if (role === 'learner') {
          this.router.navigate(['/learner-dashboard']);
          return;
        }
        if (role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
          return;
        }
      }
    } catch {}

    this.startHeroSlideshow();
    this.startHowItWorksSlideshow();

    this.mentorService.getMentors().subscribe(mentors => {
      this.mentors = mentors;
      this.filteredMentors = mentors;
      this.availableSpecialties = [...new Set(mentors.map(m => m.competences))];
    });
  }

  ngOnDestroy(): void {
    if (this.slideshowTimerId) {
      clearInterval(this.slideshowTimerId);
    }
    if (this.howItWorksTimerId) {
      clearInterval(this.howItWorksTimerId);
    }
  }

  nextWorkCard(): void {
    this.activeWorkCardIndex = (this.activeWorkCardIndex + 1) % this.howItWorksCards.length;
    this.resetHowItWorksTimer();
  }

  prevWorkCard(): void {
    this.activeWorkCardIndex = (this.activeWorkCardIndex - 1 + this.howItWorksCards.length) % this.howItWorksCards.length;
    this.resetHowItWorksTimer();
  }

  private scrollToActiveCard(): void {
    const cardElement = document.getElementById(`work-card-${this.activeWorkCardIndex}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  private resetHowItWorksTimer(): void {
    clearInterval(this.howItWorksTimerId);
    this.startHowItWorksSlideshow();
  }

  private startHowItWorksSlideshow(): void {
    this.howItWorksTimerId = setInterval(() => {
      this.activeWorkCardIndex = (this.activeWorkCardIndex + 1) % this.howItWorksCards.length;
    }, 3000); // switch every 3 seconds
  }

  private startHeroSlideshow(): void {
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
      tempMentors = tempMentors.filter(mentor => mentor.competences === this.selectedSpecialty);
    }

    // Apply search term filter
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempMentors = tempMentors.filter(mentor =>
        mentor.nom.toLowerCase().includes(lowerCaseSearchTerm) ||
        mentor.experience.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    this.filteredMentors = tempMentors;
  }
}