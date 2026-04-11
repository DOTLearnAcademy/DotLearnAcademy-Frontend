import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/enrollments/instructor/stats`)
      .subscribe({
        next: data => {
          this.stats = data;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }
}
