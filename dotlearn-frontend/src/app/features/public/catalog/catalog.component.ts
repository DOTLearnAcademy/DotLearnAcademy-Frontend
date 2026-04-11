import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CourseService, Course } from '../services/course.service';

@Component({
  selector: 'app-catalog',
  standalone: false,
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  total = 0;
  page = 1;
  pageSize = 12;
  isLoading = false;
  private destroy$ = new Subject<void>();

  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  levelControl = new FormControl('');
  sortControl = new FormControl('popular');

  categories = ['Web Development', 'Data Science', 'Mobile Development',
    'Cloud Computing', 'Cybersecurity', 'UI/UX Design'];
  levels = ['Beginner', 'Intermediate', 'Advanced'];
  sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ];

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    this.loadCourses();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => { this.page = 1; this.loadCourses(); });

    this.categoryControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.page = 1; this.loadCourses(); });

    this.levelControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.page = 1; this.loadCourses(); });

    this.sortControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.page = 1; this.loadCourses(); });
  }

  loadCourses() {
    this.isLoading = true;
    this.courseService.search({
      q: this.searchControl.value || undefined,
      category: this.categoryControl.value || undefined,
      level: this.levelControl.value || undefined,
      sortBy: this.sortControl.value || undefined,
      page: this.page,
      pageSize: this.pageSize
    }).subscribe({
      next: res => {
        this.courses = res.items;
        this.total = res.total;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadCourses();
  }

  clearFilters() {
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
    this.levelControl.setValue('');
    this.sortControl.setValue('popular');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
