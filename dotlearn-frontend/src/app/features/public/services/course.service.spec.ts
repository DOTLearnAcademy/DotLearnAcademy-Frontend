import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CourseService, PaginatedResponse, Course } from './course.service';
import { environment } from '../../../../environments/environment';

describe('CourseService', () => {
  let service: CourseService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CourseService],
    });
    service = TestBed.inject(CourseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('search() GETs /courses with query params', () => {
    const mockResponse: PaginatedResponse<Course> = {
      items: [{ id: '1', title: 'Angular Basics', description: '', category: 'Tech',
        level: 'Beginner', price: 0, state: 'Published', instructorId: 'i1',
        averageRating: 4.5, enrollmentCount: 100, createdAt: '2024-01-01' }],
      total: 1, page: 1, pageSize: 12, totalPages: 1
    };

    service.search({ q: 'Angular', page: 1 }).subscribe(res => {
      expect(res.items.length).toBe(1);
      expect(res.items[0].title).toBe('Angular Basics');
    });

    const req = http.expectOne(r => r.url === `${environment.apiUrl}/courses`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('Angular');
    req.flush(mockResponse);
  });

  it('search() uses default page=1 and pageSize=12 when not specified', () => {
    service.search({}).subscribe();

    const req = http.expectOne(r => r.url === `${environment.apiUrl}/courses`);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('12');
    req.flush({ items: [], total: 0, page: 1, pageSize: 12, totalPages: 0 });
  });

  it('getById() GETs /courses/:id', () => {
    service.getById('course-uuid-123').subscribe();

    const req = http.expectOne(`${environment.apiUrl}/courses/course-uuid-123`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'course-uuid-123', title: 'Test Course' });
  });
});
