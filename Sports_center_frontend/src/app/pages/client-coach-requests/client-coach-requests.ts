import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CoachRequestService } from '../../services/coach-request';
import { AuthService } from '../../services/auth';
import { ClientService } from '../../services/client';

import { Router } from '@angular/router';

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
  successMessage = signal('');

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
    private clientService: ClientService,
    private router: Router
  ) {
    afterNextRender(() => {
      sessionStorage.setItem('client_coach_requests_seen', 'true');
      this.loadCurrentClient();
    });
  }

  goToCoachRequestForm(): void {
    this.router.navigate(['/demande-coach']);
  }

  loadCurrentClient(): void {
    const user = this.authService.getUser();

    if (!user) {
      this.loaded.set(true);
      this.errorMessage.set('Vous devez être connecté.');
      this.successMessage.set('');
      return;
    }

    this.clientService.getClientByUserId(user.id)
      .subscribe({
        next: (client) => {
          this.currentClientId = client.id;
          this.loadRequests();
        },
        error: (error) => {
          const backendMessage = this.getBackendErrorMessage(error);

          this.loaded.set(true);
          this.errorMessage.set(
            backendMessage || 'Profil client introuvable.'
          );
          this.successMessage.set('');
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
            if (a.status === 'PENDING' && b.status !== 'PENDING') {
              return -1;
            }

            if (a.status !== 'PENDING' && b.status === 'PENDING') {
              return 1;
            }

            const dateTimeA = `${a.requestDate} ${a.requestTime}`;
            const dateTimeB = `${b.requestDate} ${b.requestTime}`;

            return dateTimeA.localeCompare(dateTimeB);
          });

          this.requests.set(sortedRequests);
          this.loaded.set(true);
        },
        error: (error) => {
          const backendMessage = this.getBackendErrorMessage(error);

          this.loaded.set(true);
          this.errorMessage.set(
            backendMessage || 'Erreur lors du chargement des demandes.'
          );
          this.successMessage.set('');
        }
      });
  }

  filteredRequests(): any[] {
    return this.requests()
      .filter(request => {
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
      })
      .sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') {
          return -1;
        }

        if (a.status !== 'PENDING' && b.status === 'PENDING') {
          return 1;
        }

        const dateTimeA = `${a.requestDate} ${a.requestTime}`;
        const dateTimeB = `${b.requestDate} ${b.requestTime}`;

        return dateTimeA.localeCompare(dateTimeB);
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
    this.errorMessage.set('');
    this.successMessage.set('');

    this.coachRequestService.hideRequestForClient(id)
      .subscribe({
        next: () => {
          this.requests.update(requests =>
            requests.filter(request => request.id !== id)
          );

          this.successMessage.set('Demande masquée avec succès.');
          this.errorMessage.set('');
        },
        error: (error) => {
          const backendMessage = this.getBackendErrorMessage(error);

          this.errorMessage.set(
            backendMessage || 'Erreur lors du masquage de la demande.'
          );
          this.successMessage.set('');
        }
      });
  }

  private getBackendErrorMessage(error: any): string {
    if (typeof error?.error === 'string') {
      return error.error;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.message) {
      return error.message;
    }

    return '';
  }
}