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

  selectedUserId: number | null = null;
  speciality = '';
  availability = '';

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
          this.coaches.set(data);
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
          const coachUsers = data.filter(user => user.role === 'COACH');
          this.users.set(coachUsers);
        },
        error: () => {
          this.errorMessage.set('Erreur lors du chargement des utilisateurs.');
          this.successMessage.set('');
        }
      });
  }

  createCoach(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.selectedUserId || !this.speciality || !this.availability) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    const coach = {
      speciality: this.speciality,
      availability: this.availability,
      user: {
        id: this.selectedUserId
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
            'Erreur lors de la création du coach.'
          );

          this.successMessage.set('');
        }
      });
  }

  resetForm(): void {
    this.selectedUserId = null;
    this.speciality = '';
    this.availability = '';
  }
}