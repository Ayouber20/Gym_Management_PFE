import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CoachRequestService } from '../../services/coach-request';

@Component({
  selector: 'app-admin-coach-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-coach-requests.html',
  styleUrls: ['./admin-coach-requests.css']
})
export class AdminCoachRequests {

  requests = signal<any[]>([]);
  loaded = signal(false);

  errorMessage = signal('');

  searchTerm = signal('');
  selectedActivityFilter = signal('ALL');
  selectedStatusFilter = signal('ALL');
  selectedDate = signal('');

  activityFilters: string[] = [
    'ALL',
    'TENNIS',
    'GYM',
    'PISCINE'
  ];

  statusFilters: string[] = [
    'ALL',
    'PENDING',
    'ACCEPTED',
    'REJECTED'
  ];

  constructor(private coachRequestService: CoachRequestService) {
    afterNextRender(() => {
      this.loadRequests();
    });
  }

  loadRequests(): void {
    this.coachRequestService.getRequests()
      .subscribe({
        next: (data) => {
          const sortedRequests = data.sort((a, b) => {
            if (a.requestDate < b.requestDate) return -1;
            if (a.requestDate > b.requestDate) return 1;

            if (a.requestTime < b.requestTime) return -1;
            if (a.requestTime > b.requestTime) return 1;

            return 0;
          });

          this.requests.set(sortedRequests);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des demandes de coach.');
        }
      });
  }

  filteredRequests(): any[] {
    const search = this.searchTerm().toLowerCase().trim();

    return this.requests().filter(request => {
      const clientFullName =
        `${request.client?.user?.firstName || ''} ${request.client?.user?.lastName || ''}`.toLowerCase();

      const coachFullName =
        `${request.coach?.user?.firstName || ''} ${request.coach?.user?.lastName || ''}`.toLowerCase();

      const clientEmail =
        request.client?.user?.email?.toLowerCase() || '';

      const coachEmail =
        request.coach?.user?.email?.toLowerCase() || '';

      const matchesSearch =
        clientFullName.includes(search) ||
        coachFullName.includes(search) ||
        clientEmail.includes(search) ||
        coachEmail.includes(search);

      const matchesActivity =
        this.selectedActivityFilter() === 'ALL' ||
        request.activity === this.selectedActivityFilter();

      const matchesStatus =
        this.selectedStatusFilter() === 'ALL' ||
        request.status === this.selectedStatusFilter();

      const matchesDate =
        !this.selectedDate() ||
        request.requestDate === this.selectedDate();

      return matchesSearch && matchesActivity && matchesStatus && matchesDate;
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedActivityFilter.set('ALL');
    this.selectedStatusFilter.set('ALL');
    this.selectedDate.set('');
  }
}