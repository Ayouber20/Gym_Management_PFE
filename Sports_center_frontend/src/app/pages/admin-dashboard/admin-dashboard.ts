import { Component, afterNextRender, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { ProfileMenu } from '../../components/profile-menu/profile-menu';
import { Chatbot } from '../../components/chatbot/chatbot';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, ProfileMenu, Chatbot],
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
          console.log('ADMIN NOTIFICATIONS:', data);

          const sortedNotifications = this.sortNotifications(data);

          this.notifications.set(sortedNotifications);
          this.notificationsLoaded.set(true);
        },
        
        error: () => {
          this.notificationsLoaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des notifications.');
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

    if (type === 'COACH_LEAVE_REQUEST' || type === 'COACH_LEAVE') {
      return '🌴';
    }

    if (type === 'COURT_MAINTENANCE') {
      return '🛠️';
    }

    if (type === 'COACH_REQUEST') {
      return '💪';
    }

    if (type === 'ANNOUNCEMENT') {
      return '📢';
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

    if (type === 'COACH_LEAVE_REQUEST' || type === 'COACH_LEAVE') {
      return 'Demande de congé coach';
    }

    if (type === 'COURT_MAINTENANCE') {
      return 'Maintenance terrain';
    }

    if (type === 'COACH_REQUEST') {
      return 'Demande coach';
    }

    if (type === 'ANNOUNCEMENT') {
      return 'Annonce';
    }

    return 'Notification';
  }

  goToNotificationTarget(notification: any): void {
    if (
      notification.type === 'RESERVATION' ||
      notification.type === 'RESERVATION_CANCELLED'
    ) {
      this.router.navigate(['/admin/reservations']);
      return;
    }

    if (
      notification.type === 'COACH_SESSION' ||
      notification.type === 'COACH_SESSION_CANCELLED' ||
      notification.type === 'COACH_REQUEST'
    ) {
      this.router.navigate(['/admin/coach-requests']);
      return;
    }

    if (
      notification.type === 'COACH_LEAVE_REQUEST' ||
      notification.type === 'COACH_LEAVE'
    ) {
      this.router.navigate(['/admin/coach-leavings']);
      return;
    }

    if (notification.type === 'COURT_MAINTENANCE') {
      this.router.navigate(['/admin/courts']);
      return;
    }

    if (notification.type === 'ANNOUNCEMENT') {
      this.router.navigate(['/admin/announcements']);
      return;
    }

    this.router.navigate(['/admin']);
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

  hasCoachLeaveNotification(): boolean {
    const latestLeaveNotification = this.notifications()
      .filter(notification =>
        notification.type === 'COACH_LEAVE_REQUEST' ||
        notification.type === 'COACH_LEAVE'
      )
      .sort((a, b) => {
        const dateA = a.date || '';
        const dateB = b.date || '';

        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;

        const timeA = a.time || '';
        const timeB = b.time || '';

        return timeB.localeCompare(timeA);
      })[0];

    if (!latestLeaveNotification) {
      return false;
    }

    const currentKey =
      latestLeaveNotification.id ||
      `${latestLeaveNotification.type}-${latestLeaveNotification.date}-${latestLeaveNotification.message}`;

    const seenKey = sessionStorage.getItem('admin_coach_leaves_seen_key');

    return seenKey !== String(currentKey);
  }

  goToCoachLeavings(): void {
    const latestLeaveNotification = this.notifications()
      .filter(notification =>
        notification.type === 'COACH_LEAVE_REQUEST' ||
        notification.type === 'COACH_LEAVE'
      )
      .sort((a, b) => {
        const dateA = a.date || '';
        const dateB = b.date || '';

        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;

        const timeA = a.time || '';
        const timeB = b.time || '';

        return timeB.localeCompare(timeA);
      })[0];

    if (latestLeaveNotification) {
      const currentKey =
        latestLeaveNotification.id ||
        `${latestLeaveNotification.type}-${latestLeaveNotification.date}-${latestLeaveNotification.message}`;

      sessionStorage.setItem('admin_coach_leaves_seen_key', String(currentKey));
    }

    this.router.navigate(['/admin/coach-leavings']);
  }

   notificationBadgeCount(): number {
    return this.notifications().filter(notification =>
      notification.readStatus !== true
    ).length;
  }
}