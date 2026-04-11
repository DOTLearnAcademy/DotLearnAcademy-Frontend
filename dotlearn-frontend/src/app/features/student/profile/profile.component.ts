import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  successMessage = '';
  user: any = {};

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.user = JSON.parse(stored);
      this.form.patchValue({
        fullName: this.user.fullName,
        email: this.user.email
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;

    this.http.put(
      `${environment.apiUrl}/auth/profile/${this.user.id}`,
      this.form.value
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => { this.isLoading = false; }
    });
  }

  uploadAvatar(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.http.post<{ uploadUrl: string }>(
      `${environment.apiUrl}/auth/profile/avatar-url`, {}
    ).subscribe({
      next: res => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', res.uploadUrl);
        xhr.send(file);
      }
    });
  }
}
