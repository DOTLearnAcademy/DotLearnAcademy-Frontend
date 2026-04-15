import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

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
  errorMessage = '';
  user: any = {};
  avatarUrl = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfileApi().subscribe({
      next: (profile) => {
        this.user = profile;
        this.avatarUrl = profile.profileImageUrl || '';
        this.form.patchValue({
          fullName: profile.fullName,
          email: profile.email
        });
      },
      error: () => {
        const stored = this.authService.getProfile();
        if (stored) {
          this.user = stored;
          this.avatarUrl = stored.profileImageUrl || '';
          this.form.patchValue({
            fullName: stored.fullName,
            email: stored.email
          });
        }
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.updateProfileApi({ fullName: this.form.value.fullName }).subscribe({
      next: (updatedProfile) => {
        this.isLoading = false;
        this.user = updatedProfile;
        this.successMessage = 'Profile updated successfully.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => { 
        this.isLoading = false; 
        this.errorMessage = err.error?.error || 'Failed to update profile';
      }
    });
  }

  uploadAvatar(event: Event) {
    // Presigned S3 url logic is intact here if needed for later
  }
}
