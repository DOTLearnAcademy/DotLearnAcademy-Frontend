import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  token = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) this.router.navigate(['/auth/forgot-password']);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;

    this.authService.confirmPasswordReset(
      this.token, this.form.value.newPassword
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Invalid or expired reset token.';
      }
    });
  }
}
