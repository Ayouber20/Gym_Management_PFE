import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ClientService } from '../../services/client';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-clients.html',
  styleUrls: ['./admin-clients.css']
})
export class AdminClients {

  clients = signal<any[]>([]);
  users = signal<any[]>([]);
  loaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  selectedUserId: number | null = null;
  membershipNumber = '';

  constructor(
    private clientService: ClientService,
    private userService: UserService
  ) {
    afterNextRender(() => {
      this.loadClients();
      this.loadUsers();
    });
  }

  loadClients(): void {
    this.clientService.getClients()
      .subscribe({
        next: (data) => {
          this.clients.set(data);
          this.loaded.set(true);
        },
        error: () => {
          this.loaded.set(true);
          this.errorMessage.set('Erreur lors du chargement des clients.');
          this.successMessage.set('');
        }
      });
  }

  loadUsers(): void {
    this.userService.getUsers()
      .subscribe({
        next: (data) => {
          const clientUsers = data.filter(user => user.role === 'CLIENT');
          this.users.set(clientUsers);
        },
        error: () => {
          this.errorMessage.set('Erreur lors du chargement des utilisateurs.');
          this.successMessage.set('');
        }
      });
  }

  createClient(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.selectedUserId || !this.membershipNumber) {
      this.errorMessage.set('Veuillez choisir un utilisateur et saisir un numéro d’adhésion.');
      return;
    }

    const client = {
      membershipNumber: this.membershipNumber,
      user: {
        id: this.selectedUserId
      }
    };

    this.clientService.createClient(client)
      .subscribe({
        next: () => {
          this.successMessage.set('Client créé avec succès.');
          this.errorMessage.set('');

          this.resetForm();
          this.loadClients();
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message ||
            'Erreur lors de la création du client.'
          );

          this.successMessage.set('');
        }
      });
  }

  resetForm(): void {
    this.selectedUserId = null;
    this.membershipNumber = '';
  }
}