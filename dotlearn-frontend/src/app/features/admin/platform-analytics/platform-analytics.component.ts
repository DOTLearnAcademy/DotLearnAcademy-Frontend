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
    totalUsers: 0,
    totalInstructors: 0,
    totalStudents: 0
  };
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/auth/users`).subscribe({
      next: (users) => {
        this.stats = {
          totalUsers: users.length,
          totalInstructors: users.filter(u => u.role === 'Instructor').length,
          totalStudents: users.filter(u => u.role === 'Student').length
        };
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }
}
