import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-coach-group-classes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './coach-group-classes.html',
  styleUrls: ['./coach-group-classes.css']
})
export class CoachGroupClasses {

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
}