import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coach-group-classes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './coach-group-classes.html',
  styleUrls: ['./coach-group-classes.css']
})
export class CoachGroupClasses {

  searchTerm = signal('');
  selectedActivityFilter = signal('ALL');
  selectedDayFilter = signal('ALL');
  selectedLevelFilter = signal('ALL');

  groupClasses = [
    {
      title: 'Fitness collectif',
      activity: 'GYM',
      day: 'Lundi',
      time: '10:00',
      level: 'Débutant',
      participants: 12
    },
    {
      title: 'Natation débutant',
      activity: 'PISCINE',
      day: 'Mardi',
      time: '14:00',
      level: 'Débutant',
      participants: 8
    },
    {
      title: 'Tennis junior',
      activity: 'TENNIS',
      day: 'Mercredi',
      time: '16:00',
      level: 'Junior',
      participants: 10
    },
    {
      title: 'Cardio training',
      activity: 'GYM',
      day: 'Vendredi',
      time: '18:00',
      level: 'Intermédiaire',
      participants: 15
    }
  ];

  activityFilters: string[] = [
    'ALL',
    'TENNIS',
    'GYM',
    'PISCINE'
  ];

  dayFilters: string[] = [
    'ALL',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche'
  ];

  levelFilters: string[] = [
    'ALL',
    'Débutant',
    'Intermédiaire',
    'Avancé',
    'Junior'
  ];

  filteredGroupClasses(): any[] {
    const search = this.searchTerm().toLowerCase().trim();

    return this.groupClasses.filter(course => {
      const title = course.title.toLowerCase();

      const matchesSearch =
        title.includes(search);

      const matchesActivity =
        this.selectedActivityFilter() === 'ALL' ||
        course.activity === this.selectedActivityFilter();

      const matchesDay =
        this.selectedDayFilter() === 'ALL' ||
        course.day === this.selectedDayFilter();

      const matchesLevel =
        this.selectedLevelFilter() === 'ALL' ||
        course.level === this.selectedLevelFilter();

      return matchesSearch && matchesActivity && matchesDay && matchesLevel;
    });
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedActivityFilter.set('ALL');
    this.selectedDayFilter.set('ALL');
    this.selectedLevelFilter.set('ALL');
  }
}