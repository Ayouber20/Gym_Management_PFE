import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CoachRequestService } from '../../services/coach-request';
import { AuthService } from '../../services/auth';
import { CoachService } from '../../services/coach';

@Component({
  selector: 'app-coach-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './coach-requests.html',
  styleUrls: ['./coach-requests.css']
})
export class CoachRequests {

  requests = signal<any[]>([]);
  loaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  currentCoachId: number | null = null;

  searchTerm = signal('');
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
    private coachService: CoachService
  ) {
    afterNextRender(() => {
      sessionStorage.setItem('coach_requests_seen', 'true');
      this.loadCurrentCoach();
    });
  }

  loadCurrentCoach(): void {
    const user = this.authService.getUser();

    if (!user) {
      this.loaded.set(true);
      this.errorMessage.set('Vous devez être connecté.');
      this.successMessage.set('');
      return;
    }

    this.coachService.getCoachByUserId(user.id)
      .subscribe({
        next: (coach) => {
          this.currentCoachId = coach.id;
          this.loadRequests();
        },
        error: (error) => {
          const backendMessage = this.getBackendErrorMessage(error);

          this.loaded.set(true);
          this.errorMessage.set(
            backendMessage || 'Profil coach introuvable.'
          );
          this.successMessage.set('');
        }
      });
  }

  loadRequests(): void {
    if (!this.currentCoachId) {
      this.loaded.set(true);
      return;
    }

    this.coachRequestService.getRequestsByCoach(this.currentCoachId)
      .subscribe({
        next: (data) => {
          const coachRequests = data
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

          this.requests.set(coachRequests);
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
    const search = this.searchTerm().toLowerCase().trim();

    return this.requests()
      .filter(request => {
        const clientFullName =
          `${request.client?.user?.firstName || ''} ${request.client?.user?.lastName || ''}`.toLowerCase();

        const clientEmail =
          request.client?.user?.email?.toLowerCase() || '';

        const matchesSearch =
          clientFullName.includes(search) ||
          clientEmail.includes(search);

        const matchesActivity =
          this.selectedActivityFilter() === 'ALL' ||
          request.activity === this.selectedActivityFilter();

        const matchesStatus =
          this.selectedStatusFilter() === 'ALL' ||
          request.status === this.selectedStatusFilter();

        const matchesDate =
          !this.selectedDate() ||
          request.requestDate === this.selectedDate();

        return matchesSearch && matchesActivity && matchesStatus && matchesDate;
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
    this.searchTerm.set('');
    this.selectedActivityFilter.set('ALL');
    this.selectedStatusFilter.set('ALL');
    this.selectedDate.set('');
  }

  acceptRequest(id: number): void {
    if (!confirm('Voulez-vous accepter cette demande ?')) {
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.coachRequestService.acceptRequest(id)
      .subscribe({
        next: () => {
          this.successMessage.set('Demande acceptée avec succès.');
          this.errorMessage.set('');

          this.loadRequests();
        },
        error: (error) => {
          const backendMessage = this.getBackendErrorMessage(error);

          this.errorMessage.set(
            backendMessage || 'Erreur lors de l’acceptation.'
          );

          this.successMessage.set('');
        }
      });
  }

  rejectRequest(id: number): void {
    if (!confirm('Voulez-vous refuser cette demande ?')) {
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.coachRequestService.rejectRequest(id)
      .subscribe({
        next: () => {
          this.successMessage.set('Demande refusée avec succès.');
          this.errorMessage.set('');

          this.loadRequests();
        },
        error: (error) => {
          const backendMessage = this.getBackendErrorMessage(error);

          this.errorMessage.set(
            backendMessage || 'Erreur lors du refus.'
          );
          this.successMessage.set('');
        }
      });
  }

  getStatusLabel(status: string): string {
    return status || '';
  }

  hideRequestForCoach(id: number): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    this.coachRequestService.hideRequestForCoach(id)
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