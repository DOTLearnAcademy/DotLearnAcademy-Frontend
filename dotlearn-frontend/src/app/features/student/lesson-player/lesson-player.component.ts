import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface CourseLesson {
  id: string;
  title: string;
  type: string;
  orderIndex: number;
  isPreview: boolean;
  videoS3Key?: string;
  textContent?: string;
  durationSeconds?: number;
}

interface QuizQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC?: string;
  optionD?: string;
  correct: string;
}

@Component({
  selector: 'app-lesson-player',
  standalone: false,
  templateUrl: './lesson-player.component.html',
  styleUrls: ['./lesson-player.component.scss']
})
export class LessonPlayerComponent implements OnInit, OnDestroy {
  courseId = '';
  courseTitle = '';
  enrollmentId: string | null = null;

  lessons: CourseLesson[] = [];
  selectedLesson: CourseLesson | null = null;
  completedLessonIds: Set<string> = new Set();

  isLoading = true;
  isLoadingContent = false;

  // Video
  videoUrl = '';

  // Quiz
  quizQuestions: QuizQuestion[] = [];
  selectedAnswers: Record<number, string> = {};
  quizSubmitted = false;
  quizScore = 0;

  // Progress & Certificate
  progressPercent = 0;
  showCertificate = false;
  certificateDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  private localStorageKey = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId')!;
    this.enrollmentId = this.route.snapshot.queryParamMap.get('enrollmentId');
    this.localStorageKey = `completed_${this.courseId}`;

    // Restore completed lessons from localStorage first
    const saved = localStorage.getItem(this.localStorageKey);
    if (saved) {
      try { this.completedLessonIds = new Set(JSON.parse(saved)); } catch { }
    }

    // Always fetch enrollment from backend to get latest progress and enrollmentId
    this.http.get<any[]>(`${environment.apiUrl}/enrollments/my`).subscribe({
      next: (enrollments) => {
        const e = enrollments.find(en => en.courseId === this.courseId);
        if (e) {
          // Override with the real enrollmentId (handles direct navigation / page refresh)
          this.enrollmentId = e.id;
          // If localStorage is empty but backend has progress, restore it
          if (this.completedLessonIds.size === 0 && e.completedLessons > 0) {
            // We'll restore after lessons load (we need lesson IDs)
            this._backendCompletedCount = e.completedLessons;
          }
        }
        this.loadLessons();
      },
      error: () => this.loadLessons() // load lessons even without enrollment info
    });
  }

  private _backendCompletedCount = 0;

  loadLessons() {
    this.isLoading = true;
    this.http.get<CourseLesson[]>(`${environment.apiUrl}/lessons/course/${this.courseId}`)
      .subscribe({
        next: data => {
          this.lessons = data.sort((a, b) => a.orderIndex - b.orderIndex);
          this.isLoading = false;

          // Restore progress from backend if localStorage was empty
          if (this.completedLessonIds.size === 0 && this._backendCompletedCount > 0) {
            const toRestore = this.lessons.slice(0, this._backendCompletedCount);
            this.completedLessonIds = new Set(toRestore.map(l => l.id));
            localStorage.setItem(this.localStorageKey,
              JSON.stringify([...this.completedLessonIds]));
          }

          this.updateProgress();

          if (this.lessons.length > 0) {
            // Resume at first incomplete lesson
            const first = this.lessons.find(l =>
              !this.completedLessonIds.has(l.id)) ?? this.lessons[0];
            this.selectLesson(first);
          }
        },
        error: () => { this.isLoading = false; }
      });
  }

  selectLesson(lesson: CourseLesson) {
    this.selectedLesson = lesson;
    this.videoUrl = '';
    this.quizQuestions = [];
    this.selectedAnswers = {};
    this.quizSubmitted = false;
    this.quizScore = 0;
    this.isLoadingContent = false;

    if (lesson.type === 'Video' && lesson.videoS3Key) {
      this.isLoadingContent = true;
      this.http.get<{ videoUrl: string }>(`${environment.apiUrl}/lessons/${lesson.id}/video-url`)
        .subscribe({
          next: res => { this.videoUrl = res.videoUrl; this.isLoadingContent = false; },
          error: () => { this.isLoadingContent = false; }
        });
    } else if (lesson.type === 'Quiz' && lesson.textContent) {
      try { this.quizQuestions = JSON.parse(lesson.textContent); } catch { this.quizQuestions = []; }
    }
  }

  // ── Progress tracking ──────────────────────
  isCompleted(lesson: CourseLesson): boolean {
    return this.completedLessonIds.has(lesson.id);
  }

  markLessonComplete(lesson: CourseLesson) {
    if (this.completedLessonIds.has(lesson.id)) return;
    this.completedLessonIds.add(lesson.id);
    localStorage.setItem(this.localStorageKey,
      JSON.stringify([...this.completedLessonIds]));
    this.updateProgress();
  }

  updateProgress() {
    if (this.lessons.length === 0) { this.progressPercent = 0; return; }
    const completed = [...this.completedLessonIds]
      .filter(id => this.lessons.some(l => l.id === id)).length;
    this.progressPercent = Math.round((completed / this.lessons.length) * 100);

    // Sync to enrollment service (requires enrollmentId and JWT token)
    if (this.enrollmentId) {
      this.http.put(
        `${environment.apiUrl}/enrollments/${this.enrollmentId}/progress`,
        { completedLessons: completed, totalLessons: this.lessons.length }
      ).subscribe({
        error: (err) => console.warn('Progress sync failed:', err.status, err.message)
      });
    }

    if (this.progressPercent >= 100) {
      this.showCertificate = true;
    }
  }

  // ── Quiz ────────────────────────────────────
  selectAnswer(qIndex: number, option: string) {
    if (!this.quizSubmitted) {
      this.selectedAnswers[qIndex] = option;
    }
  }

  submitQuiz() {
    if (this.quizSubmitted || !this.selectedLesson) return;
    this.quizSubmitted = true;
    const correct = this.quizQuestions.filter((q, i) =>
      this.selectedAnswers[i] === q.correct
    ).length;
    this.quizScore = this.quizQuestions.length
      ? Math.round((correct / this.quizQuestions.length) * 100)
      : 0;
    if (this.selectedLesson) this.markLessonComplete(this.selectedLesson);
  }

  // ── Helpers ─────────────────────────────────
  getOptions(q: QuizQuestion): { key: string; val: string | undefined }[] {
    return [
      { key: 'A', val: q.optionA },
      { key: 'B', val: q.optionB },
      { key: 'C', val: q.optionC },
      { key: 'D', val: q.optionD }
    ];
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  getLessonIcon(lesson: CourseLesson): string {
    if (this.completedLessonIds.has(lesson.id)) return '✅';
    if (lesson.type === 'Video') return '🎬';
    if (lesson.type === 'Quiz') return '❓';
    if (lesson.type === 'Text') return '📄';
    return '📋';
  }

  ngOnDestroy() {}
}
