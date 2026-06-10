import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CoachRequestService } from '../../services/coach-request';
import { AuthService } from '../../services/auth';
import { CoachService } from '../../services/coach';

@Component({
  selector: 'app-coach-requests',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './coach-requests.html',
  styleUrls: ['./coach-requests.css']
})
export class CoachRequests {

  requests = signal<any[]>([]);
  loaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  currentCoachId: number | null = null;

  constructor(
    private coachRequestService: CoachRequestService,
    private authService: AuthService,
    private coachService: CoachService
  ) {
    afterNextRender(() => {
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
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Profil coach introuvable.');
          this.successMessage.set('');
        }
      });
  }

  loadRequests(): void {
    if (!this.currentCoachId) {
      this.loaded.set(true);
      return;
    }

    this.coachRequestService.getRequests()
      .subscribe({
        next: (data) => {
          const coachRequests = data.filter(
            request => request.coach.id === this.currentCoachId
          );

          this.requests.set(coachRequests);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des demandes.');
          this.successMessage.set('');
        }
      });
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
        error: () => {
          this.errorMessage.set('Erreur lors de l’acceptation.');
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
        error: () => {
          this.errorMessage.set('Erreur lors du refus.');
          this.successMessage.set('');
        }
      });
  }
}