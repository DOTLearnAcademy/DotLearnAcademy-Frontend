import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    // Check if google library is loaded
    if (typeof google === 'undefined') {
      setTimeout(() => this.ngOnInit(), 500); // Wait for script to load
      return;
    }
    if (!(window as any).googleInitDone) {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleGoogleCredentialResponse.bind(this)
      });
      (window as any).googleInitDone = true;
    } else {
      // Re-attach the callback locally for the current component map if previously initialized
      google.accounts.id.prompt((notification: any) => {
        // Just suppress warning, Google handles actual button rendering independent of init
      });
    }
    
    google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      { theme: "outline", size: "large", width: 380 }
    );
  }

  handleGoogleCredentialResponse(response: any) {
    this.isLoading = true;
    this.authService.googleLogin(response.credential).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.requiresOnboarding) {
          this.router.navigate(['/auth/complete-profile'], {
            queryParams: { 
              email: res.email, 
              fullName: res.fullName, 
              subjectId: res.googleSubjectId, 
              picture: res.profileImageUrl 
            }
          });
        } else {
          this.router.navigate([this.authService.getRoleRedirect()]);
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Google Login failed. Please try again.';
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate([this.authService.getRoleRedirect()]);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Invalid credentials. Please try again.';
      }
    });
  }
}
