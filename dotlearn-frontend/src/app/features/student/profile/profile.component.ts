import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = {};
  avatarUrl = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfileApi().subscribe({
      next: (profile) => {
        this.user = profile;
        this.avatarUrl = profile.profileImageUrl || '';
      },
      error: () => {
        const stored = this.authService.getProfile();
        if (stored) {
          this.user = stored;
          this.avatarUrl = stored.profileImageUrl || '';
        }
      }
    });
  }
}
