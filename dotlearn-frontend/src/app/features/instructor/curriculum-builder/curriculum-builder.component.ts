import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  hasVideo?: boolean;
}

@Component({
  selector: 'app-curriculum-builder',
  standalone: false,
  templateUrl: './curriculum-builder.component.html',
  styleUrls: ['./curriculum-builder.component.scss']
})
export class CurriculumBuilderComponent implements OnInit {
  courseId = '';
  courseTitle = '';
  lessons: Lesson[] = [];
  isLoading = true;
  uploadingLessonId = '';
  uploadProgress = 0;
  showAddLesson = false;
  isSubmittingLesson = false;
  errorMessage = '';
  successMessage = '';

  lessonForm: FormGroup;
  lessonTypes = ['Video', 'Text', 'Quiz'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.lessonForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      type: ['Video', Validators.required],
      isPreview: [false],
      description: ['']
    });
  }

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    this.loadLessons();
  }

  loadLessons() {
    this.isLoading = true;
    this.http.get<Lesson[]>(`${environment.apiUrl}/courses/${this.courseId}/lessons`)
      .subscribe({
        next: data => {
          this.lessons = data.sort((a, b) => a.orderIndex - b.orderIndex);
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }

  drop(event: CdkDragDrop<Lesson[]>) {
    moveItemInArray(this.lessons, event.previousIndex, event.currentIndex);
    const updates = this.lessons.map((l, i) => ({ lessonId: l.id, orderIndex: i }));
    this.http.put(`${environment.apiUrl}/lessons/reorder`,
      { courseId: this.courseId, lessonOrders: updates }).subscribe();
  }

  addLesson() {
    if (this.lessonForm.invalid) return;
    this.isSubmittingLesson = true;
    this.errorMessage = '';

    const payload = {
      title: this.lessonForm.value.title,
      type: this.lessonForm.value.type,
      isPreview: this.lessonForm.value.isPreview || false,
      description: this.lessonForm.value.description || '',
      orderIndex: this.lessons.length
    };

    this.http.post<Lesson>(`${environment.apiUrl}/courses/${this.courseId}/lessons`, payload)
      .subscribe({
        next: () => {
          this.isSubmittingLesson = false;
          this.showAddLesson = false;
          this.lessonForm.reset({ type: 'Video', isPreview: false });
          this.successMessage = `Lesson "${payload.title}" added!`;
          setTimeout(() => this.successMessage = '', 3000);
          this.loadLessons();
        },
        error: (err) => {
          this.isSubmittingLesson = false;
          this.errorMessage = err.error?.error || 'Failed to create lesson.';
        }
      });
  }

  uploadVideo(lessonId: string, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingLessonId = lessonId;

    this.http.post<{ uploadUrl: string }>(
      `${environment.apiUrl}/lessons/${lessonId}/upload-url`, {}
    ).subscribe({
      next: res => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = e => {
          this.uploadProgress = Math.round(e.loaded / e.total * 100);
        };
        xhr.onload = () => {
          this.uploadingLessonId = '';
          this.uploadProgress = 0;
          this.http.post(`${environment.apiUrl}/lessons/${lessonId}/upload-confirm`,
            { s3Key: `lessons/${lessonId}/video.mp4` }).subscribe(() => this.loadLessons());
        };
        xhr.onerror = () => {
          this.uploadingLessonId = '';
          this.errorMessage = 'Upload failed. Please try again.';
        };
        xhr.open('PUT', res.uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      },
      error: () => {
        this.uploadingLessonId = '';
        this.errorMessage = 'Could not get upload URL.';
      }
    });
  }

  deleteLesson(lessonId: string) {
    this.http.delete(`${environment.apiUrl}/lessons/${lessonId}`)
      .subscribe({ next: () => this.loadLessons() });
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
