import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth';
import { ClientService } from '../../services/client';
import { GroupClassService } from '../../services/group-class';

@Component({
  selector: 'app-client-group-classes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './client-group-classes.html',
  styleUrls: ['./client-group-classes.css']
})
export class ClientGroupClasses {

  groupClasses = signal<any[]>([]);
  participantsCount = signal<{ [key: number]: number }>({});

  loaded = signal(false);
  clientId = signal<number | null>(null);

  successMessage = signal('');
  errorMessage = signal('');

  searchTerm = signal('');
  selectedActivityFilter = signal('ALL');
  selectedDateFilter = signal('');

  activityFilters: string[] = [
    'ALL',
    'TENNIS',
    'GYM',
    'PISCINE'
  ];

  participatingStatus = signal<{ [key: number]: boolean }>({});

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private groupClassService: GroupClassService
  ) {
    afterNextRender(() => {
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
          this.loadGroupClasses();
        },
        error: () => {
          this.errorMessage.set('Profil client introuvable.');
          this.loaded.set(true);
        }
      });
  }

  loadGroupClasses(): void {
    this.groupClassService.getAvailableGroupClasses()
      .subscribe({
        next: (data) => {
          this.groupClasses.set(data);
          this.loaded.set(true);
          this.loadParticipantsCounts(data);
          this.loadParticipatingStatus(data);
        },
        error: () => {
          this.errorMessage.set('Erreur lors du chargement des cours collectifs.');
          this.loaded.set(true);
        }
      });
  }

  loadParticipantsCounts(courses: any[]): void {
    for (const course of courses) {
      this.groupClassService.getParticipantsCount(course.id)
        .subscribe({
          next: (count) => {
            this.participantsCount.update(current => ({
              ...current,
              [course.id]: count
            }));
          }
        });
    }
  }

  participate(courseId: number): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    const id = this.clientId();

    if (!id) {
      this.errorMessage.set('Profil client introuvable.');
      return;
    }

    this.groupClassService.participate(courseId, id)
      .subscribe({
        next: () => {
          this.successMessage.set('Participation enregistrée avec succès.');
          this.errorMessage.set('');

          this.loadGroupClasses();
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors de la participation au cours collectif.'
          );

          this.successMessage.set('');
        }
      });
  }

  filteredGroupClasses(): any[] {
    const search = this.searchTerm().toLowerCase().trim();

    return this.groupClasses().filter(course => {
      if (this.isPastGroupClass(course)) {
        return false;
      }

      const title = (course.title || '').toLowerCase();
      const description = (course.description || '').toLowerCase();

      const coachName =
        `${course.coach?.user?.firstName || ''} ${course.coach?.user?.lastName || ''}`.toLowerCase();

      const matchesSearch =
        title.includes(search) ||
        description.includes(search) ||
        coachName.includes(search);

      const matchesActivity =
        this.selectedActivityFilter() === 'ALL' ||
        course.activity === this.selectedActivityFilter();

      const matchesDate =
        !this.selectedDateFilter() ||
        course.classDate === this.selectedDateFilter();

      return matchesSearch && matchesActivity && matchesDate;
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedActivityFilter.set('ALL');
    this.selectedDateFilter.set('');
  }

  formatTime(time: string): string {
    if (!time) {
      return '';
    }

    return time.slice(0, 5);
  }

  getCoachName(course: any): string {
    if (!course.coach || !course.coach.user) {
      return '-';
    }

    return course.coach.user.firstName + ' ' + course.coach.user.lastName;
  }

  getParticipantsText(course: any): string {
    const count = this.participantsCount()[course.id] || 0;
    return `${count} / ${course.maxParticipants}`;
  }

  isFull(course: any): boolean {
    const count = this.participantsCount()[course.id] || 0;
    return count >= course.maxParticipants;
  }

  loadParticipatingStatus(courses: any[]): void {
    const id = this.clientId();

    if (!id) {
        return;
    }

    for (const course of courses) {
        this.groupClassService.isParticipating(course.id, id)
        .subscribe({
            next: (isParticipating) => {
            this.participatingStatus.update(current => ({
                ...current,
                [course.id]: isParticipating
            }));
            }
        });
    }
    }

    isParticipating(course: any): boolean {
        return this.participatingStatus()[course.id] === true;
    }

    cancelParticipation(courseId: number): void {
        this.successMessage.set('');
        this.errorMessage.set('');

        const id = this.clientId();

        if (!id) {
            this.errorMessage.set('Profil client introuvable.');
            return;
        }

        this.groupClassService.cancelParticipation(courseId, id)
            .subscribe({
            next: () => {
                this.successMessage.set('Participation annulée avec succès.');
                this.errorMessage.set('');
                this.loadGroupClasses();
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

    isPastGroupClass(course: any): boolean {
      if (!course.classDate) {
        return false;
      }

      const now = new Date();

      const courseDateTime = new Date(
        `${course.classDate}T${course.endTime || course.startTime || '23:59'}`
      );

      return courseDateTime < now;
    }
}