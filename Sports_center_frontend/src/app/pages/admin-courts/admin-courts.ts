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

  setMaintenance(id: number): void {
    const court = this.courts().find(c => c.id === id);
    const courtNumber = court?.courtNumber;

    if (!confirm(`Voulez-vous mettre le terrain ${courtNumber} en maintenance ?`)) {
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.courtService.setMaintenance(id)
      .subscribe({
        next: () => {
          this.successMessage.set(`Terrain ${courtNumber} mis en maintenance avec succès.`);
          this.errorMessage.set('');

          this.loadCourts();
        },
        error: () => {
          this.errorMessage.set('Erreur lors de la modification du terrain.');
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