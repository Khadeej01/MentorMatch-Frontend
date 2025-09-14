import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../core/auth/auth.service';
import { MentorService } from '../../data/mentor.service';
import { LearnerService } from '../../data/learner.service';
import { BookingService } from '../../data/booking.service';
import { AdminService, AdminEvaluation, AdminSession, AdminMentorStats, AdminLearnerStats } from '../../data/admin.service';
import { Mentor, MentorUpdateRequest } from '../../domain/mentor.model';
import { Learner } from '../../domain/learner.model';
import { Booking } from '../../domain/booking.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  
  // Data
  mentors: Mentor[] = [];
  learners: Learner[] = [];
  allBookings: Booking[] = [];
  
  // UI state
  loading = false;
  error: string | null = null;
  activeTab: 'mentors' | 'learners' | 'bookings' | 'stats' | 'evaluations' | 'sessions' | 'calendar' = 'mentors';
  
  // Search and filters
  searchTerm = '';
  statusFilter = 'all';
  mentorFilter = 'all';
  learnerFilter = 'all';
  competenceFilter = 'all';
  mentorStatusFilter = 'all';
  
  // Advanced booking filters
  bookingDateStart = '';
  bookingDateEnd = '';
  
  // Calendar view
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();
  calendarData: any = null;
  
  // Modal states
  mentorDetailModalOpen = false;
  mentorEvaluationsModalOpen = false;
  mentorSessionsModalOpen = false;
  mentorEditModalOpen = false;
  learnerDetailModalOpen = false;
  learnerSessionsModalOpen = false;
  forceCancelModalOpen = false;
  bookingStatsModalOpen = false;
  
  // Selected data
  selectedMentor: Mentor | null = null;
  selectedMentorEvaluations: AdminEvaluation[] = [];
  selectedMentorSessions: AdminSession[] = [];
  selectedMentorStats: AdminMentorStats | null = null;
  selectedLearnerStats: AdminLearnerStats | null = null;
  selectedLearnerSessions: AdminSession[] = [];
  
  // Edit mentor form data
  editMentorForm: Partial<Mentor> = {};
  
  // Force cancellation data
  selectedBookingForCancel: Booking | null = null;
  cancellationReason = '';
  cancellationType = 'ADMIN_FORCED';
  
  // Booking statistics
  bookingStatistics: any = null;
  statisticsPeriod = 'month';
  
  // Debug methods
  getDebugInfo(): any {
    return {
      mentorsLoaded: this.mentors?.length || 0,
      learnersLoaded: this.learners?.length || 0,
      bookingsLoaded: this.allBookings?.length || 0,
      evaluationsLoaded: this.allEvaluations?.length || 0,
      sessionsLoaded: this.allSessions?.length || 0,
      loading: this.loading,
      error: this.error,
      currentUser: this.currentUser,
      activeTab: this.activeTab
    };
  }
  
  logDebugInfo(): void {
    console.log('🔍 Debug Info:', this.getDebugInfo());
  }
  
  competences: string[] = [
    'Java', 'Spring Boot', 'React', 'Angular', 'TypeScript',
    'Python', 'Data Science', 'Machine Learning', 'DevOps',
    'Docker', 'Kubernetes', 'Node.js', 'Express', 'MongoDB'
  ];
  
  // Expose Object for template use
  Object = Object;
  
  // Stats
  totalMentors = 0;
  totalLearners = 0;
  totalBookings = 0;
  pendingBookings = 0;
  confirmedBookings = 0;
  pendingMentors = 0;
  approvedMentors = 0;
  rejectedMentors = 0;
  totalSessions = 0;
  totalEvaluations = 0;

  selectedLearner: Learner | null = null;
  learnerBookings: Booking[] = [];
  bookingModalOpen = false;
  
  // All evaluations and sessions for admin view
  allEvaluations: AdminEvaluation[] = [];
  allSessions: AdminSession[] = [];

  constructor(
    private authService: AuthService,
    private mentorService: MentorService,
    private learnerService: LearnerService,
    private bookingService: BookingService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 Admin Dashboard Component initialized');
    this.authService.currentUser$.subscribe((user: User | null) => {
      console.log('👤 Current user:', user);
      this.currentUser = user;
      if (this.currentUser && this.currentUser.role === 'admin') {
        console.log('✅ User is admin, loading data...');
        this.loadAllData();
      } else {
        console.log('❌ User is not admin, redirecting...');
        this.router.navigate(['/']);
      }
    });
  }

  loadAllData(): void {
    this.loading = true;
    this.error = null;
    
    console.log('🔍 Starting to load admin dashboard data...');
    
    // Load enhanced dashboard stats
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        console.log('📊 Dashboard stats loaded:', stats);
        this.totalMentors = stats.totalMentors || 0;
        this.totalLearners = stats.totalApprenants || 0;
        this.totalBookings = stats.totalBookings || 0;
        this.pendingBookings = stats.pendingBookings || 0;
        this.confirmedBookings = stats.confirmedBookings || 0;
        this.pendingMentors = stats.pendingMentors || 0;
        this.approvedMentors = stats.approvedMentors || 0;
        this.rejectedMentors = stats.rejectedMentors || 0;
        this.totalSessions = stats.totalSessions || 0;
        this.totalEvaluations = stats.totalEvaluations || 0;
      },
      error: (err) => {
        console.error('❌ Failed to load dashboard stats:', err);
        // Continue loading other data even if stats fail
      }
    });
    
    // Load mentors using admin service for full access
    this.adminService.getAllMentors().subscribe({
      next: (mentors) => {
        console.log('👨‍🏫 Mentors loaded:', mentors.length, mentors);
        this.mentors = mentors || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load mentors:', err);
        this.error = 'Failed to load mentors. Please check if the backend is running.';
        this.loading = false;
        // Try fallback to regular mentor service
        this.tryFallbackMentorLoad();
      }
    });

    // Load learners using admin service
    this.adminService.getAllLearners().subscribe({
      next: (learners) => {
        console.log('👩‍🎓 Learners loaded:', learners.length, learners);
        this.learners = learners || [];
      },
      error: (err) => {
        console.error('❌ Failed to load learners:', err);
        // Try fallback to regular learner service
        this.tryFallbackLearnerLoad();
      }
    });

    // Load all bookings
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        console.log('📅 Bookings loaded:', bookings.length, bookings);
        this.allBookings = bookings || [];
      },
      error: (err) => {
        console.error('❌ Failed to load bookings:', err);
        this.allBookings = [];
      }
    });
    
    // Load all evaluations
    this.adminService.getAllEvaluations().subscribe({
      next: (evaluations) => {
        console.log('⭐ Evaluations loaded:', evaluations.length, evaluations);
        this.allEvaluations = evaluations || [];
      },
      error: (err) => {
        console.error('❌ Failed to load evaluations:', err);
        this.allEvaluations = [];
      }
    });
    
    // Load all sessions
    this.adminService.getAllSessions().subscribe({
      next: (sessions) => {
        console.log('🎯 Sessions loaded:', sessions.length, sessions);
        this.allSessions = sessions || [];
      },
      error: (err) => {
        console.error('❌ Failed to load sessions:', err);
        this.allSessions = [];
      }
    });
  }
  
  // Fallback methods to try regular services if admin endpoints fail
  private tryFallbackMentorLoad(): void {
    console.log('🔄 Trying fallback mentor loading...');
    this.mentorService.getMentors().subscribe({
      next: (mentors: Mentor[]) => {
        console.log('👨‍🏫 Fallback mentors loaded:', mentors.length, mentors);
        this.mentors = mentors || [];
        this.error = null; // Clear error since fallback worked
      },
      error: (err: any) => {
        console.error('❌ Fallback mentor loading also failed:', err);
        this.mentors = [];
      }
    });
  }
  
  private tryFallbackLearnerLoad(): void {
    console.log('🔄 Trying fallback learner loading...');
    this.learnerService.getLearners().subscribe({
      next: (learners: Learner[]) => {
        console.log('👩‍🎓 Fallback learners loaded:', learners.length, learners);
        this.learners = learners || [];
      },
      error: (err: any) => {
        console.error('❌ Fallback learner loading also failed:', err);
        this.learners = [];
      }
    });
  }
  
  // Fallback delete methods
  private tryFallbackMentorDelete(mentorId: number): void {
    console.log('🔄 Trying fallback mentor deletion with regular mentor service...');
    this.mentorService.deleteMentor(mentorId).subscribe({
      next: () => {
        console.log('✅ Fallback mentor deletion successful!');
        this.mentors = this.mentors.filter(m => m.id !== mentorId);
        this.loadAllData();
        this.error = null;
      },
      error: (err: any) => {
        console.error('❌ Fallback mentor deletion also failed:', err);
        this.error = 'Failed to delete mentor with both admin and regular services.';
      }
    });
  }
  
  // Re-authentication helper method
  suggestReAuthentication(): void {
    setTimeout(() => {
      if (confirm('Would you like to log out and log back in as admin to refresh your permissions?')) {
        this.authService.signOut();
        this.router.navigate(['/sign-in']);
      }
    }, 2000); // Give user time to read the error message
  }
  
  // Check authentication status
  checkAuthStatus(): void {
    const token = this.authService.getAccessToken();
    const user = this.currentUser;
    const authData = this.authService.getAuthData();
    
    console.log('🔐 Authentication Status Check:', {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'None',
      user: user,
      fullAuthData: authData,
      isLoggedIn: this.authService.isLoggedIn(),
      userRole: this.authService.getUserRole()
    });
    
    alert(`Auth Status:\n` +
          `Logged in: ${this.authService.isLoggedIn()}\n` +
          `User: ${user?.fullName || 'None'} (${user?.role || 'None'})\n` +
          `Has Token: ${!!token}\n` +
          `Token Length: ${token?.length || 0}`);
  }

  // Tab management
  setActiveTab(tab: 'mentors' | 'learners' | 'bookings' | 'stats' | 'evaluations' | 'sessions' | 'calendar'): void {
    this.activeTab = tab;
    
    // Load specific data when switching to calendar or stats tabs
    if (tab === 'calendar') {
      this.loadCalendarData();
    } else if (tab === 'stats') {
      this.loadBookingStatistics();
    }
  }

  // Search and filtering
  getFilteredMentors(): Mentor[] {
    if (!this.mentors || !Array.isArray(this.mentors)) {
      console.log('⚠️ Mentors array is not available:', this.mentors);
      return [];
    }
    
    let filtered = [...this.mentors]; // Create a copy to avoid mutation
    console.log('🔍 Filtering mentors. Total:', filtered.length, 'Search term:', this.searchTerm, 'Status filter:', this.mentorStatusFilter);
    
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(m => 
        (m.nom && m.nom.toLowerCase().includes(searchLower)) ||
        (m.competences && m.competences.toLowerCase().includes(searchLower)) ||
        (m.email && m.email.toLowerCase().includes(searchLower))
      );
      console.log('🔍 After search filter:', filtered.length);
    }
    
    if (this.mentorStatusFilter && this.mentorStatusFilter !== 'all') {
      filtered = filtered.filter(m => m.status && m.status.toUpperCase() === this.mentorStatusFilter.toUpperCase());
      console.log('🔍 After status filter:', filtered.length);
    }
    
    return filtered;
  }
  
  getFilteredEvaluations(): AdminEvaluation[] {
    let filtered = this.allEvaluations;
    
    if (this.searchTerm) {
      // Filter by rating or comment content
      filtered = filtered.filter(e => 
        e.commentaire?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        e.note.toString().includes(this.searchTerm)
      );
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  getFilteredSessions(): AdminSession[] {
    let filtered = this.allSessions;
    
    if (this.searchTerm) {
      filtered = filtered.filter(s => 
        s.sujet?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    if (this.mentorFilter !== 'all') {
      filtered = filtered.filter(s => s.mentorId === Number(this.mentorFilter));
    }
    
    return filtered.sort((a, b) => new Date(b.dateHeure).getTime() - new Date(a.dateHeure).getTime());
  }

  getFilteredLearners(): Learner[] {
    if (!this.learners || !Array.isArray(this.learners)) {
      console.log('⚠️ Learners array is not available:', this.learners);
      return [];
    }
    
    let filtered = [...this.learners]; // Create a copy to avoid mutation
    console.log('🔍 Filtering learners. Total:', filtered.length, 'Search term:', this.searchTerm);
    
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(l => 
        (l.nom && l.nom.toLowerCase().includes(searchLower)) ||
        (l.objectifs && l.objectifs.toLowerCase().includes(searchLower)) ||
        (l.email && l.email.toLowerCase().includes(searchLower))
      );
      console.log('🔍 After search filter:', filtered.length);
    }
    
    return filtered;
  }

  getFilteredBookings(): Booking[] {
    if (!this.allBookings || !Array.isArray(this.allBookings)) {
      console.log('⚠️ Bookings array is not available:', this.allBookings);
      return [];
    }
    
    let filtered = [...this.allBookings];
    console.log('🔍 Filtering bookings. Total:', filtered.length, 'Status filter:', this.statusFilter);

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status && b.status.toUpperCase() === this.statusFilter.toUpperCase());
      console.log('🔍 After status filter:', filtered.length);
    }

    if (this.mentorFilter !== 'all') {
      filtered = filtered.filter(b => b.mentorId === this.mentorFilter);
    }

    if (this.learnerFilter !== 'all') {
      filtered = filtered.filter(b => b.apprenantId === this.learnerFilter);
    }

    if (this.competenceFilter !== 'all') {
      const mentorsWithCompetence = this.mentors.filter(m => m.competences && m.competences.toLowerCase().includes(this.competenceFilter.toLowerCase()));
      const mentorIds = mentorsWithCompetence.map(m => m.id);
      filtered = filtered.filter(b => mentorIds.includes(Number(b.mentorId)));
    }
    
    // Date range filter
    if (this.bookingDateStart) {
      const startDate = new Date(this.bookingDateStart);
      filtered = filtered.filter(b => new Date(b.dateTime) >= startDate);
    }
    
    if (this.bookingDateEnd) {
      const endDate = new Date(this.bookingDateEnd);
      filtered = filtered.filter(b => new Date(b.dateTime) <= endDate);
    }
    
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(b => 
        (b.mentorName && b.mentorName.toLowerCase().includes(searchLower)) ||
        (b.apprenantName && b.apprenantName.toLowerCase().includes(searchLower)) ||
        (b.notes && b.notes.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }

  // Enhanced User management actions
  updateMentorStatus(mentor: Mentor, status: 'APPROVED' | 'REJECTED'): void {
    this.adminService.updateMentorStatus(mentor.id, status).subscribe({
      next: () => {
        this.loadAllData(); // Reload data to reflect the change
      },
      error: (err) => {
        console.error('Failed to update mentor status:', err);
        this.error = 'Failed to update mentor status';
      }
    });
  }
  
  // New mentor management methods
  viewMentorDetails(mentor: Mentor): void {
    this.selectedMentor = mentor;
    this.loadMentorDetails(mentor.id);
    this.mentorDetailModalOpen = true;
  }
  
  private loadMentorDetails(mentorId: number): void {
    // Load mentor statistics
    this.adminService.getMentorStats(mentorId).subscribe({
      next: (stats) => {
        this.selectedMentorStats = stats;
      },
      error: (err) => {
        console.error('Failed to load mentor stats:', err);
      }
    });
  }
  
  viewMentorEvaluations(mentor: Mentor): void {
    this.selectedMentor = mentor;
    this.adminService.getMentorEvaluations(mentor.id).subscribe({
      next: (evaluations) => {
        this.selectedMentorEvaluations = evaluations;
        this.mentorEvaluationsModalOpen = true;
      },
      error: (err) => {
        console.error('Failed to load mentor evaluations:', err);
        this.error = 'Failed to load mentor evaluations';
      }
    });
  }
  
  viewMentorSessions(mentor: Mentor): void {
    this.selectedMentor = mentor;
    this.adminService.getMentorSessions(mentor.id).subscribe({
      next: (sessions) => {
        this.selectedMentorSessions = sessions;
        this.mentorSessionsModalOpen = true;
      },
      error: (err) => {
        console.error('Failed to load mentor sessions:', err);
        this.error = 'Failed to load mentor sessions';
      }
    });
  }
  
  editMentor(mentor: Mentor): void {
    this.selectedMentor = mentor;
    // Initialize edit form with current mentor data
    this.editMentorForm = {
      id: mentor.id,
      nom: mentor.nom,
      email: mentor.email,
      competences: mentor.competences,
      experience: mentor.experience,
      available: mentor.available,
      status: mentor.status
    };
    this.mentorEditModalOpen = true;
  }
  
  saveMentorChanges(): void {
    if (this.selectedMentor && this.editMentorForm.id) {
      this.adminService.updateMentor(this.editMentorForm.id, this.editMentorForm).subscribe({
        next: () => {
          this.mentorEditModalOpen = false;
          this.selectedMentor = null;
          this.editMentorForm = {};
          this.loadAllData(); // Reload data to reflect changes
        },
        error: (err: any) => {
          console.error('Failed to update mentor:', err);
          this.error = 'Failed to update mentor';
        }
      });
    }
  }

  deleteUser(userId: string | number, userType: 'mentor' | 'learner'): void {
    const userName = userType === 'mentor' 
      ? this.mentors.find(m => m.id === Number(userId))?.nom || `Mentor #${userId}`
      : this.learners.find(l => l.id === String(userId))?.nom || `Learner #${userId}`;
    
    // Check current user permissions
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.error = 'You must be logged in as an admin to delete users.';
      return;
    }
    
    const token = this.authService.getAccessToken();
    console.log('🔐 Current auth status:', {
      user: this.currentUser,
      hasToken: !!token,
      tokenLength: token?.length || 0
    });
    
    if (confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      console.log(`🗑️ Attempting to delete ${userType}:`, { userId, userName });
      
      if (userType === 'mentor') {
        // Try regular mentor service first since admin endpoints might not be configured
        console.log('🔄 Using regular mentor service for deletion (admin endpoint issues)...');
        
        // Show immediate feedback to user
        const mentorIndex = this.mentors.findIndex(m => m.id === Number(userId));
        if (mentorIndex !== -1) {
          // Optimistically remove from UI immediately
          this.mentors = this.mentors.filter(m => m.id !== Number(userId));
          console.log('📋 Optimistically removed mentor from UI for better UX');
        }
        
        this.mentorService.deleteMentor(Number(userId)).subscribe({
          next: () => {
            console.log('✅ Mentor deleted successfully via regular service, keeping UI updated...');
            // Mentor already removed optimistically, just reload to ensure sync
            this.loadAllData();
            this.error = null;
          },
          error: (err: any) => {
            console.error('❌ Failed to delete mentor via regular service, restoring UI and trying admin service...', err);
            // Restore the mentor to UI since deletion failed
            this.loadAllData();
            this.tryAdminMentorDelete(Number(userId));
          }
        });
      } else {
        this.adminService.deleteLearner(String(userId)).subscribe({
          next: () => {
            console.log('✅ Learner deleted successfully, reloading data...');
            // Remove the learner from local array immediately for better UX
            this.learners = this.learners.filter(l => l.id !== String(userId));
            // Also reload all data to ensure consistency
            this.loadAllData();
            this.error = null; // Clear any previous errors
          },
          error: (err: any) => {
            console.error('❌ Failed to delete learner:', err);
            
            // Handle specific permission errors
            if (err.status === 403) {
              this.error = 'You do not have permission to delete this learner.';
              this.suggestReAuthentication();
            } else if (err.status === 401) {
              this.error = 'Authentication failed. Please log in again as admin.';
              this.suggestReAuthentication();
            } else if (err.status === 0) {
              this.error = 'Cannot connect to server. Please check if the backend is running.';
            } else if (err.status === 404) {
              this.error = 'Learner not found on server. It may have already been deleted.';
              // Remove from local array anyway
              this.learners = this.learners.filter(l => l.id !== String(userId));
            } else {
              this.error = `Failed to delete learner: ${err.error?.message || err.message || 'Unknown error'}`;
            }
          }
        });
      }
    }
  }

  /**
   * Fallback method to try deleting mentor via admin service
   */
  private tryAdminMentorDelete(userId: number): void {
    console.log('🔄 Attempting deletion via admin service...');
    this.adminService.deleteMentor(userId).subscribe({
      next: () => {
        console.log('✅ Mentor deleted successfully via admin service, updating UI...');
        this.mentors = this.mentors.filter(m => m.id !== userId);
        this.loadAllData();
        this.error = null;
      },
      error: (err: any) => {
        console.error('❌ Both deletion methods failed:', err);
        
        // If we get a 404, the mentor might already be deleted on server
        if (err.status === 404) {
          console.log('📝 404 error - mentor may already be deleted on server, removing from UI...');
          this.mentors = this.mentors.filter(m => m.id !== userId);
          this.error = 'Mentor was deleted but there may be sync issues. List refreshed to show current state.';
          this.loadAllData(); // Refresh to get current server state
        } else if (err.status === 403) {
          this.error = 'You do not have permission to delete this mentor.';
          this.suggestReAuthentication();
        } else if (err.status === 401) {
          this.error = 'Authentication failed. Please log in again as admin.';
          this.suggestReAuthentication();
        } else if (err.status === 0) {
          this.error = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.error = `Failed to delete mentor: ${err.error?.message || err.message || 'Unknown error'}`;
        }
      }
    });
  }

  toggleLearnerStatus(learner: Learner): void {
    this.adminService.updateLearnerStatus(learner.id, !learner.active).subscribe({
      next: () => {
        this.loadAllData();
      },
      error: (err) => {
        console.error('Failed to update learner status:', err);
        this.error = 'Failed to update learner status';
      }
    });
  }
  
  // New learner management methods
  viewLearnerDetails(learner: Learner): void {
    this.selectedLearner = learner;
    this.loadLearnerDetails(learner.id);
    this.learnerDetailModalOpen = true;
  }
  
  private loadLearnerDetails(learnerId: string): void {
    // Load learner statistics
    this.adminService.getLearnerStats(learnerId).subscribe({
      next: (stats) => {
        this.selectedLearnerStats = stats;
      },
      error: (err) => {
        console.error('Failed to load learner stats:', err);
      }
    });
  }
  
  viewLearnerSessions(learner: Learner): void {
    this.selectedLearner = learner;
    this.adminService.getLearnerSessions(learner.id).subscribe({
      next: (sessions) => {
        this.selectedLearnerSessions = sessions;
        this.learnerSessionsModalOpen = true;
      },
      error: (err) => {
        console.error('Failed to load learner sessions:', err);
        this.error = 'Failed to load learner sessions';
      }
    });
  }
  
  editLearner(learner: Learner): void {
    // This would open an edit form - for now, just log
    console.log('Edit learner:', learner);
    // You could implement an edit modal here
  }

  viewLearnerBookings(learner: Learner): void {
    this.selectedLearner = learner;
    this.learnerBookings = this.allBookings.filter(b => b.apprenantId === learner.id);
    this.bookingModalOpen = true;
  }

  closeBookingModal(): void {
    this.bookingModalOpen = false;
    this.selectedLearner = null;
    this.learnerBookings = [];
  }
  
  // New modal closing methods
  closeMentorDetailModal(): void {
    this.mentorDetailModalOpen = false;
    this.selectedMentor = null;
    this.selectedMentorStats = null;
  }
  
  closeMentorEvaluationsModal(): void {
    this.mentorEvaluationsModalOpen = false;
    this.selectedMentor = null;
    this.selectedMentorEvaluations = [];
  }
  
  closeMentorSessionsModal(): void {
    this.mentorSessionsModalOpen = false;
    this.selectedMentor = null;
    this.selectedMentorSessions = [];
  }
  
  closeMentorEditModal(): void {
    this.mentorEditModalOpen = false;
    this.selectedMentor = null;
    this.editMentorForm = {};
  }
  
  closeLearnerDetailModal(): void {
    this.learnerDetailModalOpen = false;
    this.selectedLearner = null;
    this.selectedLearnerStats = null;
  }
  
  closeLearnerSessionsModal(): void {
    this.learnerSessionsModalOpen = false;
    this.selectedLearner = null;
    this.selectedLearnerSessions = [];
  }
  
  closeForceCancelModal(): void {
    this.forceCancelModalOpen = false;
    this.cancellationReason = '';
    this.selectedBookingForCancel = null;
  }
  
  closeBookingStatsModal(): void {
    this.bookingStatsModalOpen = false;
    this.bookingStatistics = null;
  }
  
  // Utility methods
  getMentorName(mentorId: number): string {
    const mentor = this.mentors.find(m => m.id === mentorId);
    return mentor ? mentor.nom : `Mentor #${mentorId}`;
  }
  
  getLearnerName(learnerId: number | string): string {
    const learner = this.learners.find(l => l.id === String(learnerId));
    return learner ? learner.nom : `Learner #${learnerId}`;
  }
  
  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  getRatingStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
  
  getBookingStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Calendar helper methods
  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  }
  
  getDaysOfWeek(): string[] {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }
  
  getCalendarDays(): any[] {
    if (!this.calendarData) return [];
    
    const year = this.currentYear;
    const month = this.currentMonth;
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
    
    const days = [];
    
    // Previous month's days
    const prevMonth = new Date(year, month - 2, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        bookings: []
      });
    }
    
    // Current month's days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const isToday = today.getFullYear() === year && today.getMonth() === month - 1 && today.getDate() === day;
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        bookings: this.calendarData.bookingsByDay?.[dateKey] || []
      });
    }
    
    // Next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        bookings: []
      });
    }
    
    return days;
  }
  
  getCalendarStats(): any[] {
    if (!this.calendarData?.monthlyStats) return [];
    
    const stats = this.calendarData.monthlyStats;
    return [
      { label: 'Pending', value: stats.PENDING || 0, class: 'text-yellow-600' },
      { label: 'Confirmed', value: stats.CONFIRMED || 0, class: 'text-blue-600' },
      { label: 'Completed', value: stats.COMPLETED || 0, class: 'text-green-600' },
      { label: 'Cancelled', value: stats.CANCELLED || 0, class: 'text-red-600' }
    ];
  }
  
  getObjectEntries(obj: any): { key: string, value: any }[] {
    return Object.entries(obj || {}).map(([key, value]) => ({ key, value }));
  }

  // Booking management
  updateBookingStatus(booking: Booking, status: string): void {
    this.bookingService.updateBookingStatus(booking.id, status as any).subscribe({
      next: () => {
        this.loadAllData(); // Reload data
      },
      error: (err) => {
        console.error('Failed to update booking status:', err);
      }
    });
  }

  deleteBooking(booking: Booking): void {
    if (confirm('Are you sure you want to delete this booking?')) {
      // This would call a backend API to delete the booking
      console.log('Delete booking:', booking.id);
    }
  }
  
  // Advanced Booking Management Methods
  
  forceCancelBooking(booking: Booking): void {
    this.selectedBookingForCancel = booking;
    this.forceCancelModalOpen = true;
  }
  
  confirmForceCancellation(): void {
    if (this.selectedBookingForCancel && this.cancellationReason.trim()) {
      this.adminService.forceCancelBooking(
        this.selectedBookingForCancel.id,
        this.cancellationReason,
        this.cancellationType
      ).subscribe({
        next: () => {
          this.forceCancelModalOpen = false;
          this.cancellationReason = '';
          this.selectedBookingForCancel = null;
          this.loadAllData();
        },
        error: (err) => {
          console.error('Failed to cancel booking:', err);
          this.error = 'Failed to cancel booking';
        }
      });
    }
  }
  
  loadBookingStatistics(): void {
    this.adminService.getBookingStatistics(this.statisticsPeriod).subscribe({
      next: (stats) => {
        this.bookingStatistics = stats;
      },
      error: (err) => {
        console.error('Failed to load booking statistics:', err);
      }
    });
  }
  
  loadCalendarData(): void {
    this.adminService.getCalendarView(
      this.currentMonth.toString(),
      this.currentYear.toString()
    ).subscribe({
      next: (calendar) => {
        this.calendarData = calendar;
      },
      error: (err) => {
        console.error('Failed to load calendar data:', err);
      }
    });
  }
  
  changeCalendarMonth(direction: number): void {
    this.currentMonth += direction;
    if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else if (this.currentMonth < 1) {
      this.currentMonth = 12;
      this.currentYear--;
    }
    this.loadCalendarData();
  }
  
  showBookingStatistics(): void {
    this.bookingStatsModalOpen = true;
    this.loadBookingStatistics();
  }
}