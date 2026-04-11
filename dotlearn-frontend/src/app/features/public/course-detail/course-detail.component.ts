import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Course } from '../services/course.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-course-detail',
  standalone: false,
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  isLoading = true;
  isEnrolling = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.courseService.getById(id).subscribe({
      next: course => { this.course = course; this.isLoading = false; },
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
      this.http.post(`${environment.apiUrl}/enrollments/free`,
        { courseId: this.course.id }).subscribe({
        next: () => this.router.navigate(['/student/my-learning']),
        error: err => console.error(err)
      });
    } else {
      this.router.navigate(['/student/checkout'],
        { queryParams: { courseId: this.course?.id } });
    }
  }
}
