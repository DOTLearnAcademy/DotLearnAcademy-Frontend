import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ProgressRecord {
  lessonId: string;
  watchedSeconds: number;
  isCompleted: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  track(lessonId: string, watchedSeconds: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/progress/track`,
      { lessonId, watchedSeconds });
  }

  getLessonProgress(lessonId: string): Observable<ProgressRecord> {
    const studentId = this.getStudentId();
    return this.http.get<ProgressRecord>(
      `${this.apiUrl}/progress/lesson/${lessonId}/student/${studentId}`);
  }

  private getStudentId(): string {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user).id : '';
  }
}
