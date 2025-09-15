import { Routes } from '@angular/router';
import { SignInComponent } from './features/auth/sign-in/sign-in.component';
import { SignUpComponent } from './features/auth/sign-up/sign-up.component';
import { RoleSelectComponent } from './features/auth/role-select/role-select.component';
import { MentorSignUpComponent } from './features/auth/mentor-sign-up/mentor-sign-up.component';
import { LearnerSignUpComponent } from './features/auth/learner-sign-up/learner-sign-up.component';
import { ApprenticesComponent } from './features/apprentices/apprentices.component';

import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { MentorDashboardComponent } from './features/mentor-dashboard/mentor-dashboard.component';
import { LearnerDashboardComponent } from './features/learner-dashboard/learner-dashboard.component';
import { HomeComponent } from './features/home/home.component';
import { MentorListComponent } from './features/mentor-management/mentor-list/mentor-list.component';
import { MentorFormComponent } from './features/mentor-management/mentor-form/mentor-form.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { LearnerListComponent } from './features/learner-management/learner-list/learner-list.component';
import { LearnerFormComponent } from './features/learner-management/learner-form/learner-form.component';
import { MentorDetailComponent } from './features/mentor-detail/mentor-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: RoleSelectComponent },
  { path: 'sign-up/mentor', component: MentorSignUpComponent },
  { path: 'sign-up/learner', component: LearnerSignUpComponent },
  { path: 'apprentices', component: ApprenticesComponent, canActivate: [authGuard] },
  
  {
    path: 'mentor-dashboard',
    component: MentorDashboardComponent,
    canActivate: [roleGuard],
    data: { expectedRole: 'mentor' }
  },
  {
    path: 'mentor-edit',
    loadComponent: () => import('./features/mentor-edit/mentor-edit.component').then(m => m.MentorEditComponent),
    canActivate: [roleGuard],
    data: { expectedRole: 'mentor' }
  },
    {
    path: 'learner-dashboard',
    component: LearnerDashboardComponent,
    canActivate: [roleGuard],
    data: { expectedRole: 'learner' }
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [roleGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'mentors',
    component: MentorListComponent
    // Removed canActivate to allow public access to mentor browsing
  },
  {
    path: 'mentors/new',
    component: MentorFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'mentor' }
  },
  {
    path: 'mentors/:id/edit',
    component: MentorFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'mentor' }
  },
  {
    path: 'learners',
    component: LearnerListComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'learners/new',
    component: LearnerFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'admin' }
  },
  {
    path: 'mentors/:id',
    component: MentorDetailComponent
    // Removed canActivate to allow public access to mentor details
  },
  {
    path: 'learners/:id/edit',
    component: LearnerFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'admin' }
  }
];