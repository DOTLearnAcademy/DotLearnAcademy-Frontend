import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Course {
  id: string;
  title: string;
  state: string;
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

  step1Form: FormGroup;
  step2Form: FormGroup;

  displayedColumns = ['title', 'state', 'enrollments', 'price', 'actions'];

  categories = ['Web Development', 'Data Science', 'Mobile Development',
    'Cloud Computing', 'Cybersecurity', 'UI/UX Design'];
  levels = ['Beginner', 'Intermediate', 'Advanced'];

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.step1Form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      level: ['', Validators.required],
    });
    this.step2Form = this.fb.group({
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() { this.loadCourses(); }

  loadCourses() {
    this.http.get<any>(`${environment.apiUrl}/courses`)
      .subscribe({
        next: res => {
          this.courses = res.items || [];
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }

  createCourse() {
    if (this.step1Form.invalid || this.step2Form.invalid) return;
    this.isSubmitting = true;

    const payload = {
      ...this.step1Form.value,
      price: this.step2Form.value.price
    };

    this.http.post(`${environment.apiUrl}/courses`, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showWizard = false;
        this.loadCourses();
      },
      error: () => { this.isSubmitting = false; }
    });
  }

  publish(courseId: string) {
    this.http.put(`${environment.apiUrl}/courses/${courseId}/publish`, {})
      .subscribe({ next: () => this.loadCourses() });
  }

  archive(courseId: string) {
    this.http.delete(`${environment.apiUrl}/courses/${courseId}`)
      .subscribe({ next: () => this.loadCourses() });
  }

  getStateColor(state: string): string {
    if (state === 'Published') return 'accent';
    if (state === 'Archived') return 'warn';
    return 'basic';
  }
}
