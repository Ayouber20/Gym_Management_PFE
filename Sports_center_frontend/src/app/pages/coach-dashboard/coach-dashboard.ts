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
}