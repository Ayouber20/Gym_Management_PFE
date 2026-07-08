import { isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, Input, Output, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile-menu.html',
  styleUrls: ['./profile-menu.css']
})
export class ProfileMenu {

  @Input() notificationCount = 0;
  @Input() notifications: any[] = [];

  @Output() notificationClicked = new EventEmitter<any>();
  @Output() notificationClosed = new EventEmitter<number>();

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.user = this.authService.getUser();

    if (this.isBrowser) {
      const savedTheme = localStorage.getItem('theme');

      if (savedTheme === 'light') {
        this.darkMode.set(false);
        document.body.classList.add('light-theme');
      } else {
        this.darkMode.set(true);
        document.body.classList.remove('light-theme');
      }
    }
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
    this.notificationsOpen.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  toggleNotifications(): void {
    this.notificationsOpen.set(!this.notificationsOpen());
    this.menuOpen.set(false);
  }

  openPasswordModal(): void {
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
    this.router.navigate(['/login']);
  }

  getFullName(): string {
    if (!this.user) {
      return 'Utilisateur';
    }

    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
  }

  getEmail(): string {
    return this.user?.email || '';
  }

  getRole(): string {
    return this.user?.role || '';
  }

  getInitials(): string {
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
    this.notificationClicked.emit(notification);
    this.notificationsOpen.set(false);
  }

  onCloseNotification(event: Event, notificationId: number): void {
    event.stopPropagation();

    if (!notificationId) {
      return;
    }

    this.notificationClosed.emit(notificationId);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDarkTheme(): boolean {
    return this.themeService.isDark();
  }
}