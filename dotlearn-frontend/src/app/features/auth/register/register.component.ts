import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['Student', Validators.required]
    });
  }

  getPasswordStrength(): string {
    const password = this.form.get('password')?.value || '';
    if (password.length === 0) return '';
    if (password.length < 6) return 'Weak';
    if (password.length < 10) return 'Medium';
    return 'Strong';
  }

  getStrengthColor(): string {
    const strength = this.getPasswordStrength();
    if (strength === 'Weak') return '#f44336';
    if (strength === 'Medium') return '#ff9800';
    return '#4caf50';
  }

  ngOnInit() {
    if (typeof google === 'undefined') {
      setTimeout(() => this.ngOnInit(), 500);
      return;
    }
    
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: this.handleGoogleCredentialResponse.bind(this)
    });
    
    google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      { theme: "outline", size: "large", width: "100%", text: "signup_with" }
    );
  }

  handleGoogleCredentialResponse(response: any) {
    this.isLoading = true;
    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/student/my-learning']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Google Sign up failed. Please try again.';
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.isLoading = false;
        // Auto login after register
        const { email, password } = this.form.value;
        this.authService.login(email, password).subscribe({
          next: () => this.router.navigate(['/student/my-learning']),
          error: () => this.router.navigate(['/auth/login'])
        });
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Registration failed.';
      }
    });
  }
}
