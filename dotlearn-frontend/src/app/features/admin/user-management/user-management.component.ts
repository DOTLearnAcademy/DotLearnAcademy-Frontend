import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

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
  isActionLoading = false;
  actionMessage = '';
  actionError = '';
  currentUserId = '';
  searchControl = new FormControl('');
  roleControl = new FormControl('');
  displayedColumns = ['name', 'email', 'role', 'status', 'actions'];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.currentUserId = this.authService.getProfile()?.id ?? '';
    this.loadUsers();

    this.searchControl.valueChanges.pipe(
      debounceTime(300), distinctUntilChanged()
    ).subscribe(() => this.loadUsers());

    this.roleControl.valueChanges.subscribe(() => this.loadUsers());
  }

  loadUsers() {
    this.isLoading = true;
    let url = `${environment.apiUrl}/auth/users?`;
    if (this.searchControl.value) url += `q=${this.searchControl.value}&`;
    if (this.roleControl.value) url += `role=${this.roleControl.value}`;

    this.http.get<User[]>(url).subscribe({
      next: data => { this.users = data; this.isLoading = false; },
      error: () => {
        this.isLoading = false;
        this.actionError = 'Failed to load users.';
      }
    });
  }

  suspend(userId: string) {
    this.resetFeedback();
    this.isActionLoading = true;
    this.http.put(`${environment.apiUrl}/admin/users/${userId}/suspend`, {})
      .subscribe({
        next: () => {
          this.actionMessage = 'User suspended successfully.';
          this.isActionLoading = false;
          this.loadUsers();
        },
        error: (err) => {
          this.actionError = err.error?.message || 'Failed to suspend user.';
          this.isActionLoading = false;
        }
      });
  }

  unsuspend(userId: string) {
    this.resetFeedback();
    this.isActionLoading = true;
    this.http.put(`${environment.apiUrl}/admin/users/${userId}/unsuspend`, {})
      .subscribe({
        next: () => {
          this.actionMessage = 'User unsuspended successfully.';
          this.isActionLoading = false;
          this.loadUsers();
        },
        error: (err) => {
          this.actionError = err.error?.message || 'Failed to unsuspend user.';
          this.isActionLoading = false;
        }
      });
  }

  delete(userId: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.resetFeedback();
    this.isActionLoading = true;
    this.http.delete(`${environment.apiUrl}/admin/users/${userId}`)
      .subscribe({
        next: () => {
          this.actionMessage = 'User deleted successfully.';
          this.isActionLoading = false;
          this.loadUsers();
        },
        error: (err) => {
          this.actionError = err.error?.message || 'Failed to delete user.';
          this.isActionLoading = false;
        }
      });
  }

  isCurrentUser(userId: string): boolean {
    return !!this.currentUserId && this.currentUserId === userId;
  }

  private resetFeedback() {
    this.actionMessage = '';
    this.actionError = '';
  }
}
