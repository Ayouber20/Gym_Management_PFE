import { Component, afterNextRender, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { CoachLeavingService } from '../../services/coach-leaving';

@Component({
  selector: 'app-admin-coach-leavings',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-coach-leavings.html',
  styleUrls: ['./admin-coach-leavings.css']
})
export class AdminCoachLeavings {

  leaves = signal<any[]>([]);
  loaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private coachLeavingService: CoachLeavingService,
    private router: Router
  ) {
    afterNextRender(() => {
      this.loadLeaves();
    });
  }

  loadLeaves(): void {
    this.coachLeavingService.getAllLeaves()
      .subscribe({
        next: (data) => {
          this.leaves.set(data);
          this.loaded.set(true);
        },
        error: () => {
          this.errorMessage.set('Erreur lors du chargement des demandes de congé.');
          this.loaded.set(true);
        }
      });
  }

  acceptLeave(id: number): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    this.coachLeavingService.acceptLeaveRequest(id)
      .subscribe({
        next: () => {
          this.successMessage.set('Demande de congé acceptée avec succès.');
          this.loadLeaves();
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors de l’acceptation de la demande.'
          );
        }
      });
  }

  rejectLeave(id: number): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    this.coachLeavingService.rejectLeaveRequest(id)
      .subscribe({
        next: () => {
          this.successMessage.set('Demande de congé refusée.');
          this.loadLeaves();
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors du refus de la demande.'
          );
        }
      });
  }

  getStatusLabel(status: string): string {
    if (status === 'PENDING') {
      return 'En attente';
    }

    if (status === 'ACCEPTED') {
      return 'Accepté';
    }

    if (status === 'REJECTED') {
      return 'Refusé';
    }

    return status;
  }

  getCoachName(leave: any): string {
    if (!leave.coach || !leave.coach.user) {
      return '-';
    }

    return leave.coach.user.firstName + ' ' + leave.coach.user.lastName;
  }
}