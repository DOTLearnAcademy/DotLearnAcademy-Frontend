import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { AnalyticsComponent } from './analytics/analytics.component';
import { CourseManagementComponent } from './course-management/course-management.component';
import { CurriculumBuilderComponent } from './curriculum-builder/curriculum-builder.component';
import { QuizBuilderComponent } from './quiz-builder/quiz-builder.component';
import { StudentManagementComponent } from './student-management/student-management.component';

const routes: Routes = [
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'courses', component: CourseManagementComponent },
  { path: 'courses/:id/curriculum', component: CurriculumBuilderComponent },
  { path: 'courses/:id/quiz', component: QuizBuilderComponent },
  { path: 'courses/:id/students', component: StudentManagementComponent },
  { path: '', redirectTo: 'analytics', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AnalyticsComponent,
    CourseManagementComponent,
    CurriculumBuilderComponent,
    QuizBuilderComponent,
    StudentManagementComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatDividerModule,
  ]
})
export class InstructorModule {}
