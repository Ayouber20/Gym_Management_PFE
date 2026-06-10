import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ReservationService } from '../../services/reservation';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-reservations.html',
  styleUrls: ['./admin-reservations.css']
})
export class AdminReservations {

  reservations = signal<any[]>([]);
  loaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  constructor(private reservationService: ReservationService) {
    afterNextRender(() => {
      this.loadReservations();
    });
  }

  loadReservations(): void {
    this.reservationService.getReservations()
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

  deleteReservation(id: number): void {
    const reservation = this.reservations().find(r => r.id === id);

    const courtNumber = reservation?.court?.courtNumber;
    const reservationDate = reservation?.reservationDate;
    const startTime = reservation?.startTime;
    const endTime = reservation?.endTime;

    if (
      !confirm(
        `Voulez-vous vraiment supprimer la réservation du terrain ${courtNumber} le ${reservationDate} de ${startTime} à ${endTime} ?`
      )
    ) {
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.reservationService.deleteReservation(id)
      .subscribe({
        next: () => {
          this.successMessage.set(
            `Réservation du terrain ${courtNumber} supprimée avec succès.`
          );
          this.errorMessage.set('');

          this.loadReservations();
        },
        error: () => {
          this.errorMessage.set('Erreur lors de la suppression de la réservation.');
          this.successMessage.set('');
        }
      });
  }
}