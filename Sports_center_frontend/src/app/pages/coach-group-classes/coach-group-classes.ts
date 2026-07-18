import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth';
import { CoachService } from '../../services/coach';
import { GroupClassService } from '../../services/group-class';

@Component({
  selector: 'app-coach-group-classes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './coach-group-classes.html',
  styleUrls: ['./coach-group-classes.css']
})
export class CoachGroupClasses {

  groupClasses = signal<any[]>([]);
  loaded = signal(false);

  coachId = signal<number | null>(null);

  successMessage = signal('');
  errorMessage = signal('');

  title = signal('');
  activity = signal('');
  classDate = signal('');
  startTime = signal('');
  endTime = signal('');
  maxParticipants = signal<number | null>(null);
  description = signal('');

  searchTerm = signal('');
  selectedActivityFilter = signal('ALL');
  selectedDateFilter = signal('');

  tomorrow = this.getTomorrowDate();

  activityFilters: string[] = [
    'ALL',
    'TENNIS',
    'GYM',
    'PISCINE'
  ];

  activities: string[] = [
    'TENNIS',
    'GYM',
    'PISCINE'
  ];

  constructor(
    private authService: AuthService,
    private coachService: CoachService,
    private groupClassService: GroupClassService
  ) {
    afterNextRender(() => {
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
          this.loadGroupClasses();
        },
        error: () => {
          this.errorMessage.set('Profil coach introuvable.');
          this.loaded.set(true);
        }
      });
  }

  loadGroupClasses(): void {
    const id = this.coachId();

    if (!id) {
      return;
    }

    this.groupClassService.getCoachGroupClasses(id)
      .subscribe({
        next: (data) => {
          this.groupClasses.set(data);
          this.loaded.set(true);
        },
        error: () => {
          this.errorMessage.set('Erreur lors du chargement des cours collectifs.');
          this.loaded.set(true);
        }
      });
  }

  createGroupClass(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    const id = this.coachId();

    if (!id) {
      this.errorMessage.set('Profil coach introuvable.');
      return;
    }

    if (
      !this.title() ||
      !this.activity() ||
      !this.classDate() ||
      !this.startTime() ||
      !this.endTime() ||
      !this.maxParticipants()
    ) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const groupClass = {
      title: this.title(),
      activity: this.activity(),
      classDate: this.classDate(),
      startTime: this.startTime(),
      endTime: this.endTime(),
      maxParticipants: this.maxParticipants(),
      description: this.description(),
      coach: {
        id: id
      }
    };

    this.groupClassService.createGroupClass(groupClass)
      .subscribe({
        next: () => {
          this.successMessage.set('Cours collectif publié avec succès.');
          this.errorMessage.set('');

          this.resetForm();
          this.loadGroupClasses();
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors de la publication du cours collectif.'
          );
          this.successMessage.set('');
        }
      });
  }

  filteredGroupClasses(): any[] {
    const search = this.searchTerm().toLowerCase().trim();

    return this.groupClasses().filter(course => {
      const title = (course.title || '').toLowerCase();
      const description = (course.description || '').toLowerCase();

      const matchesSearch =
        title.includes(search) ||
        description.includes(search);

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

  resetForm(): void {
    this.title.set('');
    this.activity.set('');
    this.classDate.set('');
    this.startTime.set('');
    this.endTime.set('');
    this.maxParticipants.set(null);
    this.description.set('');
  }

  formatTime(time: string): string {
    if (!time) {
      return '';
    }

    return time.slice(0, 5);
  }

  getTomorrowDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }

  getCourseStatus(course: any): string {
    if (this.isPastGroupClass(course)) {
      return 'COMPLETED';
    }

    return course.status || 'ACTIVE';
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