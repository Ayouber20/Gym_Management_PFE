import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CoachRequestService } from '../../services/coach-request';
import { AuthService } from '../../services/auth';
import { CoachService } from '../../services/coach';

@Component({
  selector: 'app-coach-sessions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './coach-sessions.html',
  styleUrls: ['./coach-sessions.css']
})
export class CoachSessions {

  sessions = signal<any[]>([]);
  loaded = signal(false);

  currentCoachId: number | null = null;

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
      alert('Vous devez être connecté.');
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
          alert('Profil coach introuvable.');
        }
      });
  }

  loadSessions(): void {
    if (!this.currentCoachId) {
      this.loaded.set(true);
      return;
    }

    this.coachRequestService.getRequests()
      .subscribe({
        next: (data) => {
          const acceptedSessions = data.filter(
            request =>
              request.coach.id === this.currentCoachId &&
              request.status === 'ACCEPTED'
          );

          this.sessions.set(acceptedSessions);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          alert('Erreur lors du chargement des séances.');
        }
      });
  }
}