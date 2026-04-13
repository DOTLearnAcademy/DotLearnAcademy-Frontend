import { Component, OnInit } from '@angular/core';
import { EnrollmentService, Enrollment } from '../services/enrollment.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-my-learning',
  standalone: false,
  templateUrl: './my-learning.component.html',
  styleUrls: ['./my-learning.component.scss']
})
export class MyLearningComponent implements OnInit {
  enrollments: Enrollment[] = [];
  filteredEnrollments: Enrollment[] = [];
  activeTab = 'all';
  isLoading = true;
  studentName = 'Student';

  constructor(
    private enrollmentService: EnrollmentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const profile = this.authService.getProfile();
    if (profile?.fullName) {
      this.studentName = profile.fullName.split(' ')[0];
    }

    this.enrollments = [];
    this.filter('all');
    this.enrollmentService.getMyEnrollments().subscribe({
      next: data => {
        this.enrollments = data;
        this.filter('all');
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  filter(tab: string) {
    this.activeTab = tab;
    this.filteredEnrollments = this.enrollments.filter(e => {
      if (tab === 'all') return true;
      if (tab === 'in-progress')
        return e.progressPercent > 0 && e.progressPercent < 100;
      if (tab === 'completed') return e.progressPercent >= 100;
      return true;
    });
  }

  getCourseInitial(courseId: string): string {
    return courseId ? courseId[0].toUpperCase() : 'C';
  }
}
