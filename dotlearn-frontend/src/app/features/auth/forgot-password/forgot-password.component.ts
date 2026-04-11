import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;

    this.authService.requestPasswordReset(this.form.value.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage =
          'If this email exists, a reset link has been sent. Check your inbox.';
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Something went wrong. Please try again.';
      }
    });
  }
}
