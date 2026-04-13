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
  lessons: CourseLesson[] = [];
  selectedLesson: CourseLesson | null = null;

  isLoading = true;
  isLoadingContent = false;

  // Video
  videoUrl = '';

  // Quiz
  quizQuestions: QuizQuestion[] = [];
  selectedAnswers: Record<number, string> = {};
  quizSubmitted = false;
  quizScore = 0;

  // Notes
  noteText = '';

  activeTab = 'overview';

  private heartbeat: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId')!;
    this.loadLessons();
  }

  loadLessons() {
    this.isLoading = true;
    this.http.get<CourseLesson[]>(`${environment.apiUrl}/lessons/course/${this.courseId}`)
      .subscribe({
        next: data => {
          this.lessons = data.sort((a, b) => a.orderIndex - b.orderIndex);
          this.isLoading = false;
          if (this.lessons.length > 0) {
            this.selectLesson(this.lessons[0]);
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
    this.activeTab = 'overview';
    this.isLoadingContent = false;

    if (lesson.type === 'Video' && lesson.videoS3Key) {
      this.isLoadingContent = true;
      this.http.get<{ videoUrl: string }>(`${environment.apiUrl}/lessons/${lesson.id}/video-url`)
        .subscribe({
          next: res => {
            this.videoUrl = res.videoUrl;
            this.isLoadingContent = false;
          },
          error: () => { this.isLoadingContent = false; }
        });
    } else if (lesson.type === 'Quiz' && lesson.textContent) {
      try {
        this.quizQuestions = JSON.parse(lesson.textContent);
      } catch { this.quizQuestions = []; }
    }
  }

  selectAnswer(qIndex: number, option: string) {
    if (!this.quizSubmitted) {
      this.selectedAnswers[qIndex] = option;
    }
  }

  submitQuiz() {
    if (this.quizSubmitted) return;
    this.quizSubmitted = true;
    const correct = this.quizQuestions.filter((q, i) =>
      this.selectedAnswers[i] === q.correct
    ).length;
    this.quizScore = this.quizQuestions.length
      ? Math.round((correct / this.quizQuestions.length) * 100)
      : 0;
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  getOptions(q: QuizQuestion): { key: string; val: string | undefined }[] {
    return [
      { key: 'A', val: q.optionA },
      { key: 'B', val: q.optionB },
      { key: 'C', val: q.optionC },
      { key: 'D', val: q.optionD }
    ];
  }

  getLessonIcon(type: string): string {
    if (type === 'Video') return '🎬';
    if (type === 'Quiz') return '❓';
    if (type === 'Text') return '📄';
    return '📋';
  }

  ngOnDestroy() {
    if (this.heartbeat) clearInterval(this.heartbeat);
  }
}
