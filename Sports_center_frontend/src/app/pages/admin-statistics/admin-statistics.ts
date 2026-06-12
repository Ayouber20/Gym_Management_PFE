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
  totalReservations = signal(0);
  totalCoachRequests = signal(0);

  availableCourts = signal(0);
  maintenanceCourts = signal(0);

  pendingRequests = signal(0);
  acceptedRequests = signal(0);
  rejectedRequests = signal(0);

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
        this.totalUsers.set(data.users.length);
        this.totalClients.set(data.clients.length);
        this.totalCoaches.set(data.coaches.length);
        this.totalReservations.set(data.reservations.length);
        this.totalCoachRequests.set(data.coachRequests.length);

        this.availableCourts.set(
          data.courts.filter(court => court.status === 'AVAILABLE').length
        );

        this.maintenanceCourts.set(
          data.courts.filter(court => court.status === 'MAINTENANCE').length
        );

        this.pendingRequests.set(
          data.coachRequests.filter(request => request.status === 'PENDING').length
        );

        this.acceptedRequests.set(
          data.coachRequests.filter(request => request.status === 'ACCEPTED').length
        );

        this.rejectedRequests.set(
          data.coachRequests.filter(request => request.status === 'REJECTED').length
        );

        this.loaded.set(true);
      },
      error: () => {
        this.loaded.set(true);
        this.errorMessage.set('Erreur lors du chargement des statistiques.');
      }
    });
  }
}