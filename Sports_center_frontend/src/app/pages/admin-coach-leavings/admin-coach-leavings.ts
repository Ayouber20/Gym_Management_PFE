import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { CoachLeavingService } from '../../services/coach-leaving';

@Component({
  selector: 'app-admin-coach-leavings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-coach-leavings.html',
  styleUrls: ['./admin-coach-leavings.css']
})
export class AdminCoachLeavings {

  leaves = signal<any[]>([]);
  loaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  searchTerm = signal('');
  selectedStatusFilter = signal('ALL');
  selectedDateFilter = signal('');

  statuses: string[] = [
    'PENDING',
    'ACCEPTED',
    'REJECTED'
  ];

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
          const sortedLeaves = this.sortLeaves(data);
          this.leaves.set(sortedLeaves);
          this.loaded.set(true);
        },
        error: () => {
          this.errorMessage.set('Erreur lors du chargement des demandes de congé.');
          this.loaded.set(true);
        }
      });
  }

  private sortLeaves(data: any[]): any[] {
    return data.sort((a, b) => {
      const statusOrder: any = {
        PENDING: 1,
        ACCEPTED: 2,
        REJECTED: 3
      };

      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      const dateA = a.startDate || '';
      const dateB = b.startDate || '';

      if (dateA > dateB) {
        return -1;
      }

      if (dateA < dateB) {
        return 1;
      }

      return 0;
    });
  }

  filteredLeaves(): any[] {
    const search = this.searchTerm().toLowerCase().trim();

    return this.leaves().filter(leave => {
      const coachName = this.getCoachName(leave).toLowerCase();
      const reason = (leave.reason || '').toLowerCase();

      const matchesSearch =
        coachName.includes(search) ||
        reason.includes(search);

      const matchesStatus =
        this.selectedStatusFilter() === 'ALL' ||
        leave.status === this.selectedStatusFilter();

      const matchesDate =
        !this.selectedDateFilter() ||
        leave.startDate === this.selectedDateFilter() ||
        leave.endDate === this.selectedDateFilter();

      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedStatusFilter.set('ALL');
    this.selectedDateFilter.set('');
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
    return status || '';
  }

  getCoachName(leave: any): string {
    if (!leave.coach || !leave.coach.user) {
      return '-';
    }

    return leave.coach.user.firstName + ' ' + leave.coach.user.lastName;
  }
}