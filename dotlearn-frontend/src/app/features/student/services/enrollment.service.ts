import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  status: string;
  amountPaid: number;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: string;
  completedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/enrollments/my`);
  }

  getById(id: string): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/enrollments/${id}`);
  }
}
