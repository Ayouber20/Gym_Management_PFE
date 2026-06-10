import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CoachRequestService } from '../../services/coach-request';
import { AuthService } from '../../services/auth';
import { ClientService } from '../../services/client';

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

  selectedActivity = '';
  requestDate = '';
  requestTime = '';
  coachId: number | null = null;

  today = new Date().toISOString().split('T')[0];

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

  sendRequest(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.currentClientId) {
      this.errorMessage.set('Client connecté introuvable.');
      return;
    }

    if (!this.selectedActivity || !this.requestDate || !this.requestTime || !this.coachId) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    if (this.requestDate < this.today) {
      this.errorMessage.set('Impossible de choisir une date passée.');
      return;
    }

    const request = {
      requestDate: this.requestDate,
      requestTime: this.requestTime + ':00',
      activity: this.selectedActivity,
      status: 'PENDING',
      client: {
        id: this.currentClientId
      },
      coach: {
        id: this.coachId
      }
    };

    this.coachRequestService.createRequest(request)
      .subscribe({
        next: () => {
          this.successMessage.set('Demande envoyée avec succès.');
          this.errorMessage.set('');

          this.resetForm();
        },
        error: () => {
          this.errorMessage.set('Erreur lors de l’envoi de la demande.');
          this.successMessage.set('');
        }
      });
  }

  resetForm(): void {
    this.selectedActivity = '';
    this.requestDate = '';
    this.requestTime = '';
    this.coachId = null;
  }
}