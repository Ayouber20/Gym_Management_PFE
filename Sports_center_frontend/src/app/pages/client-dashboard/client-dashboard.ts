import { Component, afterNextRender, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { ClientService } from '../../services/client';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './client-dashboard.html',
  styleUrls: ['./client-dashboard.css']
})
export class ClientDashboard {

  notifications = signal<any[]>([]);
  notificationsLoaded = signal(false);

  errorMessage = signal('');

  constructor(
    private router: Router,
    private authService: AuthService,
    private clientService: ClientService,
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

    this.clientService.getClientByUserId(user.id)
      .subscribe({
        next: (client) => {
          this.notificationService.getClientNotifications(client.id)
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
          this.errorMessage.set('Profil client introuvable.');
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