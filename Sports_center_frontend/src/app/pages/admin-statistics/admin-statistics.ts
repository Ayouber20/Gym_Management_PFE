import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { UserService } from '../../services/user';
import { ClientService } from '../../services/client';
import { CoachService } from '../../services/coach';
import { CourtService } from '../../services/court';
import { ReservationService } from '../../services/reservation';
import { CoachRequestService } from '../../services/coach-request';

@Component({
  selector: 'app-admin-statistics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-statistics.html',
  styleUrls: ['./admin-statistics.css']
})
export class AdminStatistics {

  loaded = signal(false);
  errorMessage = signal('');

  totalUsers = signal(0);
  totalClients = signal(0);
  totalCoaches = signal(0);
  totalCourts = signal(0);
  totalReservations = signal(0);
  totalCoachRequests = signal(0);

  availableCourts = signal(0);
  maintenanceCourts = signal(0);

  confirmedReservations = signal(0);
  pendingReservations = signal(0);
  cancelledReservations = signal(0);
  completedReservations = signal(0);

  pendingRequests = signal(0);
  acceptedRequests = signal(0);
  rejectedRequests = signal(0);

  courtAvailabilityRate = signal(0);
  coachRequestAcceptanceRate = signal(0);

  constructor(
    private userService: UserService,
    private clientService: ClientService,
    private coachService: CoachService,
    private courtService: CourtService,
    private reservationService: ReservationService,
    private coachRequestService: CoachRequestService
  ) {
    afterNextRender(() => {
      this.loadStatistics();
    });
  }

  loadStatistics(): void {
    this.errorMessage.set('');
    this.loaded.set(false);

    forkJoin({
      users: this.userService.getUsers(),
      clients: this.clientService.getClients(),
      coaches: this.coachService.getCoaches(),
      courts: this.courtService.getCourts(),
      reservations: this.reservationService.getReservations(),
      coachRequests: this.coachRequestService.getRequests()
    }).subscribe({
      next: (data) => {
        const users = data.users || [];
        const clients = data.clients || [];
        const coaches = data.coaches || [];
        const courts = data.courts || [];
        const reservations = data.reservations || [];
        const coachRequests = data.coachRequests || [];

        this.totalUsers.set(users.length);
        this.totalClients.set(clients.length);
        this.totalCoaches.set(coaches.length);
        this.totalCourts.set(courts.length);
        this.totalReservations.set(reservations.length);
        this.totalCoachRequests.set(coachRequests.length);

        this.availableCourts.set(
          courts.filter(court => court.status === 'AVAILABLE').length
        );

        this.maintenanceCourts.set(
          courts.filter(court => court.status === 'MAINTENANCE').length
        );

        this.confirmedReservations.set(
          reservations.filter(reservation => reservation.status === 'CONFIRMED').length
        );

        this.pendingReservations.set(
          reservations.filter(reservation => reservation.status === 'PENDING').length
        );

        this.cancelledReservations.set(
          reservations.filter(reservation => reservation.status === 'CANCELLED').length
        );

        this.completedReservations.set(
          reservations.filter(reservation => reservation.status === 'COMPLETED').length
        );

        this.pendingRequests.set(
          coachRequests.filter(request => request.status === 'PENDING').length
        );

        this.acceptedRequests.set(
          coachRequests.filter(request => request.status === 'ACCEPTED').length
        );

        this.rejectedRequests.set(
          coachRequests.filter(request => request.status === 'REJECTED').length
        );

        this.calculateRates();

        this.loaded.set(true);
      },
      error: () => {
        this.loaded.set(true);
        this.errorMessage.set('Erreur lors du chargement des statistiques.');
      }
    });
  }

  calculateRates(): void {
    if (this.totalCourts() > 0) {
      const availabilityRate = Math.round(
        (this.availableCourts() / this.totalCourts()) * 100
      );

      this.courtAvailabilityRate.set(availabilityRate);
    } else {
      this.courtAvailabilityRate.set(0);
    }

    const decidedRequests =
      this.acceptedRequests() + this.rejectedRequests();

    if (decidedRequests > 0) {
      const acceptanceRate = Math.round(
        (this.acceptedRequests() / decidedRequests) * 100
      );

      this.coachRequestAcceptanceRate.set(acceptanceRate);
    } else {
      this.coachRequestAcceptanceRate.set(0);
    }
  }
}