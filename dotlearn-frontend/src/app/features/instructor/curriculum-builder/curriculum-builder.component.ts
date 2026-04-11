import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '../../../../environments/environment';

interface Lesson {
  id: string;
  title: string;
  type: string;
  orderIndex: number;
  isPreview: boolean;
  durationSeconds?: number;
}

@Component({
  selector: 'app-curriculum-builder',
  standalone: false,
  templateUrl: './curriculum-builder.component.html',
  styleUrls: ['./curriculum-builder.component.scss']
})
export class CurriculumBuilderComponent implements OnInit {
  courseId = '';
  lessons: Lesson[] = [];
  isLoading = true;
  uploadProgress = 0;
  isUploading = false;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    this.loadLessons();
  }

  loadLessons() {
    this.http.get<Lesson[]>(
      `${environment.apiUrl}/courses/${this.courseId}/lessons`
    ).subscribe({
      next: data => { this.lessons = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  drop(event: CdkDragDrop<Lesson[]>) {
    moveItemInArray(this.lessons, event.previousIndex, event.currentIndex);
    const updates = this.lessons.map((l, i) => ({
      lessonId: l.id,
      orderIndex: i
    }));
    this.http.put(`${environment.apiUrl}/lessons/reorder`,
      { courseId: this.courseId, lessonOrders: updates }).subscribe();
  }

  uploadVideo(lessonId: string, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.isUploading = true;

    this.http.post<{ uploadUrl: string }>(
      `${environment.apiUrl}/lessons/${lessonId}/upload-url`, {}
    ).subscribe({
      next: res => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = e => {
          this.uploadProgress = Math.round(e.loaded / e.total * 100);
        };
        xhr.onload = () => {
          this.isUploading = false;
          this.uploadProgress = 0;
          this.http.post(`${environment.apiUrl}/lessons/${lessonId}/upload-confirm`,
            { s3Key: `lessons/${lessonId}/video.mp4` }).subscribe();
        };
        xhr.open('PUT', res.uploadUrl);
        xhr.send(file);
      }
    });
  }

  deleteLesson(lessonId: string) {
    this.http.delete(`${environment.apiUrl}/lessons/${lessonId}`)
      .subscribe({ next: () => this.loadLessons() });
  }
}
