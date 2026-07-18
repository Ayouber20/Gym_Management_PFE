import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ClubEventService } from '../../services/club-event';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-events.html',
  styleUrls: ['./admin-events.css']
})
export class AdminEvents {

  events = signal<any[]>([]);
  participantsCount = signal<{ [key: number]: number }>({});

  loaded = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  title = signal('');
  description = signal('');
  eventDate = signal('');
  eventTime = signal('');
  location = signal('');
  maxParticipants = signal<number | null>(null);
  targetAudience = signal('ALL');

  searchTerm = signal('');
  selectedAudienceFilter = signal('ALL');
  selectedStatusFilter = signal('ALL');
  selectedDateFilter = signal('');

  tomorrow = this.getTomorrowDate();

  audiences: string[] = [
    'ALL',
    'CLIENT',
    'COACH'
  ];

  statuses: string[] = [
    'ALL',
    'ACTIVE',
    'INACTIVE'
  ];

  constructor(private clubEventService: ClubEventService) {
    afterNextRender(() => {
      this.loadEvents();
    });
  }

  loadEvents(): void {
    this.clubEventService.getAllEvents()
      .subscribe({
        next: (data) => {
          this.events.set(data);
          this.loaded.set(true);
          this.loadParticipantsCounts(data);
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

  createEvent(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (
      !this.title() ||
      !this.eventDate() ||
      !this.eventTime() ||
      !this.location() ||
      !this.maxParticipants() ||
      !this.targetAudience()
    ) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const event = {
      title: this.title(),
      description: this.description(),
      eventDate: this.eventDate(),
      eventTime: this.eventTime(),
      location: this.location(),
      maxParticipants: this.maxParticipants(),
      targetAudience: this.targetAudience()
    };

    this.clubEventService.createEvent(event)
      .subscribe({
        next: () => {
          this.successMessage.set('Événement publié avec succès.');
          this.errorMessage.set('');

          this.resetForm();
          this.loadEvents();
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors de la création de l’événement.'
          );
          this.successMessage.set('');
        }
      });
  }

  disableEvent(eventId: number): void {
    if (!confirm('Voulez-vous désactiver cet événement ?')) {
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.clubEventService.disableEvent(eventId)
      .subscribe({
        next: () => {
          this.successMessage.set('Événement désactivé avec succès.');
          this.loadEvents();
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors de la désactivation de l’événement.'
          );
        }
      });
  }

  activateEvent(eventId: number): void {
    if (!confirm('Voulez-vous réactiver cet événement ?')) {
        return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.clubEventService.activateEvent(eventId)
        .subscribe({
        next: () => {
            this.successMessage.set('Événement réactivé avec succès.');
            this.errorMessage.set('');
            this.loadEvents();
        },
        error: (error) => {
            this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors de la réactivation de l’événement.'
            );
            this.successMessage.set('');
        }
        });
    }

  deleteEvent(eventId: number): void {
    if (!confirm('Voulez-vous supprimer définitivement cet événement ?')) {
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.clubEventService.deleteEvent(eventId)
      .subscribe({
        next: () => {
          this.successMessage.set('Événement supprimé avec succès.');
          this.errorMessage.set('');
          this.loadEvents();
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors de la suppression de l’événement.'
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

      const matchesAudience =
        this.selectedAudienceFilter() === 'ALL' ||
        event.targetAudience === this.selectedAudienceFilter();

      const matchesStatus =
        this.selectedStatusFilter() === 'ALL' ||
        event.status === this.selectedStatusFilter();

      const matchesDate =
        !this.selectedDateFilter() ||
        event.eventDate === this.selectedDateFilter();

      return matchesSearch && matchesAudience && matchesStatus && matchesDate;
    });
  }

  resetForm(): void {
    this.title.set('');
    this.description.set('');
    this.eventDate.set('');
    this.eventTime.set('');
    this.location.set('');
    this.maxParticipants.set(null);
    this.targetAudience.set('ALL');
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedAudienceFilter.set('ALL');
    this.selectedStatusFilter.set('ALL');
    this.selectedDateFilter.set('');
  }

  formatTime(time: string): string {
    if (!time) {
      return '';
    }

    return time.slice(0, 5);
  }

  getAudienceLabel(audience: string): string {
    if (audience === 'ALL') {
      return 'Clients et coachs';
    }

    if (audience === 'CLIENT') {
      return 'Clients uniquement';
    }

    if (audience === 'COACH') {
      return 'Coachs uniquement';
    }

    return audience;
  }

  isPastEvent(event: any): boolean {
    if (!event?.eventDate) {
      return false;
    }

    const eventDateTime = new Date(
      `${event.eventDate}T${event.eventTime || '23:59'}`
    );

    return eventDateTime < new Date();
  }

  getDisplayStatus(event: any): string {
    if (this.isPastEvent(event)) {
      return 'COMPLETED';
    }

    return event.status || '';
  }

  getStatusLabel(status: string): string {
    return status || '';
  }

  getParticipantsText(event: any): string {
    const count = this.participantsCount()[event.id] || 0;
    return `${count} / ${event.maxParticipants}`;
  }

  getTomorrowDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }
}