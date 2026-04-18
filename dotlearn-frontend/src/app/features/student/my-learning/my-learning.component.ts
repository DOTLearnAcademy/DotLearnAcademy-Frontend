import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnrollmentService, Enrollment } from '../services/enrollment.service';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../../environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-my-learning',
  standalone: false,
  templateUrl: './my-learning.component.html',
  styleUrls: ['./my-learning.component.scss']
})
export class MyLearningComponent implements OnInit {
  enrollments: Enrollment[] = [];
  filteredEnrollments: Enrollment[] = [];
  courseNames: Record<string, string> = {};
  activeTab = 'all';
  isLoading = true;
  studentName = 'Student';

  constructor(
    private enrollmentService: EnrollmentService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const profile = this.authService.getProfile();
    if (profile?.fullName) {
      this.studentName = profile.fullName.split(' ')[0];
    }

    this.enrollments = [];
    this.setTab('all');
    this.enrollmentService.getMyEnrollments().subscribe({
      next: data => {
        this.enrollments = data;
        this.setTab('all');
        this.isLoading = false;
        // Fetch course names for all enrolled courses
        this.fetchCourseNames(data.map(e => e.courseId));
      },
      error: () => { this.isLoading = false; }
    });
  }

  fetchCourseNames(courseIds: string[]) {
    this.http.get<any>(`${environment.apiUrl}/courses`)
      .pipe(catchError(() => of({ items: [] })))
      .subscribe(res => {
        // API returns paginated {items:[...]} or plain array
        const courses: any[] = Array.isArray(res) ? res : (res.items || []);
        const map: Record<string, string> = {};
        courses.forEach((c: any) => map[c.id] = c.title);
        this.courseNames = map;
      });
  }

  getCourseName(courseId: string): string {
    return this.courseNames[courseId] || 'Loading...';
  }

  setTab(tab: string) {
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
    const name = this.courseNames[courseId];
    return name ? name[0].toUpperCase() : courseId[0].toUpperCase();
  }
}
