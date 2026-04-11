import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Payment {
  id: string;
  courseId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-purchase-history',
  standalone: false,
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.scss']
})
export class PurchaseHistoryComponent implements OnInit {
  payments: Payment[] = [];
  isLoading = true;
  displayedColumns = ['date', 'course', 'amount', 'status'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.http.get<Payment[]>(
      `${environment.apiUrl}/payments/student/${user.id}`
    ).subscribe({
      next: data => { this.payments = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  getStatusColor(status: string): string {
    if (status === 'Succeeded') return 'accent';
    if (status === 'Failed') return 'warn';
    return 'basic';
  }
}
