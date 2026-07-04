import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth';
import { ClientService } from '../../services/client';
import { ClubEventService } from '../../services/club-event';

@Component({
  selector: 'app-client-events',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './client-events.html',
  styleUrls: ['./client-events.css']
})
export class ClientEvents {

  events = signal<any[]>([]);
  participantsCount = signal<{ [key: number]: number }>({});
  participatingStatus = signal<{ [key: number]: boolean }>({});

  loaded = signal(false);
  clientId = signal<number | null>(null);

  successMessage = signal('');
  errorMessage = signal('');

  searchTerm = signal('');
  selectedDateFilter = signal('');

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private clubEventService: ClubEventService
  ) {
    afterNextRender(() => {
      sessionStorage.setItem('client_events_seen', 'true');
      this.loadClient();
    });
  }

  loadClient(): void {
    const user = this.authService.getUser();

    if (!user) {
      this.errorMessage.set('Vous devez être connecté.');
      this.loaded.set(true);
      return;
    }

    this.clientService.getClientByUserId(user.id)
      .subscribe({
        next: (client) => {
          this.clientId.set(client.id);
          this.loadEvents();
        },
        error: () => {
          this.errorMessage.set('Profil client introuvable.');
          this.loaded.set(true);
        }
      });
  }

  loadEvents(): void {
    this.clubEventService.getClientEvents()
      .subscribe({
        next: (data) => {
          this.events.set(data);
          this.loaded.set(true);

          this.loadParticipantsCounts(data);
          this.loadParticipatingStatus(data);
        },
        error: () => {
          this.errorMessage.set('Erreur lors du chargement des événements.');
          this.loaded.set(true);
        }
      });
  }

  loadParticipantsCounts(events: any[]): void {
    for (const event of events) {
      this.clubEventService.getParticipantsCount(event.id)
        .subscribe({
          next: (count) => {
            this.participantsCount.update(current => ({
              ...current,
              [event.id]: count
            }));
          }
        });
    }
  }

  loadParticipatingStatus(events: any[]): void {
    const id = this.clientId();

    if (!id) {
      return;
    }

    for (const event of events) {
      this.clubEventService.isParticipating(event.id, 'CLIENT', id)
        .subscribe({
          next: (isParticipating) => {
            this.participatingStatus.update(current => ({
              ...current,
              [event.id]: isParticipating
            }));
          }
        });
    }
  }

  participate(eventId: number): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    const id = this.clientId();

    if (!id) {
      this.errorMessage.set('Profil client introuvable.');
      return;
    }

    this.clubEventService.participate(eventId, 'CLIENT', id)
      .subscribe({
        next: () => {
          this.successMessage.set('Participation enregistrée avec succès.');
          this.errorMessage.set('');
          this.loadEvents();
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors de la participation à l’événement.'
          );
          this.successMessage.set('');
        }
      });
  }

  cancelParticipation(eventId: number): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    const id = this.clientId();

    if (!id) {
      this.errorMessage.set('Profil client introuvable.');
      return;
    }

    this.clubEventService.cancelParticipation(eventId, 'CLIENT', id)
      .subscribe({
        next: () => {
          this.successMessage.set('Participation annulée avec succès.');
          this.errorMessage.set('');
          this.loadEvents();
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors de l’annulation de la participation.'
          );
          this.successMessage.set('');
        }
      });
  }

  filteredEvents(): any[] {
    const search = this.searchTerm().toLowerCase().trim();

    return this.events().filter(event => {
      const title = (event.title || '').toLowerCase();
      const description = (event.description || '').toLowerCase();
      const location = (event.location || '').toLowerCase();

      const matchesSearch =
        title.includes(search) ||
        description.includes(search) ||
        location.includes(search);

      const matchesDate =
        !this.selectedDateFilter() ||
        event.eventDate === this.selectedDateFilter();

      return matchesSearch && matchesDate;
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedDateFilter.set('');
  }

  formatTime(time: string): string {
    if (!time) {
      return '';
    }

    return time.slice(0, 5);
  }

  getParticipantsText(event: any): string {
    const count = this.participantsCount()[event.id] || 0;
    return `${count} / ${event.maxParticipants}`;
  }

  isFull(event: any): boolean {
    const count = this.participantsCount()[event.id] || 0;
    return count >= event.maxParticipants;
  }

  isParticipating(event: any): boolean {
    return this.participatingStatus()[event.id] === true;
  }
}