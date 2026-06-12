import { Component, afterNextRender, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard {

  notifications = signal<any[]>([]);
  notificationsLoaded = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    afterNextRender(() => {
      this.loadNotifications();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadNotifications(): void {
    this.notificationService.getAdminNotifications()
      .subscribe({
        next: (data) => {
          this.notifications.set(data);
          this.notificationsLoaded.set(true);
        },
        error: () => {
          this.notificationsLoaded.set(true);
        }
      });
  }
}