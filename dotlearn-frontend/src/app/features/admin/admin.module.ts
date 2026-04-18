import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { PlatformAnalyticsComponent } from './platform-analytics/platform-analytics.component';
import { UserManagementComponent } from './user-management/user-management.component';

const routes: Routes = [
  { path: 'analytics', component: PlatformAnalyticsComponent },
  { path: 'users', component: UserManagementComponent },
  { path: '', redirectTo: 'analytics', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    PlatformAnalyticsComponent,
    UserManagementComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatDividerModule,
  ]
})
export class AdminModule {}
