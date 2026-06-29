import { Component, afterNextRender, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { ClientService } from '../../services/client';
import { ProfileMenu } from '../../components/profile-menu/profile-menu';
import { AnnouncementService } from '../../services/announcement';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [RouterLink, ProfileMenu],
  templateUrl: './client-dashboard.html',
  styleUrls: ['./client-dashboard.css']
})
export class ClientDashboard {

  notifications = signal<any[]>([]);
  notificationsLoaded = signal(false);

  errorMessage = signal('');

  announcements = signal<any[]>([]);
  announcementsLoaded = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService,
    private clientService: ClientService,
    private notificationService: NotificationService,
    private announcementService: AnnouncementService
  ) {
    afterNextRender(() => {
      this.loadNotifications();
      this.loadAnnouncements();
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

    this.clientService.getClientByUserId(user.id)
      .subscribe({
        next: (client) => {
          this.notificationService.getClientNotifications(client.id)
            .subscribe({
              next: (data) => {
                const sortedNotifications = this.sortNotifications(data);

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
          this.errorMessage.set('Profil client introuvable.');
        }
      });
  }

  private sortNotifications(data: any[]): any[] {
    return data.sort((a, b) => {
      const aRead = a.readStatus === true;
      const bRead = b.readStatus === true;

      if (!aRead && bRead) {
        return -1;
      }

      if (aRead && !bRead) {
        return 1;
      }

      const dateA = a.date || a.notificationDate || '';
      const dateB = b.date || b.notificationDate || '';

      if (dateA > dateB) {
        return -1;
      }

      if (dateA < dateB) {
        return 1;
      }

      const timeA = a.time || a.notificationTime || '';
      const timeB = b.time || b.notificationTime || '';

      return timeB.localeCompare(timeA);
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

    if (type === 'COACH_REQUEST_ACCEPTED') {
      return '✅';
    }

    if (type === 'COACH_REQUEST_REJECTED') {
      return '❌';
    }

    if (type === 'COACH_REQUEST_CANCELLED') {
      return '🚫';
    }

    if (type === 'COACH_REQUEST_EXPIRED') {
      return '⌛';
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

    if (type === 'COACH_REQUEST_ACCEPTED') {
      return 'Demande coach acceptée';
    }

    if (type === 'COACH_REQUEST_REJECTED') {
      return 'Demande coach refusée';
    }

    if (type === 'COACH_REQUEST_CANCELLED') {
      return 'Demande coach annulée';
    }

    if (type === 'COACH_REQUEST_EXPIRED') {
      return 'Demande coach expirée';
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

  loadAnnouncements(): void {
    this.announcementsLoaded.set(false);

    this.announcementService.getClientAnnouncements()
      .subscribe({
        next: (data) => {
          this.announcements.set(data);
          this.announcementsLoaded.set(true);
        },
        error: () => {
          this.announcementsLoaded.set(true);
        }
      });
  }

  goToNotificationTarget(notification: any): void {
    if (
      notification.type === 'RESERVATION_CANCELLED' ||
      notification.type === 'RESERVATION'
    ) {
      sessionStorage.setItem('client_reservations_seen', 'true');
      this.router.navigate(['/client/reservations']);
      return;
    }

    if (
      notification.type === 'COACH_SESSION_CANCELLED' ||
      notification.type === 'COACH_SESSION' ||
      notification.type === 'COACH_REQUEST_ACCEPTED' ||
      notification.type === 'COACH_REQUEST_REJECTED' ||
      notification.type === 'COACH_REQUEST_CANCELLED' ||
      notification.type === 'COACH_REQUEST_EXPIRED'
    ) {
      sessionStorage.setItem('client_coach_requests_seen', 'true');
      this.router.navigate(['/client/coach-requests']);
      return;
    }
  }

  hasReservationNotification(): boolean {
    const reservationsSeen =
      sessionStorage.getItem('client_reservations_seen') === 'true';

    if (reservationsSeen) {
      return false;
    }

    return this.notifications().some(notification =>
      notification.type === 'RESERVATION_CANCELLED' ||
      notification.type === 'RESERVATION'
    );
  }

  hasCoachRequestNotification(): boolean {
    const coachRequestsSeen =
      sessionStorage.getItem('client_coach_requests_seen') === 'true';

    if (coachRequestsSeen) {
      return false;
    }

    return this.notifications().some(notification =>
      notification.type === 'COACH_REQUEST_ACCEPTED' ||
      notification.type === 'COACH_REQUEST_REJECTED' ||
      notification.type === 'COACH_REQUEST_CANCELLED' ||
      notification.type === 'COACH_REQUEST_EXPIRED' ||
      notification.type === 'COACH_SESSION_CANCELLED'
    );
  }

  hasAnyNotification(): boolean {
    return this.notifications().length > 0;
  }
}