import { Component, OnInit } from '@angular/core';
import { CourseService, Course } from '../services/course.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredCourses: Course[] = [];
  isLoading = true;

  categories = [
    { name: 'Web Development', icon: 'code' },
    { name: 'Data Science', icon: 'analytics' },
    { name: 'Mobile Development', icon: 'smartphone' },
    { name: 'Cloud Computing', icon: 'cloud' },
    { name: 'Cybersecurity', icon: 'security' },
    { name: 'UI/UX Design', icon: 'design_services' },
  ];

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    this.courseService.search({ sortBy: 'popular', pageSize: 6 })
      .subscribe({
        next: res => {
          this.featuredCourses = res.items;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }
}
