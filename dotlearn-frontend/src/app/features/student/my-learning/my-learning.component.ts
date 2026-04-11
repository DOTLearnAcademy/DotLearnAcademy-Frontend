import { Component, OnInit } from '@angular/core';
import { EnrollmentService, Enrollment } from '../services/enrollment.service';

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

  constructor(private enrollmentService: EnrollmentService) {}

  ngOnInit() {
    this.enrollments = [];
    this.filter('all');
    this.isLoading = false;
    /*
    this.enrollmentService.getMyEnrollments().subscribe({
      next: data => {
        this.enrollments = data;
        this.filter('all');
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
    */
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
}
