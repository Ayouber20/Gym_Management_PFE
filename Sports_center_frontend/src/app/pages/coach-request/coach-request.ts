import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CoachRequestService } from '../../services/coach-request';
import { AuthService } from '../../services/auth';
import { ClientService } from '../../services/client';
import { CoachService } from '../../services/coach';

@Component({
  selector: 'app-coach-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './coach-request.html',
  styleUrls: ['./coach-request.css']
})
export class CoachRequest {

  successMessage = signal('');
  errorMessage = signal('');

  coaches = signal<any[]>([]);
  coachesLoaded = signal(false);

  currentClientId: number | null = null;

  activities: string[] = [
    'TENNIS',
    'GYM',
    'PISCINE'
  ];

  timeSlots: string[] = [
    '08:00',
    '10:00',
    '12:00',
    '14:00',
    '16:00',
    '18:00',
    '20:00'
  ];

  selectedActivity = signal('');
  requestDate = signal('');
  requestTime = signal('');
  coachId = signal<number | null>(null);

  today = new Date().toISOString().split('T')[0];

  tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];

  constructor(
    private coachRequestService: CoachRequestService,
    private authService: AuthService,
    private clientService: ClientService,
    private coachService: CoachService
  ) {
    afterNextRender(() => {
      this.loadCurrentClient();
      this.loadCoaches();
    });
  }

  loadCurrentClient(): void {
    const user = this.authService.getUser();

    if (!user) {
      this.errorMessage.set('Vous devez être connecté.');
      this.successMessage.set('');
      return;
    }

    this.clientService.getClientByUserId(user.id)
      .subscribe({
        next: (client) => {
          this.currentClientId = client.id;
        },
        error: () => {
          this.errorMessage.set('Profil client introuvable.');
          this.successMessage.set('');
        }
      });
  }

  loadCoaches(): void {
    this.coachService.getCoaches()
      .subscribe({
        next: (data) => {
          const sortedCoaches = data.sort((a, b) => {
            const nameA = `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase();
            const nameB = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase();

            return nameA.localeCompare(nameB);
          });

          this.coaches.set(sortedCoaches);
          this.coachesLoaded.set(true);
        },
        error: () => {
          this.coachesLoaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des coachs.');
          this.successMessage.set('');
        }
      });
  }

  onActivityChange(activity: string): void {
    this.selectedActivity.set(activity);
    this.coachId.set(null);
  }

  filteredCoaches(): any[] {
    if (!this.selectedActivity()) {
      return this.coaches();
    }

    return this.coaches().filter(coach =>
      coach.speciality === this.selectedActivity()
    );
  }

  getSelectedCoach(): any {
    if (!this.coachId()) {
      return null;
    }

    return this.coaches().find(coach => coach.id === this.coachId());
  }

  sendRequest(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.currentClientId) {
      this.errorMessage.set('Client connecté introuvable.');
      return;
    }

    if (!this.selectedActivity() || !this.requestDate() || !this.requestTime() || !this.coachId()) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    if (this.requestDate() <= this.today) {
      this.errorMessage.set('Les demandes de coach doivent être faites au minimum un jour à l’avance.');
      return;
    }

    const selectedCoach = this.getSelectedCoach();

    if (!selectedCoach) {
      this.errorMessage.set('Coach introuvable.');
      return;
    }

    if (selectedCoach.speciality !== this.selectedActivity()) {
      this.errorMessage.set('Le coach choisi ne correspond pas à l’activité sélectionnée.');
      return;
    }

    const request = {
      requestDate: this.requestDate(),
      requestTime: this.requestTime() + ':00',
      activity: this.selectedActivity(),
      status: 'PENDING',
      client: {
        id: this.currentClientId
      },
      coach: {
        id: this.coachId()
      }
    };

    this.coachRequestService.createRequest(request)
      .subscribe({
        next: () => {
          this.successMessage.set('Demande envoyée avec succès.');
          this.errorMessage.set('');

          this.resetForm();
        },
        error: (err) => {
          this.errorMessage.set(this.getErrorMessage(err));
          this.successMessage.set('');
        }
      });
  }

  resetForm(): void {
    this.selectedActivity.set('');
    this.requestDate.set('');
    this.requestTime.set('');
    this.coachId.set(null);
  }

  private getErrorMessage(err: any): string {
    if (typeof err?.error === 'string') {
      return err.error;
    }

    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.message) {
      return err.message;
    }

    return 'Erreur lors de l’envoi de la demande.';
  }
}