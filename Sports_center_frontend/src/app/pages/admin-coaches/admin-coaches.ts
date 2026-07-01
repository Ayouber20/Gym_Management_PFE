import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CoachService } from '../../services/coach';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-admin-coaches',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-coaches.html',
  styleUrls: ['./admin-coaches.css']
})
export class AdminCoaches {

  coaches = signal<any[]>([]);
  users = signal<any[]>([]);
  loaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  selectedUserId = signal<number | null>(null);
  speciality = signal('');
  availability = signal('');

  searchTerm = signal('');
  selectedSpecialityFilter = signal('ALL');
  selectedAvailabilityFilter = signal('ALL');

  specialities: string[] = [
    'TENNIS',
    'GYM',
    'PISCINE'
  ];

  availabilities: string[] = [
    'MATIN',
    'APRES_MIDI',
    'SOIR',
    'TOUTE_LA_JOURNEE'
  ];

  constructor(
    private coachService: CoachService,
    private userService: UserService
  ) {
    afterNextRender(() => {
      this.loadCoaches();
      this.loadUsers();
    });
  }

  loadCoaches(): void {
    this.coachService.getCoaches()
      .subscribe({
        next: (data) => {
          const sortedCoaches = data.sort((a, b) => {
            const nameA = `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase();
            const nameB = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.toLowerCase();

            return nameA.localeCompare(nameB);
          });

          this.coaches.set(sortedCoaches);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des coachs.');
          this.successMessage.set('');
        }
      });
  }

  loadUsers(): void {
    this.userService.getUsers()
      .subscribe({
        next: (data) => {
          const coachUsers = data
            .filter(user => user.role === 'COACH')
            .sort((a, b) => {
              const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
              const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();

              return nameA.localeCompare(nameB);
            });

          this.users.set(coachUsers);
        },
        error: () => {
          this.errorMessage.set('Erreur lors du chargement des utilisateurs.');
          this.successMessage.set('');
        }
      });
  }

  isAlreadyCoach(userId: number): boolean {
    return this.coaches().some(coach => coach.user?.id === userId);
  }

  filteredCoaches(): any[] {
    const search = this.searchTerm().toLowerCase().trim();

    return this.coaches().filter(coach => {
      const fullName =
        `${coach.user?.firstName || ''} ${coach.user?.lastName || ''}`.toLowerCase();

      const email =
        coach.user?.email?.toLowerCase() || '';

      const matchesSearch =
        fullName.includes(search) ||
        email.includes(search);

      const matchesSpeciality =
        this.selectedSpecialityFilter() === 'ALL' ||
        coach.speciality === this.selectedSpecialityFilter();

      const matchesAvailability =
        this.selectedAvailabilityFilter() === 'ALL' ||
        coach.availability === this.selectedAvailabilityFilter();

      return matchesSearch && matchesSpeciality && matchesAvailability;
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedSpecialityFilter.set('ALL');
    this.selectedAvailabilityFilter.set('ALL');
  }

  createCoach(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.selectedUserId() || !this.speciality() || !this.availability()) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    if (this.isAlreadyCoach(Number(this.selectedUserId()))) {
      this.errorMessage.set('Cet utilisateur est déjà enregistré comme coach.');
      return;
    }

    const coach = {
      speciality: this.speciality(),
      availability: this.availability(),
      user: {
        id: this.selectedUserId()
      }
    };

    this.coachService.createCoach(coach)
      .subscribe({
        next: () => {
          this.successMessage.set('Coach créé avec succès.');
          this.errorMessage.set('');

          this.resetForm();
          this.loadCoaches();
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message ||
            err?.error ||
            'Erreur lors de la création du coach.'
          );

          this.successMessage.set('');
        }
      });
  }

  resetForm(): void {
    this.selectedUserId.set(null);
    this.speciality.set('');
    this.availability.set('');
  }
}