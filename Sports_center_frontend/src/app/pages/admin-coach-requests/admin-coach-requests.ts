import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CoachRequestService } from '../../services/coach-request';

@Component({
  selector: 'app-admin-coach-requests',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-coach-requests.html',
  styleUrls: ['./admin-coach-requests.css']
})
export class AdminCoachRequests {

  requests = signal<any[]>([]);
  loaded = signal(false);

  constructor(private coachRequestService: CoachRequestService) {
    afterNextRender(() => {
      this.loadRequests();
    });
  }

  loadRequests(): void {
    this.coachRequestService.getRequests()
      .subscribe({
        next: (data) => {
          this.requests.set(data);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          alert('Erreur lors du chargement des demandes de coach.');
        }
      });
  }
}