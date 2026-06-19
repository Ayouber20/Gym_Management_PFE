import { Component, afterNextRender, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { ProfileMenu } from '../../components/profile-menu/profile-menu';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, ProfileMenu],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard {

  notifications = signal<any[]>([]);
  notificationsLoaded = signal(false);

  errorMessage = signal('');

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
          const sortedNotifications = data.sort((a, b) => {
            const dateA = a.date || '';
            const dateB = b.date || '';

            if (dateA > dateB) return -1;
            if (dateA < dateB) return 1;

            const timeA = a.time || '';
            const timeB = b.time || '';

            return timeA.localeCompare(timeB);
          });

          this.notifications.set(sortedNotifications);
          this.notificationsLoaded.set(true);
        },
        error: () => {
          this.notificationsLoaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des notifications.');
        }
      });
  }

  formatTime(time: string): string {
    if (!time) {
      return '';
    }

    return time.slice(0, 5);
  }

  getNotificationIcon(type: string): string {
  if (type === 'RESERVATION') {
    return '🎾';
  }

  if (type === 'COACH_SESSION') {
    return '🏋️';
  }

  if (type === 'RESERVATION_CANCELLED') {
    return '✖';
  }

  if (type === 'COACH_SESSION_CANCELLED') {
  return '❌';
}

  return '🔔';
}

getNotificationTitle(type: string): string {
  if (type === 'RESERVATION') {
    return 'Réservation';
  }

  if (type === 'COACH_SESSION') {
    return 'Séance coach';
  }

  if (type === 'RESERVATION_CANCELLED') {
    return 'Réservation annulée';
  }

  if (type === 'COACH_SESSION_CANCELLED') {
    return 'Séance coach annulée';
  }

  return 'Notification';
}

markNotificationAsRead(notificationId: number): void {
  if (!notificationId) {
    return;
  }

  this.notificationService.markAsRead(notificationId)
    .subscribe({
      next: () => {
        this.notifications.update(notifications =>
          notifications.filter(notification => notification.id !== notificationId)
        );
      },
      error: () => {
        this.errorMessage.set('Erreur lors du masquage de la notification.');
      }
    });
}
}