import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../../../features/auth/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  userRole = '';
  userName = '';
  userEmail = '';
  userInitials = '';
  dropdownOpen = false;
  mobileMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.refreshState();
    // Re-check on route changes
    this.router.events.subscribe(() => this.refreshState());
  }

  refreshState() {
    this.isLoggedIn = this.authService.isLoggedIn();
    const profile = this.authService.getProfile();
    if (profile) {
      this.userRole = profile.role;
      this.userName = profile.fullName;
      this.userEmail = profile.email;
      this.userInitials = this.getInitials(profile.fullName || profile.email);
    } else {
      this.userRole = '';
      this.userName = '';
      this.userEmail = '';
      this.userInitials = '?';
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  get userInitial(): string {
    const profile = localStorage.getItem('userProfile');
    if (!profile) return 'U';

    try {
      const parsed = JSON.parse(profile);
      const name = parsed?.fullName || parsed?.name || parsed?.email || 'User';
      return String(name).trim().charAt(0).toUpperCase();
    } catch {
      return 'U';
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  logout() {
    this.dropdownOpen = false;
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.dropdownOpen = false;
    }
  }
}
