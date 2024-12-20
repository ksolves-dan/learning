import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf, TitleCasePipe],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  currentUser: { name: string; role: string } | null = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user ? { name: user.name, role: user.role } : null;
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get userRole(): string {
    return this.currentUser?.role || '';
  }

  logout(): void {
    this.authService.logout();
  }
}

