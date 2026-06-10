import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CoachRequestService } from '../../services/coach-request';
import { AuthService } from '../../services/auth';
import { ClientService } from '../../services/client';

@Component({
  selector: 'app-client-coach-requests',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-coach-requests.html',
  styleUrls: ['./client-coach-requests.css']
})
export class ClientCoachRequests {

  requests = signal<any[]>([]);
  loaded = signal(false);

  currentClientId: number | null = null;

  constructor(
    private coachRequestService: CoachRequestService,
    private authService: AuthService,
    private clientService: ClientService
  ) {
    afterNextRender(() => {
      this.loadCurrentClient();
    });
  }

  loadCurrentClient(): void {
    const user = this.authService.getUser();

    if (!user) {
      this.loaded.set(true);
      alert('Vous devez être connecté.');
      return;
    }

    this.clientService.getClientByUserId(user.id)
      .subscribe({
        next: (client) => {
          this.currentClientId = client.id;
          this.loadRequests();
        },
        error: () => {
          this.loaded.set(true);
          alert('Profil client introuvable.');
        }
      });
  }

  loadRequests(): void {
    if (!this.currentClientId) {
      this.loaded.set(true);
      return;
    }

    this.coachRequestService
      .getRequestsByClient(this.currentClientId)
      .subscribe({
        next: (data) => {
          this.requests.set(data);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          alert('Erreur lors du chargement des demandes.');
        }
      });
  }
}