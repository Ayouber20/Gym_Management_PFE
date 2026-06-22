import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CoachRequestService } from '../../services/coach-request';
import { AuthService } from '../../services/auth';
import { CoachService } from '../../services/coach';

@Component({
  selector: 'app-coach-sessions',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './coach-sessions.html',
  styleUrls: ['./coach-sessions.css']
})
export class CoachSessions {

  sessions = signal<any[]>([]);
  loaded = signal(false);

  errorMessage = signal('');

  currentCoachId: number | null = null;

  searchTerm = signal('');
  selectedActivityFilter = signal('ALL');
  selectedDate = signal('');

  activityFilters: string[] = [
    'ALL',
    'TENNIS',
    'GYM',
    'PISCINE'
  ];

  constructor(
    private coachRequestService: CoachRequestService,
    private authService: AuthService,
    private coachService: CoachService
  ) {
    afterNextRender(() => {
      this.loadCurrentCoach();
    });
  }

  loadCurrentCoach(): void {
    const user = this.authService.getUser();

    if (!user) {
      this.loaded.set(true);
      this.errorMessage.set('Vous devez être connecté.');
      return;
    }

    this.coachService.getCoachByUserId(user.id)
      .subscribe({
        next: (coach) => {
          this.currentCoachId = coach.id;
          this.loadSessions();
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Profil coach introuvable.');
        }
      });
  }

  loadSessions(): void {
    if (!this.currentCoachId) {
      this.loaded.set(true);
      return;
    }

    this.coachRequestService.getRequestsByCoach(this.currentCoachId)
      .subscribe({
        next: (data) => {
          const visibleSessions = data
            .filter(request =>
              request.status === 'ACCEPTED' ||
              request.status === 'COMPLETED' ||
              request.status === 'CANCELLED'
            )
            .sort((a, b) => {
              if (a.requestDate < b.requestDate) return -1;
              if (a.requestDate > b.requestDate) return 1;

              if (a.requestTime < b.requestTime) return -1;
              if (a.requestTime > b.requestTime) return 1;

              return 0;
            });

          this.sessions.set(visibleSessions);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des séances.');
        }
      });
  }

  filteredSessions(): any[] {
    const search = this.searchTerm().toLowerCase().trim();

    return this.sessions().filter(session => {
      const clientFullName =
        `${session.client?.user?.firstName || ''} ${session.client?.user?.lastName || ''}`.toLowerCase();

      const clientEmail =
        session.client?.user?.email?.toLowerCase() || '';

      const matchesSearch =
        clientFullName.includes(search) ||
        clientEmail.includes(search);

      const matchesActivity =
        this.selectedActivityFilter() === 'ALL' ||
        session.activity === this.selectedActivityFilter();

      const matchesDate =
        !this.selectedDate() ||
        session.requestDate === this.selectedDate();

      return matchesSearch && matchesActivity && matchesDate;
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedActivityFilter.set('ALL');
    this.selectedDate.set('');
  }

  getStatusLabel(status: string): string {
    if (status === 'ACCEPTED') {
      return 'Acceptée';
    }

    if (status === 'COMPLETED') {
      return 'Terminée';
    }

    if (status === 'CANCELLED') {
      return 'Annulée';
    }

    return status;
  }

  hideSessionForCoach(id: number): void {
    this.coachRequestService.hideRequestForCoach(id)
      .subscribe({
        next: () => {
          this.sessions.update(sessions =>
            sessions.filter(session => session.id !== id)
          );
        },
        error: () => {
          this.errorMessage.set('Erreur lors du masquage de la séance.');
        }
      });
  }
}