import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MyLearningComponent } from './my-learning/my-learning.component';
import { LessonPlayerComponent } from './lesson-player/lesson-player.component';
import { QuizComponent } from './quiz/quiz.component';
import { CertificatesComponent } from './certificates/certificates.component';
import { PurchaseHistoryComponent } from './purchase-history/purchase-history.component';
import { ProfileComponent } from './profile/profile.component';
import { CheckoutComponent } from './checkout/checkout.component';

const routes: Routes = [
  { path: 'my-learning', component: MyLearningComponent },
  { path: 'lesson/:id', component: LessonPlayerComponent },
  { path: 'quiz/:id', component: QuizComponent },
  { path: 'certificates', component: CertificatesComponent },
  { path: 'purchases', component: PurchaseHistoryComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: '', redirectTo: 'my-learning', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    MyLearningComponent,
    LessonPlayerComponent,
    QuizComponent,
    CertificatesComponent,
    PurchaseHistoryComponent,
    ProfileComponent,
    CheckoutComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatBadgeModule,
  ]
})
export class StudentModule {}
