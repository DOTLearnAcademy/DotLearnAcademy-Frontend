import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-platform-analytics',
  standalone: false,
  templateUrl: './platform-analytics.component.html',
  styleUrls: ['./platform-analytics.component.scss']
})
export class PlatformAnalyticsComponent implements OnInit {
  stats = {
    totalRevenue: 0,
    monthlyActiveUsers: 0,
    totalEnrollments: 0,
    publishedCourses: 0
  };
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/payments/admin/stats`)
      .subscribe({
        next: data => { this.stats = { ...this.stats, ...data }; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
  }
}
