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
  mentors = [
    {
      name: 'John Doe',
      role: 'Software Engineer at Google',
      bio: 'I am a software engineer with 10 years of experience in web development.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      name: 'Jane Smith',
      role: 'Product Manager at Microsoft',
      bio: 'I am a product manager with a passion for building great products.',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
      name: 'Samuel Green',
      role: 'UX Designer at Apple',
      bio: 'I am a UX designer with a focus on creating user-centered designs.',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  ];

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