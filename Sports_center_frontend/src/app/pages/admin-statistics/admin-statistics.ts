import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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

  usersCount = signal(0);
  clientsCount = signal(0);
  coachesCount = signal(0);
  courtsCount = signal(0);
  reservationsCount = signal(0);
  coachRequestsCount = signal(0);

  pendingRequestsCount = signal(0);
  acceptedRequestsCount = signal(0);
  rejectedRequestsCount = signal(0);

  availableCourtsCount = signal(0);
  maintenanceCourtsCount = signal(0);

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
    this.userService.getUsers()
      .subscribe(users => {
        this.usersCount.set(users.length);
      });

    this.clientService.getClients()
      .subscribe(clients => {
        this.clientsCount.set(clients.length);
      });

    this.coachService.getCoaches()
      .subscribe(coaches => {
        this.coachesCount.set(coaches.length);
      });

    this.courtService.getCourts()
      .subscribe(courts => {
        this.courtsCount.set(courts.length);

        this.availableCourtsCount.set(
          courts.filter(court => court.status === 'AVAILABLE').length
        );

        this.maintenanceCourtsCount.set(
          courts.filter(court => court.status === 'MAINTENANCE').length
        );
      });

    this.reservationService.getReservations()
      .subscribe(reservations => {
        this.reservationsCount.set(reservations.length);
      });

    this.coachRequestService.getRequests()
      .subscribe(requests => {
        this.coachRequestsCount.set(requests.length);

        this.pendingRequestsCount.set(
          requests.filter(request => request.status === 'PENDING').length
        );

        this.acceptedRequestsCount.set(
          requests.filter(request => request.status === 'ACCEPTED').length
        );

        this.rejectedRequestsCount.set(
          requests.filter(request => request.status === 'REJECTED').length
        );
      });
  }
}