import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Course } from '../services/course.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-course-detail',
  standalone: false,
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  lessons: any[] = [];
  isLoading = true;
  isEnrolling = false;
  userRole = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userRole = this.authService.getRole();
    const id = this.route.snapshot.paramMap.get('id')!;
    this.courseService.getById(id).subscribe({
      next: course => { 
        this.course = course; 
        this.lessons = (course as any).lessons || [];
        this.isLoading = false; 
      },
      error: () => { this.isLoading = false; }
    });
  }

  enroll() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.course?.price === 0) {
      this.isEnrolling = true;
      this.http.post(`${environment.apiUrl}/enrollments/free`,
        { courseId: this.course.id }).subscribe({
        next: () => { this.isEnrolling = false; this.router.navigate(['/student/my-learning']); },
        error: err => {
          this.isEnrolling = false;
          // 409 = already enrolled — take them to their learning dashboard
          if (err.status === 409) {
            this.router.navigate(['/student/my-learning']);
          } else {
            console.error('Enrollment error:', err);
          }
        }
      });
    } else {
      this.router.navigate(['/student/checkout'],
        { queryParams: { courseId: this.course?.id } });
    }
  }
}
