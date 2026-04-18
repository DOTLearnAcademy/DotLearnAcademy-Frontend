import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-analytics',
  standalone: false,
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  stats = {
    totalStudents: 0,
    totalRevenue: 0,
    activeEnrollments: 0,
    averageRating: 0
  };
  isLoading = true;
  instructorName = 'Instructor';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    const profile = this.authService.getProfile();
    if (profile?.fullName) {
      this.instructorName = profile.fullName.split(' ')[0];
    }

    // Load instructor stats — gracefully falls back to zeros on any error
    this.http.get<any>(`${environment.apiUrl}/enrollments/instructor/stats`)
      .subscribe({
        next: data => {
          this.stats = {
            totalStudents: data.totalStudents ?? data.totalEnrollments ?? 0,
            totalRevenue: data.totalRevenue ?? 0,
            activeEnrollments: data.activeEnrollments ?? data.totalEnrollments ?? 0,
            averageRating: data.averageRating ?? 0
          };
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; } // show page with zeros on error
      });
  }
}
