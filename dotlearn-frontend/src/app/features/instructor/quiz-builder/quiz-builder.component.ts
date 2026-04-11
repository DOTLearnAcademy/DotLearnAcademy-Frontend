import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-quiz-builder',
  standalone: false,
  templateUrl: './quiz-builder.component.html',
  styleUrls: ['./quiz-builder.component.scss']
})
export class QuizBuilderComponent {
  courseId = '';
  quizForm: FormGroup;
  isSubmitting = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    this.quizForm = this.fb.group({
      title: ['', Validators.required],
      timeLimitMinutes: [30, [Validators.required, Validators.min(1)]],
      passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxAttempts: [3, [Validators.required, Validators.min(1)]],
      questions: this.fb.array([])
    });
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  addQuestion() {
    this.questions.push(this.fb.group({
      text: ['', Validators.required],
      type: ['SingleChoice', Validators.required],
      marks: [1, Validators.required],
      options: this.fb.array([
        this.fb.control('Option A'),
        this.fb.control('Option B'),
        this.fb.control('Option C'),
        this.fb.control('Option D'),
      ]),
      correctAnswer: [0, Validators.required]
    }));
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  onSubmit() {
    if (this.quizForm.invalid) return;
    this.isSubmitting = true;

    this.http.post(`${environment.apiUrl}/quizzes`, {
      ...this.quizForm.value,
      courseId: this.courseId
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Quiz created successfully!';
      },
      error: () => { this.isSubmitting = false; }
    });
  }
}
