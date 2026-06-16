import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth';
import { ClientService } from '../../services/client';

@Component({
  selector: 'app-client-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './client-reservations.html',
  styleUrls: ['./client-reservations.css']
})
export class ClientReservations {

  reservations = signal<any[]>([]);
  loaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  currentClientId: number | null = null;

  selectedDate = signal('');
  selectedCourtFilter = signal('ALL');
  selectedStatusFilter = signal('ALL');

  statusFilters: string[] = [
    'ALL',
    'CONFIRMED',
    'PENDING',
    'CANCELLED',
    'COMPLETED'
  ];

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
          const sortedReservations = data.sort((a, b) => {
            if (a.reservationDate < b.reservationDate) return -1;
            if (a.reservationDate > b.reservationDate) return 1;

            if (a.startTime < b.startTime) return -1;
            if (a.startTime > b.startTime) return 1;

            return 0;
          });

          this.reservations.set(sortedReservations);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des réservations.');
          this.successMessage.set('');
        }
      });
  }

  filteredReservations(): any[] {
    return this.reservations().filter(reservation => {
      const matchesDate =
        !this.selectedDate() ||
        reservation.reservationDate === this.selectedDate();

      const matchesCourt =
        this.selectedCourtFilter() === 'ALL' ||
        String(reservation.court?.courtNumber) === this.selectedCourtFilter();

      const matchesStatus =
        this.selectedStatusFilter() === 'ALL' ||
        reservation.status === this.selectedStatusFilter();

      return matchesDate && matchesCourt && matchesStatus;
    });
  }

  getCourtNumbers(): number[] {
    const courtNumbers = this.reservations()
      .map(reservation => reservation.court?.courtNumber)
      .filter(courtNumber => courtNumber !== undefined && courtNumber !== null);

    return [...new Set(courtNumbers)].sort((a, b) => a - b);
  }

  resetFilters(): void {
    this.selectedDate.set('');
    this.selectedCourtFilter.set('ALL');
    this.selectedStatusFilter.set('ALL');
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