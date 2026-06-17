import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CourtService } from '../../services/court';

@Component({
  selector: 'app-admin-courts',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-courts.html',
  styleUrls: ['./admin-courts.css']
})
export class AdminCourts {

  courts = signal<any[]>([]);
  loaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  searchTerm = signal('');
  selectedStatusFilter = signal('ALL');

  maintenanceDates = signal<Record<number, { startDate: string; endDate: string }>>({});

  today = new Date().toISOString().split('T')[0];

  statusFilters: string[] = [
    'ALL',
    'AVAILABLE',
    'MAINTENANCE'
  ];

  constructor(private courtService: CourtService) {
    afterNextRender(() => {
      this.loadCourts();
    });
  }

  loadCourts(): void {
    this.courtService.getCourts()
      .subscribe({
        next: (data) => {
          const sortedCourts = data.sort(
            (a, b) => a.courtNumber - b.courtNumber
          );

          this.courts.set(sortedCourts);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des terrains.');
          this.successMessage.set('');
        }
      });
  }

  filteredCourts(): any[] {
    const search = this.searchTerm().toLowerCase().trim();

    return this.courts().filter(court => {
      const courtNumber = String(court.courtNumber || '').toLowerCase();

      const matchesSearch =
        courtNumber.includes(search) ||
        `terrain ${courtNumber}`.includes(search);

      const matchesStatus =
        this.selectedStatusFilter() === 'ALL' ||
        court.status === this.selectedStatusFilter();

      return matchesSearch && matchesStatus;
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedStatusFilter.set('ALL');
  }

  getMaintenanceStartDate(courtId: number): string {
    return this.maintenanceDates()[courtId]?.startDate || '';
  }

  getMaintenanceEndDate(courtId: number): string {
    return this.maintenanceDates()[courtId]?.endDate || '';
  }

  setMaintenanceStartDate(courtId: number, value: string): void {
    const current = this.maintenanceDates();

    this.maintenanceDates.set({
      ...current,
      [courtId]: {
        startDate: value,
        endDate: current[courtId]?.endDate || ''
      }
    });
  }

  setMaintenanceEndDate(courtId: number, value: string): void {
    const current = this.maintenanceDates();

    this.maintenanceDates.set({
      ...current,
      [courtId]: {
        startDate: current[courtId]?.startDate || '',
        endDate: value
      }
    });
  }

  resetMaintenanceDates(courtId: number): void {
    const current = { ...this.maintenanceDates() };
    delete current[courtId];

    this.maintenanceDates.set(current);
  }

  setMaintenance(id: number): void {
    const court = this.courts().find(c => c.id === id);
    const courtNumber = court?.courtNumber;

    const startDate = this.getMaintenanceStartDate(id);
    const endDate = this.getMaintenanceEndDate(id);

    this.successMessage.set('');
    this.errorMessage.set('');

    if (!startDate || !endDate) {
      this.errorMessage.set('Veuillez choisir une date de début et une date de fin de maintenance.');
      return;
    }

    if (startDate < this.today) {
      this.errorMessage.set('La date de début de maintenance ne peut pas être passée.');
      return;
    }

    if (endDate < startDate) {
      this.errorMessage.set('La date de fin doit être après ou égale à la date de début.');
      return;
    }

    if (
      !confirm(
        `Voulez-vous mettre le terrain ${courtNumber} en maintenance du ${startDate} au ${endDate} ?`
      )
    ) {
      return;
    }

    this.courtService
      .setMaintenance(id, startDate, endDate)
      .subscribe({
        next: () => {
          this.successMessage.set(`Terrain ${courtNumber} mis en maintenance avec succès.`);
          this.errorMessage.set('');

          this.resetMaintenanceDates(id);
          this.loadCourts();
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message ||
            err?.error ||
            'Erreur lors de la modification du terrain.'
          );
          this.successMessage.set('');
        }
      });
  }

  setAvailable(id: number): void {
    const court = this.courts().find(c => c.id === id);
    const courtNumber = court?.courtNumber;

    if (!confirm(`Voulez-vous rendre le terrain ${courtNumber} disponible ?`)) {
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.courtService.setAvailable(id)
      .subscribe({
        next: () => {
          this.successMessage.set(`Terrain ${courtNumber} rendu disponible avec succès.`);
          this.errorMessage.set('');

          this.loadCourts();
        },
        error: () => {
          this.errorMessage.set('Erreur lors de la modification du terrain.');
          this.successMessage.set('');
        }
      });
  }
}