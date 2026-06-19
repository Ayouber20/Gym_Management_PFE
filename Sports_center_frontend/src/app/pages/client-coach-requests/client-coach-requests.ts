import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CoachRequestService } from '../../services/coach-request';
import { AuthService } from '../../services/auth';
import { ClientService } from '../../services/client';

@Component({
  selector: 'app-client-coach-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './client-coach-requests.html',
  styleUrls: ['./client-coach-requests.css']
})
export class ClientCoachRequests {

  requests = signal<any[]>([]);
  loaded = signal(false);

  errorMessage = signal('');

  currentClientId: number | null = null;

  selectedActivityFilter = signal('ALL');
  selectedStatusFilter = signal('ALL');
  selectedDate = signal('');

  activityFilters: string[] = [
    'ALL',
    'TENNIS',
    'GYM',
    'PISCINE'
  ];

  statusFilters: string[] = [
    'ALL',
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'COMPLETED',
    'CANCELLED',
    'EXPIRED'
  ];

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
      this.errorMessage.set('Vous devez être connecté.');
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
          this.errorMessage.set('Profil client introuvable.');
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
          const sortedRequests = data.sort((a, b) => {
            if (a.requestDate < b.requestDate) return -1;
            if (a.requestDate > b.requestDate) return 1;

            if (a.requestTime < b.requestTime) return -1;
            if (a.requestTime > b.requestTime) return 1;

            return 0;
          });

          this.requests.set(sortedRequests);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des demandes.');
        }
      });
  }

  filteredRequests(): any[] {
    return this.requests().filter(request => {
      const matchesActivity =
        this.selectedActivityFilter() === 'ALL' ||
        request.activity === this.selectedActivityFilter();

      const matchesStatus =
        this.selectedStatusFilter() === 'ALL' ||
        request.status === this.selectedStatusFilter();

      const matchesDate =
        !this.selectedDate() ||
        request.requestDate === this.selectedDate();

      return matchesActivity && matchesStatus && matchesDate;
    });
  }

  resetFilters(): void {
    this.selectedActivityFilter.set('ALL');
    this.selectedStatusFilter.set('ALL');
    this.selectedDate.set('');
  }

  getStatusLabel(status: string): string {
    if (status === 'PENDING') {
      return 'En attente';
    }

    if (status === 'ACCEPTED') {
      return 'Acceptée';
    }

    if (status === 'REJECTED') {
      return 'Refusée';
    }

    if (status === 'COMPLETED') {
      return 'Terminée';
    }

    if (status === 'CANCELLED') {
      return 'Annulée';
    }

    if (status === 'EXPIRED') {
      return 'Expirée';
    }

    return status;
  }

  hideRejectedRequest(id: number): void {
    this.coachRequestService.hideRequestForClient(id)
      .subscribe({
        next: () => {
          this.requests.update(requests =>
            requests.filter(request => request.id !== id)
          );
        },
        error: () => {
          this.errorMessage.set('Erreur lors du masquage de la demande.');
        }
      });
  }
}