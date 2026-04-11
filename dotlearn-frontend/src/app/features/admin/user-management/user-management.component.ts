import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-user-management',
  standalone: false,
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  isLoading = true;
  searchControl = new FormControl('');
  roleControl = new FormControl('');
  displayedColumns = ['name', 'email', 'role', 'status', 'actions'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();

    this.searchControl.valueChanges.pipe(
      debounceTime(300), distinctUntilChanged()
    ).subscribe(() => this.loadUsers());

    this.roleControl.valueChanges.subscribe(() => this.loadUsers());
  }

  loadUsers() {
    let url = `${environment.apiUrl}/auth/users?`;
    if (this.searchControl.value) url += `q=${this.searchControl.value}&`;
    if (this.roleControl.value) url += `role=${this.roleControl.value}`;

    this.http.get<User[]>(url).subscribe({
      next: data => { this.users = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  suspend(userId: string) {
    this.http.put(`${environment.apiUrl}/admin/users/${userId}/suspend`, {})
      .subscribe({ next: () => this.loadUsers() });
  }

  unsuspend(userId: string) {
    this.http.put(`${environment.apiUrl}/admin/users/${userId}/unsuspend`, {})
      .subscribe({ next: () => this.loadUsers() });
  }

  delete(userId: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.http.delete(`${environment.apiUrl}/admin/users/${userId}`)
      .subscribe({ next: () => this.loadUsers() });
  }
}
