import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface Course {
  id: string;
  title: string;
  description: string;
  state: string;
  category: string;
  level: string;
  enrollmentCount: number;
  price: number;
  createdAt: string;
}

@Component({
  selector: 'app-course-management',
  standalone: false,
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.scss']
})
export class CourseManagementComponent implements OnInit {
  courses: Course[] = [];
  isLoading = true;
  showWizard = false;
  currentStep = 0;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  step1Form: FormGroup;
  step2Form: FormGroup;

  displayedColumns = ['title', 'category', 'state', 'enrollments', 'price', 'actions'];

  categories = [
    'Web Development', 'Data Science', 'Mobile Development',
    'Cloud Computing', 'Cybersecurity', 'UI/UX Design',
    'Machine Learning', 'DevOps', 'Blockchain', 'Other'
  ];
  levels = ['Beginner', 'Intermediate', 'Advanced'];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.step1Form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      category: ['', Validators.required],
      level: ['', Validators.required],
    });
    this.step2Form = this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() { this.loadCourses(); }

  loadCourses() {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/courses?instructorOnly=true`)
      .subscribe({
        next: res => {
          this.courses = res.items || res || [];
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }

  openWizard() {
    this.step1Form.reset({ level: '', category: '' });
    this.step2Form.reset({ price: 0 });
    this.currentStep = 0;
    this.errorMessage = '';
    this.showWizard = true;
  }

  closeWizard() {
    this.showWizard = false;
    this.errorMessage = '';
  }

  createCourse() {
    if (this.step1Form.invalid || this.step2Form.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      ...this.step1Form.value,
      price: this.step2Form.value.price
    };

    this.http.post<any>(`${environment.apiUrl}/courses`, payload).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.showWizard = false;
        this.successMessage = `"${created.title || payload.title}" created successfully!`;
        setTimeout(() => this.successMessage = '', 4000);
        this.loadCourses();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.error || 'Failed to create course. Please try again.';
      }
    });
  }

  navigateToCurriculum(courseId: string) {
    this.router.navigate(['/instructor/courses', courseId, 'curriculum']);
  }

  publish(courseId: string) {
    this.http.put(`${environment.apiUrl}/courses/${courseId}/publish`, {})
      .subscribe({
        next: () => this.loadCourses(),
        error: (err) => {
          this.errorMessage = err.error?.error || 'Failed to publish course.';
        }
      });
  }

  archive(courseId: string) {
    this.http.delete(`${environment.apiUrl}/courses/${courseId}`)
      .subscribe({ next: () => this.loadCourses() });
  }

  getStateBadgeClass(state: string): string {
    if (state === 'Published') return 'badge-published';
    if (state === 'Archived') return 'badge-archived';
    return 'badge-draft';
  }
}
