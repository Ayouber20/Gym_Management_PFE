import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { UserService } from '../../services/user';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.css']
})
export class AdminUsers {

  users = signal<any[]>([]);
  loaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  firstName = signal('');
  lastName = signal('');
  email = signal('');
  password = signal('');
  role = signal('');

  searchTerm = signal('');
  selectedRoleFilter = signal('ALL');

  roles: string[] = [
    'CLIENT',
    'COACH',
    'ADMIN'
  ];

  roleFilters: string[] = [
    'ALL',
    'CLIENT',
    'COACH',
    'ADMIN'
  ];

  constructor(private userService: UserService) {
    afterNextRender(() => {
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.userService.getUsers()
      .subscribe({
        next: (data) => {
          const sortedUsers = data.sort((a, b) => {
            const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
            const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();

            return nameA.localeCompare(nameB);
          });

          this.users.set(sortedUsers);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des utilisateurs.');
          this.successMessage.set('');
        }
      });
  }

  filteredUsers(): any[] {
    const search = this.searchTerm().toLowerCase().trim();

    return this.users().filter(user => {
      const firstName = user.firstName?.toLowerCase() || '';
      const lastName = user.lastName?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';

      const matchesSearch =
        firstName.includes(search) ||
        lastName.includes(search) ||
        email.includes(search);

      const matchesRole =
        this.selectedRoleFilter() === 'ALL' ||
        user.role === this.selectedRoleFilter();

      return matchesSearch && matchesRole;
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedRoleFilter.set('ALL');
  }

  createUser(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.firstName() || !this.lastName() || !this.email() || !this.password() || !this.role()) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    const user = {
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: this.email(),
      password: this.password(),
      role: this.role()
    };

    this.userService.createUser(user)
      .subscribe({
        next: () => {
          this.successMessage.set('Utilisateur créé avec succès.');
          this.errorMessage.set('');

          this.resetForm();
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message ||
            'Erreur lors de la création de l’utilisateur.'
          );

          this.successMessage.set('');
        }
      });
  }

  resetForm(): void {
    this.firstName.set('');
    this.lastName.set('');
    this.email.set('');
    this.password.set('');
    this.role.set('');
  }
}