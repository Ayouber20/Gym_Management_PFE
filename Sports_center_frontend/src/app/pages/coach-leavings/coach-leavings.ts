import { Component, afterNextRender, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { CoachService } from '../../services/coach';
import { CoachLeavingService } from '../../services/coach-leaving';

@Component({
  selector: 'app-coach-leavings',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './coach-leavings.html',
  styleUrls: ['./coach-leavings.css']
})
export class CoachLeavings {

  leaves = signal<any[]>([]);
  loaded = signal(false);

  coachId = signal<number | null>(null);

  startDate = signal('');
  endDate = signal('');
  reason = signal('');

  successMessage = signal('');
  errorMessage = signal('');

  tomorrow = this.getTomorrowDate();

  constructor(
    private authService: AuthService,
    private coachService: CoachService,
    private coachLeavingService: CoachLeavingService,
    private router: Router
  ) {
    afterNextRender(() => {
      this.loadCoach();
    });
  }

  loadCoach(): void {
    const user = this.authService.getUser();

    if (!user) {
      this.errorMessage.set('Vous devez être connecté.');
      this.loaded.set(true);
      return;
    }

    this.coachService.getCoachByUserId(user.id)
      .subscribe({
        next: (coach) => {
          this.coachId.set(coach.id);
          this.loadLeaves();
        },
        error: () => {
          this.errorMessage.set('Profil coach introuvable.');
          this.loaded.set(true);
        }
      });
  }

  loadLeaves(): void {
    const id = this.coachId();

    if (!id) {
      return;
    }

    this.coachLeavingService.getLeavesByCoach(id)
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

  submitLeaveRequest(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    const id = this.coachId();

    if (!id) {
      this.errorMessage.set('Profil coach introuvable.');
      return;
    }

    if (!this.startDate() || !this.endDate()) {
      this.errorMessage.set('Veuillez choisir une date de début et une date de fin.');
      return;
    }

    const leaveRequest = {
      startDate: this.startDate(),
      endDate: this.endDate(),
      reason: this.reason(),
      coach: {
        id: id
      }
    };

    this.coachLeavingService.createLeaveRequest(leaveRequest)
      .subscribe({
        next: () => {
          this.successMessage.set('Demande de congé envoyée avec succès.');
          this.startDate.set('');
          this.endDate.set('');
          this.reason.set('');
          this.loadLeaves();
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors de l’envoi de la demande de congé.'
          );
        }
      });
  }

  getTomorrowDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
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
}