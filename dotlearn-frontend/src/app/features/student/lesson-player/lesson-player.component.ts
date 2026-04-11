import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProgressService } from '../services/progress.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-lesson-player',
  standalone: false,
  templateUrl: './lesson-player.component.html',
  styleUrls: ['./lesson-player.component.scss']
})
export class LessonPlayerComponent implements OnInit, OnDestroy {
  lessonId = '';
  videoUrl = '';
  isLoading = true;
  private heartbeatInterval: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private progressService: ProgressService
  ) {}

  ngOnInit() {
    this.lessonId = this.route.snapshot.paramMap.get('id')!;
    this.loadVideoUrl();
  }

  loadVideoUrl() {
    this.http.get<{ videoUrl: string }>(
      `${environment.apiUrl}/lessons/${this.lessonId}/video-url`
    ).subscribe({
      next: res => {
        this.videoUrl = res.videoUrl;
        this.isLoading = false;
        this.startHeartbeat();
      },
      error: () => { this.isLoading = false; }
    });
  }

  startHeartbeat() {
    let watchedSeconds = 0;
    this.heartbeatInterval = setInterval(() => {
      watchedSeconds += 30;
      this.progressService.track(this.lessonId, watchedSeconds)
        .subscribe();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }
}
