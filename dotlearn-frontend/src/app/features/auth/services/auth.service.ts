import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  authProvider?: string;
  profileImageUrl?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user?: UserProfile;
}

export interface GoogleAuthResponse {
  requiresOnboarding: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: UserProfile;
  email?: string;
  fullName?: string;
  googleSubjectId?: string;
  profileImageUrl?: string;
}

export interface GoogleCompleteSignupRequest {
  email: string;
  fullName: string;
  role: string;
  googleSubjectId: string;
  profileImageUrl?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateProfileRequest {
  fullName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, request).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  googleLogin(idToken: string): Observable<GoogleAuthResponse> {
    return this.http.post<GoogleAuthResponse>(`${this.apiUrl}/auth/google`, { idToken }).pipe(
      tap(res => {
        if (!res.requiresOnboarding && res.accessToken) {
          const loginRes: LoginResponse = {
            accessToken: res.accessToken,
            refreshToken: res.refreshToken!,
            expiresIn: res.expiresIn!,
            user: res.user
          };
          this.handleAuthSuccess(loginRes);
        }
      })
    );
  }

  completeGoogleSignup(request: GoogleCompleteSignupRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/google/complete`, request).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  getProfileApi(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/auth/profile`).pipe(
      tap(user => {
        localStorage.setItem('userProfile', JSON.stringify(user));
      })
    );
  }

  updateProfileApi(request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/auth/profile`, request).pipe(
      tap(user => {
        localStorage.setItem('userProfile', JSON.stringify(user));
      })
    );
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/home']);
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/password-reset/request`, { email });
  }

  confirmPasswordReset(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/password-reset/confirm`, { token, newPassword });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getProfile(): UserProfile | null {
    const raw = localStorage.getItem('userProfile');
    return raw ? JSON.parse(raw) : null;
  }

  getRole(): string {
    const profile = this.getProfile();
    return profile?.role ?? '';
  }

  getRoleRedirect(): string {
    const role = this.getRole();
    if (role === 'Instructor') return '/instructor/analytics';
    if (role === 'Admin') return '/admin';
    return '/student/my-learning';
  }

  private handleAuthSuccess(res: LoginResponse): void {
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);

    if (res.user) {
      localStorage.setItem('userProfile', JSON.stringify(res.user));
    } else {
      this.decodeAndStoreProfile(res.accessToken);
    }
  }

  private decodeAndStoreProfile(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload['role'] ||
        payload['Role'] ||
        '';
      const fullName =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        payload['name'] ||
        payload['Name'] ||
        '';
      const email =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        payload['email'] ||
        payload['Email'] ||
        '';
      const id = payload['sub'] || payload['id'] || '';
      const profile: UserProfile = { id, fullName, email, role, authProvider: 'Local' };
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch {
      console.warn('Could not decode JWT payload');
    }
  }
}
