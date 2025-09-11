import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-role-select',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './role-select.component.html',
  styleUrls: ['./role-select.component.css']
})
export class RoleSelectComponent {
  constructor(private router: Router) {}

  choose(role: 'mentor' | 'learner') {
    this.router.navigate([role === 'mentor' ? '/sign-up/mentor' : '/sign-up/learner']);
  }
}


