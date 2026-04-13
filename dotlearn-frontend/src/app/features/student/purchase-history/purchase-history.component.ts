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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const userProfileRaw =
      localStorage.getItem('userProfile') || localStorage.getItem('currentUser');

    if (!userProfileRaw) {
      this.isLoading = false;
      return;
    }

    let userId = '';
    try {
      userId = JSON.parse(userProfileRaw).id || '';
    } catch {
      this.isLoading = false;
      return;
    }

    if (!userId) {
      this.isLoading = false;
      return;
    }

    this.http.get<Payment[]>(`${environment.apiUrl}/payments/student/${userId}`)
      .subscribe({
        next: data => {
          this.payments = data ?? [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }
}
