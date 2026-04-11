import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  state: string;
  instructorId: string;
  thumbnailS3Key?: string;
  averageRating: number;
  enrollmentCount: number;
  createdAt: string;
  publishedAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  search(filters: {
    q?: string;
    category?: string;
    level?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PaginatedResponse<Course>> {
    let params = new HttpParams();
    if (filters.q) params = params.set('q', filters.q);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.level) params = params.set('level', filters.level);
    if (filters.minPrice != null) params = params.set('minPrice', filters.minPrice);
    if (filters.maxPrice != null) params = params.set('maxPrice', filters.maxPrice);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    params = params.set('page', filters.page ?? 1);
    params = params.set('pageSize', filters.pageSize ?? 12);

    return this.http.get<PaginatedResponse<Course>>(
      `${this.apiUrl}/courses`, { params }
    );
  }

  getById(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/courses/${id}`);
  }
}
