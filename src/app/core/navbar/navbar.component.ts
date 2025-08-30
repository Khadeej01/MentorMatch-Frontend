import { Component, OnDestroy, AfterViewInit, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [RouterLink, CommonModule],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  isMenuOpen = false;
  activeSectionId: string | null = null;
  currentUser: User | null = null;
  private observer?: IntersectionObserver;
  private userSubscription: Subscription = new Subscription();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const sectionIds: string[] = ['home', 'how-it-works', 'our-mentors', 'resources', 'about'];

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              this.activeSectionId = element.id;
            } else if (this.activeSectionId === entry.target.id) {
              // If the current active section is no longer intersecting, clear it
              this.activeSectionId = null;
            }
          });
        },
        { threshold: 0.4 }
      );

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          this.observer!.observe(el);
        }
      });
    }, 100); // 100ms delay
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.userSubscription.unsubscribe();
  }

  getUnderlineClass(targetId: string): string {
    return this.activeSectionId === targetId ? 'border-b-[#8DBCC7]' : 'border-b-transparent';
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'admin';
  }

  getUserRole(): 'mentor' | 'learner' | 'admin' | null {
    return this.authService.getUserRole();
  }

  signOut(): void {
    this.authService.signOut();
    this.router.navigate(['/']);
  }
}
