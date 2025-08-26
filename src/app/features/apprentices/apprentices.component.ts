import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-apprentices',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './apprentices.component.html',
  styleUrls: ['./apprentices.component.css']
})
export class ApprenticesComponent {}

