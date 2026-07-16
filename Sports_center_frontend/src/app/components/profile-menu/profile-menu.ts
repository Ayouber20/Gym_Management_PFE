import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, afterNextRender, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';

import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme';
import { NotificationService } from '../../services/notification';
import { ClientService } from '../../services/client';
import { CoachService } from '../../services/coach';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile-menu.html',
  styleUrls: ['./profile-menu.css']
})
export class ProfileMenu {

  notifications = signal<any[]>([]);
  notificationCount = signal(0);

  menuOpen = signal(false);
  passwordModalOpen = signal(false);
  notificationsOpen = signal(false);

  darkMode = signal(true);

  oldPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  successMessage = signal('');
  errorMessage = signal('');

  user: any = null;
  private isBrowser = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    private clientService: ClientService,
    private coachService: CoachService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    afterNextRender(() => {
      this.refreshUser();
      this.loadNotifications();
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.refreshUser();
        this.loadNotifications();
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  private refreshUser(): void {
    this.user = this.authService.getUser();
  }

  private loadNotifications(): void {
    if (!this.isBrowser) {
      return;
    }

    const user = this.authService.getUser();

    if (!user) {
      this.notifications.set([]);
      this.notificationCount.set(0);
      return;
    }

    const role = (user.role || '').toUpperCase();

    if (role === 'ADMIN') {
      this.notificationService.getAdminNotifications()
        .subscribe({
          next: (data) => this.setNotifications(data),
          error: () => this.setNotifications([])
        });

      return;
    }

    if (role === 'CLIENT') {
      this.clientService.getClientByUserId(user.id)
        .subscribe({
          next: (client) => {
            this.notificationService.getClientNotifications(client.id)
              .subscribe({
                next: (data) => this.setNotifications(data),
                error: () => this.setNotifications([])
              });
          },
          error: () => this.setNotifications([])
        });

      return;
    }

    if (role === 'COACH') {
      this.coachService.getCoachByUserId(user.id)
        .subscribe({
          next: (coach) => {
            this.notificationService.getCoachNotifications(coach.id)
              .subscribe({
                next: (data) => this.setNotifications(data),
                error: () => this.setNotifications([])
              });
          },
          error: () => this.setNotifications([])
        });

      return;
    }

    this.setNotifications([]);
  }

  private setNotifications(data: any[]): void {
    const sortedNotifications = this.sortNotifications(data || []);

    this.notifications.set(sortedNotifications);
    this.notificationCount.set(
      sortedNotifications.filter(notification => notification.readStatus !== true).length
    );
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

  toggleMenu(): void {
    this.refreshUser();
    this.menuOpen.set(!this.menuOpen());
    this.notificationsOpen.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  toggleNotifications(): void {
    this.refreshUser();
    this.loadNotifications();
    this.notificationsOpen.set(!this.notificationsOpen());
    this.menuOpen.set(false);
  }

  openPasswordModal(): void {
    this.refreshUser();
    this.passwordModalOpen.set(true);
    this.menuOpen.set(false);
    this.notificationsOpen.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  closePasswordModal(): void {
    this.passwordModalOpen.set(false);
    this.oldPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  changePassword(): void {
    this.refreshUser();

    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.user) {
      this.errorMessage.set('Utilisateur introuvable.');
      return;
    }

    if (!this.oldPassword() || !this.newPassword() || !this.confirmPassword()) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    if (this.newPassword().length < 6) {
      this.errorMessage.set('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    const request = {
      userId: this.user.id,
      oldPassword: this.oldPassword(),
      newPassword: this.newPassword()
    };

    this.authService.changePassword(request)
      .subscribe({
        next: () => {
          this.successMessage.set('Mot de passe modifié avec succès.');

          this.oldPassword.set('');
          this.newPassword.set('');
          this.confirmPassword.set('');

          setTimeout(() => {
            this.closePasswordModal();
          }, 800);
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors du changement du mot de passe.'
          );
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.notifications.set([]);
    this.notificationCount.set(0);
    this.menuOpen.set(false);
    this.notificationsOpen.set(false);
    this.router.navigate(['/login']);
  }

  getFullName(): string {
    this.refreshUser();

    if (!this.user) {
      return 'Utilisateur';
    }

    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
  }

  getEmail(): string {
    this.refreshUser();
    return this.user?.email || '';
  }

  getRole(): string {
    this.refreshUser();
    return this.user?.role || '';
  }

  getInitials(): string {
    this.refreshUser();

    const firstName = this.user?.firstName || '';
    const lastName = this.user?.lastName || '';

    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    return firstInitial + lastInitial || 'U';
  }

  formatTime(time: string): string {
    if (!time) {
      return '';
    }

    return time.slice(0, 5);
  }

  getNotificationIcon(type: string): string {
    if (type === 'RESERVATION') return '🎾';
    if (type === 'COACH_SESSION') return '🏋️';
    if (type === 'RESERVATION_CANCELLED') return '✖';
    if (type === 'COACH_SESSION_CANCELLED') return '❌';
    if (type === 'COACH_REQUEST') return '📩';
    if (type === 'COACH_REQUEST_ACCEPTED') return '✅';
    if (type === 'COACH_REQUEST_REJECTED') return '❌';
    if (type === 'COACH_REQUEST_CANCELLED') return '🚫';
    if (type === 'COACH_REQUEST_EXPIRED') return '⌛';
    if (type === 'NEW_EVENT') return '🎉';
    if (type === 'EVENT_DISABLED') return '⚠️';
    if (type === 'EVENT_REACTIVATED') return '🎉';
    if (type === 'EVENT_DELETED') return '🗑️';
    if (type === 'COACH_LEAVE_REQUEST' || type === 'COACH_LEAVE') return '🌴';
    if (type === 'COURT_MAINTENANCE') return '🛠️';
    if (type === 'ANNOUNCEMENT') return '📢';

    return '🔔';
  }

  getNotificationTitle(type: string): string {
    if (type === 'RESERVATION') return 'Réservation';
    if (type === 'COACH_SESSION') return 'Séance coach';
    if (type === 'RESERVATION_CANCELLED') return 'Réservation annulée';
    if (type === 'COACH_SESSION_CANCELLED') return 'Séance coach annulée';
    if (type === 'COACH_REQUEST') return 'Nouvelle demande de coaching';
    if (type === 'COACH_REQUEST_ACCEPTED') return 'Demande coach acceptée';
    if (type === 'COACH_REQUEST_REJECTED') return 'Demande coach refusée';
    if (type === 'COACH_REQUEST_CANCELLED') return 'Demande coach annulée';
    if (type === 'COACH_REQUEST_EXPIRED') return 'Demande coach expirée';
    if (type === 'NEW_EVENT') return 'Nouvel événement';
    if (type === 'EVENT_DISABLED') return 'Événement désactivé';
    if (type === 'EVENT_REACTIVATED') return 'Événement réactivé';
    if (type === 'EVENT_DELETED') return 'Événement supprimé';
    if (type === 'COACH_LEAVE_REQUEST' || type === 'COACH_LEAVE') return 'Demande de congé coach';
    if (type === 'COURT_MAINTENANCE') return 'Maintenance terrain';
    if (type === 'ANNOUNCEMENT') return 'Annonce';

    return 'Notification';
  }

  onNotificationClick(notification: any): void {
    this.notificationsOpen.set(false);
    this.goToNotificationTarget(notification);
  }

  onCloseNotification(event: Event, notificationId: number): void {
    event.stopPropagation();

    if (!notificationId) {
      return;
    }

    this.notificationService.markAsRead(notificationId)
      .subscribe({
        next: () => {
          this.notifications.update(notifications =>
            notifications.filter(notification => notification.id !== notificationId)
          );

          this.notificationCount.set(
            this.notifications().filter(notification => notification.readStatus !== true).length
          );
        }
      });
  }

  private goToNotificationTarget(notification: any): void {
    const user = this.authService.getUser();
    const role = (user?.role || '').toUpperCase();

    if (role === 'ADMIN') {
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
      return;
    }

    if (role === 'COACH') {
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

      this.router.navigate(['/coach']);
      return;
    }

    if (role === 'CLIENT') {
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

      if (
        notification.type === 'NEW_EVENT' ||
        notification.type === 'EVENT_DISABLED' ||
        notification.type === 'EVENT_REACTIVATED' ||
        notification.type === 'EVENT_DELETED'
      ) {
        sessionStorage.setItem('client_events_seen', 'true');
        this.router.navigate(['/client/events']);
        return;
      }

      this.router.navigate(['/client']);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkTheme(): boolean {
    return this.themeService.isDark();
  }
}
