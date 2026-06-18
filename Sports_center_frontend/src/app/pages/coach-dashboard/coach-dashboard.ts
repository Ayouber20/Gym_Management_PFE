import { Component, afterNextRender, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { CoachService } from '../../services/coach';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './coach-dashboard.html',
  styleUrls: ['./coach-dashboard.css']
})
export class CoachDashboard {

  notifications = signal<any[]>([]);
  notificationsLoaded = signal(false);

  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
    private coachService: CoachService,
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
    const user = this.authService.getUser();

    if (!user) {
      this.notificationsLoaded.set(true);
      this.errorMessage.set('Vous devez être connecté.');
      return;
    }

    this.coachService.getCoachByUserId(user.id)
      .subscribe({
        next: (coach) => {
          this.notificationService.getCoachNotifications(coach.id)
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
        },
        error: () => {
          this.notificationsLoaded.set(true);
          this.errorMessage.set('Profil coach introuvable.');
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
  this.notificationService.markAsRead(notificationId)
    .subscribe({
      next: () => {
        this.notifications.update(notifications =>
          notifications.filter(notification => notification.id !== notificationId)
        );
      },
      error: () => {
        this.errorMessage.set('Erreur lors de la suppression de la notification.');
      }
    });
}
}