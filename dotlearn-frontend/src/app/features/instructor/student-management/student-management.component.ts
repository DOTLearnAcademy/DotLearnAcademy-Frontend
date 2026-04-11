import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface StudentEnrollment {
  id: string;
  studentId: string;
  progressPercent: number;
  enrolledAt: string;
  status: string;
}

@Component({
  selector: 'app-student-management',
  standalone: false,
  templateUrl: './student-management.component.html',
  styleUrls: ['./student-management.component.scss']
})
export class StudentManagementComponent implements OnInit {
  courseId = '';
  students: StudentEnrollment[] = [];
  filteredStudents: StudentEnrollment[] = [];
  isLoading = true;
  activeFilter = 'all';
  displayedColumns = ['student', 'enrolled', 'progress', 'status'];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    this.http.get<StudentEnrollment[]>(
      `${environment.apiUrl}/enrollments/course/${this.courseId}/students`
    ).subscribe({
      next: data => {
        this.students = data;
        this.filter('all');
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  filter(segment: string) {
    this.activeFilter = segment;
    this.filteredStudents = this.students.filter(s => {
      if (segment === 'all') return true;
      if (segment === 'not-started') return s.progressPercent === 0;
      if (segment === 'in-progress')
        return s.progressPercent > 0 && s.progressPercent < 100;
      if (segment === 'completed') return s.progressPercent >= 100;
      return true;
    });
  }
}
