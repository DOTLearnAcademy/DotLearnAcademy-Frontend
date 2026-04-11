import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Question {
  id: string;
  text: string;
  options: string[];
  selectedAnswer?: number;
}

@Component({
  selector: 'app-quiz',
  standalone: false,
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit, OnDestroy {
  quizId = '';
  questions: Question[] = [];
  currentIndex = 0;
  timeLeft = 0;
  isLoading = true;
  isSubmitted = false;
  score = 0;
  private timer: any;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('id')!;
    this.http.post<any>(
      `${environment.apiUrl}/quizzes/${this.quizId}/attempts/start`, {}
    ).subscribe({
      next: res => {
        this.questions = res.questions || [];
        this.timeLeft = (res.timeLimitMinutes || 30) * 60;
        this.isLoading = false;
        this.startTimer();
      },
      error: () => { this.isLoading = false; }
    });
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.submit();
      }
    }, 1000);
  }

  get timeDisplay(): string {
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }

  get isTimerRed(): boolean { return this.timeLeft <= 300; }

  selectAnswer(optionIndex: number) {
    if (!this.isSubmitted)
      this.questions[this.currentIndex].selectedAnswer = optionIndex;
  }

  submit() {
    clearInterval(this.timer);
    this.isSubmitted = true;
    this.score = Math.round(
      (this.questions.filter(q => q.selectedAnswer !== undefined).length
       / this.questions.length) * 100
    );
  }

  ngOnDestroy() { clearInterval(this.timer); }
}
