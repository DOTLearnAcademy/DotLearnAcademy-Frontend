import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, GoogleCompleteSignupRequest } from '../services/auth.service';

@Component({
  selector: 'app-complete-profile',
  standalone: false,
  templateUrl: './complete-profile.component.html',
  styleUrls: ['../login/login.component.scss'] // Reusing login styles for consistency
})
export class CompleteProfileComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  picture = '';
  subjectId = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      role: ['Student', Validators.required]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (!params['email'] || !params['subjectId']) {
        this.router.navigate(['/auth/login']);
        return;
      }
      
      this.subjectId = params['subjectId'];
      this.picture = params['picture'] || '';
      
      this.form.patchValue({
        email: params['email'],
        fullName: params['fullName'] || ''
      });
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const req: GoogleCompleteSignupRequest = {
      email: this.form.getRawValue().email, // Use getRawValue to get disabled field
      fullName: this.form.value.fullName,
      role: this.form.value.role,
      googleSubjectId: this.subjectId,
      profileImageUrl: this.picture
    };

    this.authService.completeGoogleSignup(req).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate([this.authService.getRoleRedirect()]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Setup failed. Please try again.';
      }
    });
  }
}
