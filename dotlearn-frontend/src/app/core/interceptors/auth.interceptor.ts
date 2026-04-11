import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('accessToken');

    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/auth/refresh')) {
          return this.handle401(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        this.isRefreshing = false;
        localStorage.clear();
        window.location.href = '/auth/login';
        return throwError(() => new Error('No refresh token'));
      }

      return this.http.post<any>(
        `${environment.apiUrl}/auth/refresh`,
        { refreshToken }
      ).pipe(
        switchMap(tokens => {
          this.isRefreshing = false;
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          this.refreshTokenSubject.next(tokens.accessToken);

          return next.handle(req.clone({
            setHeaders: { Authorization: `Bearer ${tokens.accessToken}` }
          }));
        }),
        catchError(err => {
          this.isRefreshing = false;
          localStorage.clear();
          window.location.href = '/auth/login';
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })))
    );
  }
}
