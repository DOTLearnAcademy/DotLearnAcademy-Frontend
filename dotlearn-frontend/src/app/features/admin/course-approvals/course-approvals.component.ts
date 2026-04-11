import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface PendingCourse {
  id: string;
  title: string;
  instructorId: string;
  createdAt: string;
  state: string;
}

@Component({
  selector: 'app-course-approvals',
  standalone: false,
  templateUrl: './course-approvals.component.html',
  styleUrls: ['./course-approvals.component.scss']
})
export class CourseApprovalsComponent implements OnInit {
  courses: PendingCourse[] = [];
  isLoading = true;
  displayedColumns = ['title', 'instructor', 'submitted', 'actions'];

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadCourses(); }

  loadCourses() {
    this.http.get<any>(`${environment.apiUrl}/courses?state=Published`)
      .subscribe({
        next: res => { this.courses = res.items || []; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
  }

  approve(courseId: string) {
    this.http.put(`${environment.apiUrl}/admin/courses/${courseId}/approve`, {})
      .subscribe({ next: () => this.loadCourses() });
  }

  reject(courseId: string) {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    this.http.put(`${environment.apiUrl}/admin/courses/${courseId}/reject`,
      { reason }).subscribe({ next: () => this.loadCourses() });
  }
}
