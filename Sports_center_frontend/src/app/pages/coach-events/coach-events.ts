import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth';
import { CoachService } from '../../services/coach';
import { ClubEventService } from '../../services/club-event';

@Component({
  selector: 'app-coach-events',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './coach-events.html',
  styleUrls: ['./coach-events.css']
})
export class CoachEvents {

  events = signal<any[]>([]);
  participantsCount = signal<{ [key: number]: number }>({});
  participatingStatus = signal<{ [key: number]: boolean }>({});

  loaded = signal(false);
  coachId = signal<number | null>(null);

  successMessage = signal('');
  errorMessage = signal('');

  searchTerm = signal('');
  selectedDateFilter = signal('');

  constructor(
    private authService: AuthService,
    private coachService: CoachService,
    private clubEventService: ClubEventService
  ) {
    afterNextRender(() => {
      sessionStorage.setItem('coach_events_seen', 'true');
      this.loadCoach();
    });
  }

  loadCoach(): void {
    const user = this.authService.getUser();

    if (!user) {
      this.errorMessage.set('Vous devez être connecté.');
      this.loaded.set(true);
      return;
    }

    this.coachService.getCoachByUserId(user.id)
      .subscribe({
        next: (coach) => {
          this.coachId.set(coach.id);
          this.loadEvents();
        },
        error: () => {
          this.errorMessage.set('Profil coach introuvable.');
          this.loaded.set(true);
        }
      });
  }

  loadEvents(): void {
    this.clubEventService.getCoachEvents()
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
    const id = this.coachId();

    if (!id) {
      return;
    }

    for (const event of events) {
      this.clubEventService.isParticipating(event.id, 'COACH', id)
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

    const id = this.coachId();

    if (!id) {
      this.errorMessage.set('Profil coach introuvable.');
      return;
    }

    this.clubEventService.participate(eventId, 'COACH', id)
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

    const id = this.coachId();

    if (!id) {
      this.errorMessage.set('Profil coach introuvable.');
      return;
    }

    this.clubEventService.cancelParticipation(eventId, 'COACH', id)
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
      if (this.isPastEvent(event)) {
        return false;
      }

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

  isPastEvent(event: any): boolean {
    if (!event.eventDate) {
      return false;
    }

    const now = new Date();

    const eventDateTime = new Date(
      `${event.eventDate}T${event.eventTime || '23:59'}`
    );

    return eventDateTime < now;
  }
}