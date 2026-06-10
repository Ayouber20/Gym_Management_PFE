import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth';
import { ClientService } from '../../services/client';

@Component({
  selector: 'app-client-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-reservations.html',
  styleUrls: ['./client-reservations.css']
})
export class ClientReservations {

  reservations = signal<any[]>([]);
  loaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  currentClientId: number | null = null;

  constructor(
    private reservationService: ReservationService,
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
      this.successMessage.set('');
      return;
    }

    this.clientService.getClientByUserId(user.id)
      .subscribe({
        next: (client) => {
          this.currentClientId = client.id;
          this.loadReservations();
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Profil client introuvable.');
          this.successMessage.set('');
        }
      });
  }

  loadReservations(): void {
    if (!this.currentClientId) {
      this.loaded.set(true);
      return;
    }

    this.reservationService
      .getReservationsByClient(this.currentClientId)
      .subscribe({
        next: (data) => {
          this.reservations.set(data);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des réservations.');
          this.successMessage.set('');
        }
      });
  }

  deleteReservation(id: number): void {
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) {
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.reservationService.deleteReservation(id)
      .subscribe({
        next: () => {
          this.successMessage.set('Réservation annulée avec succès.');
          this.errorMessage.set('');

          this.loadReservations();
        },
        error: () => {
          this.errorMessage.set('Erreur lors de l’annulation.');
          this.successMessage.set('');
        }
      });
  }
}