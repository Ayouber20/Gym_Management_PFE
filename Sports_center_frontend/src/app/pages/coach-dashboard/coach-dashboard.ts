import { Component, afterNextRender, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { CoachService } from '../../services/coach';
import { ProfileMenu } from '../../components/profile-menu/profile-menu';
import { AnnouncementService } from '../../services/announcement';
import { Chatbot } from '../../components/chatbot/chatbot';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [RouterLink, ProfileMenu, Chatbot],
  templateUrl: './coach-dashboard.html',
  styleUrls: ['./coach-dashboard.css']
})
export class CoachDashboard {

  notifications = signal<any[]>([]);
  notificationsLoaded = signal(false);

  errorMessage = signal('');

  announcements = signal<any[]>([]);
  announcementsLoaded = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private coachService: CoachService,
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

    this.coachService.getCoachByUserId(user.id)
      .subscribe({
        next: (coach) => {
          this.notificationService.getCoachNotifications(coach.id)
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
          this.errorMessage.set('Profil coach introuvable.');
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
    if (type === 'COACH_REQUEST') {
      return '📩';
    }

    if (type === 'COACH_SESSION') {
      return '🏋️';
    }

    if (type === 'COACH_SESSION_CANCELLED') {
      return '❌';
    }

    if (type === 'NEW_EVENT') {
      return '🎉';
    }

    if (type === 'EVENT_DISABLED') {
      return '⚠️';
    }

    if (type === 'EVENT_REACTIVATED') {
      return '🎉';
    }

    if (type === 'EVENT_DELETED') {
      return '🗑️';
    }

    return '🔔';
  }

  getNotificationTitle(type: string): string {
    if (type === 'COACH_REQUEST') {
      return 'Nouvelle demande de coaching';
    }

    if (type === 'COACH_SESSION') {
      return 'Séance coach';
    }

    if (type === 'COACH_SESSION_CANCELLED') {
      return 'Séance coach annulée';
    }

    if (type === 'NEW_EVENT') {
      return 'Nouvel événement';
    }

    if (type === 'EVENT_DISABLED') {
      return 'Événement désactivé';
    }

    if (type === 'EVENT_REACTIVATED') {
      return 'Événement réactivé';
    }

    if (type === 'EVENT_DELETED') {
      return 'Événement supprimé';
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

    this.announcementService.getCoachAnnouncements()
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
    if (notification.type === 'COACH_REQUEST') {
      sessionStorage.setItem('coach_requests_seen', 'true');
      this.router.navigate(['/coach/requests']);
      return;
    }

    if (
      notification.type === 'COACH_SESSION' ||
      notification.type === 'COACH_SESSION_CANCELLED'
    ) {
      sessionStorage.setItem('coach_sessions_seen', 'true');
      this.router.navigate(['/coach/sessions']);
      return;
    }

    if (
      notification.type === 'NEW_EVENT' ||
      notification.type === 'EVENT_DISABLED' ||
      notification.type === 'EVENT_REACTIVATED' ||
      notification.type === 'EVENT_DELETED'
    ) {
      sessionStorage.setItem('coach_events_seen', 'true');
      this.router.navigate(['/coach/events']);
      return;
    }

    if (notification.type === 'NEW_EVENT') {
      sessionStorage.setItem('coach_events_seen', 'true');
      this.router.navigate(['/coach/events']);
      return;
    }

    
  }

  hasSessionNotification(): boolean {
    const coachSessionsSeen =
      sessionStorage.getItem('coach_sessions_seen') === 'true';

    if (coachSessionsSeen) {
      return false;
    }

    return this.notifications().some(notification =>
      notification.readStatus === false &&
      notification.type === 'COACH_SESSION_CANCELLED'
    );
  }

  hasCoachRequestNotification(): boolean {
    const coachRequestsSeen =
      sessionStorage.getItem('coach_requests_seen') === 'true';

    if (coachRequestsSeen) {
      return false;
    }

    return this.notifications().some(notification =>
      notification.readStatus === false &&
      notification.type === 'COACH_REQUEST'
    );
  }

  hasEventNotification(): boolean {
    const eventsSeen =
      sessionStorage.getItem('coach_events_seen') === 'true';

    if (eventsSeen) {
      return false;
    }

    return this.notifications().some(notification =>
      notification.readStatus === false &&
      (
        notification.type === 'NEW_EVENT' ||
        notification.type === 'EVENT_DISABLED' ||
        notification.type === 'EVENT_REACTIVATED' ||
        notification.type === 'EVENT_DELETED'
      )
    );
  }

  hasAnyNotification(): boolean {
    return this.notifications().length > 0;
  }

   notificationBadgeCount(): number {
    return this.notifications().filter(notification =>
      notification.readStatus !== true
    ).length;
  }
}