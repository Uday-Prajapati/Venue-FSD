import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" routerLink="/">Venue Booking</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/">Home</a>
            </li>
            <ng-container *ngIf="authService.currentUser$ | async; else loginLink">
              <li class="nav-item" *ngIf="authService.isAdmin()">
                <a class="nav-link" routerLink="/admin">Admin Dashboard</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#" (click)="logout($event)">Logout</a>
              </li>
            </ng-container>
            <ng-template #loginLink>
              <li class="nav-item">
                <a class="nav-link" routerLink="/login">Login</a>
              </li>
            </ng-template>
          </ul>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
  }
}