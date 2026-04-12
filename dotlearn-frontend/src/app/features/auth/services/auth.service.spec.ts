import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('login() POSTs to /auth/login and stores tokens in localStorage', () => {
    const mockResponse = { accessToken: 'acc', refreshToken: 'ref', expiresIn: 900 };

    service.login('test@test.com', 'Password@123').subscribe(res => {
      expect(res.accessToken).toBe('acc');
    });

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@test.com', password: 'Password@123' });
    req.flush(mockResponse);

    expect(localStorage.getItem('accessToken')).toBe('acc');
    expect(localStorage.getItem('refreshToken')).toBe('ref');
  });

  it('register() POSTs to /auth/register', () => {
    service.register({
      fullName: 'Test User',
      email: 'test@test.com',
      password: 'Password@123',
      role: 'Student'
    }).subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'registered' });
  });

  it('isLoggedIn() returns false when no token in localStorage', () => {
    localStorage.clear();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('requestPasswordReset() POSTs to /auth/password-reset/request', () => {
    service.requestPasswordReset('test@test.com').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/password-reset/request`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@test.com' });
    req.flush({ message: 'sent' });
  });
});
