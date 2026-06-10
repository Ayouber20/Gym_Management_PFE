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

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  role = '';

  roles: string[] = [
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
          this.users.set(data);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des utilisateurs.');
          this.successMessage.set('');
        }
      });
  }

  createUser(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.role) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    const user = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      role: this.role
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
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.password = '';
    this.role = '';
  }
}