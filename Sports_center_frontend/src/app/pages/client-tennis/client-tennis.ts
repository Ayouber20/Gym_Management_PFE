import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CourtService } from '../../services/court';
import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth';
import { ClientService } from '../../services/client';

@Component({
  selector: 'app-client-tennis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client-tennis.html',
  styleUrls: ['./client-tennis.css']
})
export class ClientTennis {

  courts = signal<any[]>([]);
  courtsLoaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  currentClientId: number | null = null;

  today = new Date().toISOString().split('T')[0];

  tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  selectedCourtId = signal<number | null>(null);
  reservationDate = signal('');
  startTime = signal('');
  endTime = signal('');

  timeSlots: string[] = [
    '08:00',
    '10:00',
    '12:00',
    '14:00',
    '16:00',
    '18:00',
    '20:00',
    '22:00'
  ];

  constructor(
    private courtService: CourtService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private clientService: ClientService
  ) {
    afterNextRender(() => {
      this.loadCurrentClient();
      this.loadCourts();
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

  loadCourts(): void {
    this.courtService.getCourts()
      .subscribe({
        next: (data) => {
          const sortedCourts = data.sort(
            (a, b) => a.courtNumber - b.courtNumber
          );

          this.courts.set(sortedCourts);
          this.courtsLoaded.set(true);
        },
        error: () => {
          this.courtsLoaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des terrains.');
          this.successMessage.set('');
        }
      });
  }

  availableCourts(): any[] {
    return this.courts().filter(court => court.status === 'AVAILABLE');
  }

  maintenanceCourts(): any[] {
    return this.courts().filter(court => court.status === 'MAINTENANCE');
  }

  selectableTimeSlots(): string[] {
    return this.timeSlots.slice(0, this.timeSlots.length - 1);
  }

  updateEndTime(): void {
    const index = this.timeSlots.indexOf(this.startTime());

    if (index >= 0 && index < this.timeSlots.length - 1) {
      this.endTime.set(this.timeSlots[index + 1]);
    } else {
      this.endTime.set('');
    }
  }

  getSelectedCourt(): any {
    if (!this.selectedCourtId()) {
      return null;
    }

    return this.courts().find(court => court.id === this.selectedCourtId());
  }

  resetReservationForm(): void {
    this.selectedCourtId.set(null);
    this.reservationDate.set('');
    this.startTime.set('');
    this.endTime.set('');
  }

  createReservation(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.currentClientId) {
      this.errorMessage.set('Client connecté introuvable.');
      return;
    }

    if (!this.selectedCourtId() || !this.reservationDate() || !this.startTime() || !this.endTime()) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    const selectedCourt = this.getSelectedCourt();

    if (selectedCourt?.status === 'MAINTENANCE') {
      this.errorMessage.set('Ce terrain est en maintenance et ne peut pas être réservé.');
      return;
    }

    if (this.reservationDate() <= this.today) {
      this.errorMessage.set('Les réservations doivent être faites au minimum un jour à l’avance.');
      return;
    }

    const reservation = {
      reservationDate: this.reservationDate(),
      startTime: this.startTime() + ':00',
      endTime: this.endTime() + ':00',
      status: 'CONFIRMED',
      client: {
        id: this.currentClientId
      },
      court: {
        id: this.selectedCourtId()
      }
    };

    this.reservationService.createReservation(reservation)
      .subscribe({
        next: () => {
          this.successMessage.set('Réservation créée avec succès.');
          this.errorMessage.set('');

          this.resetReservationForm();
        },
        error: (err) => {
          this.errorMessage.set(this.getErrorMessage(err));
          this.successMessage.set('');
        }
      });
  }

  private getErrorMessage(err: any): string {
    if (err?.error?.message) {
      return err.error.message;
    }

    if (typeof err?.error === 'string') {
      return err.error;
    }

    return 'Erreur lors de la réservation.';
  }
}