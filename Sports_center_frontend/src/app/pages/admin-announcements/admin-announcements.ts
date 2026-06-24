import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AnnouncementService } from '../../services/announcement';
import { ProfileMenu } from '../../components/profile-menu/profile-menu';

@Component({
  selector: 'app-admin-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileMenu],
  templateUrl: './admin-announcements.html',
  styleUrls: ['./admin-announcements.css']
})
export class AdminAnnouncements {

  announcements = signal<any[]>([]);
  loaded = signal(false);

  title = signal('');
  message = signal('');
  targetAudience = signal('ALL');

  successMessage = signal('');
  errorMessage = signal('');

  constructor(private announcementService: AnnouncementService) {
    afterNextRender(() => {
      this.loadAnnouncements();
    });
  }

  loadAnnouncements(): void {
    this.loaded.set(false);

    this.announcementService.getAllAnnouncements()
      .subscribe({
        next: (data) => {
          this.announcements.set(data);
          this.loaded.set(true);
        },
        error: () => {
          this.errorMessage.set('Erreur lors du chargement des annonces.');
          this.loaded.set(true);
        }
      });
  }

  createAnnouncement(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.title().trim() || !this.message().trim()) {
      this.errorMessage.set('Veuillez saisir le titre et le message.');
      return;
    }

    const announcement = {
      title: this.title(),
      message: this.message(),
      targetAudience: this.targetAudience()
    };

    this.announcementService.createAnnouncement(announcement)
      .subscribe({
        next: () => {
          this.successMessage.set('Annonce publiée avec succès.');
          this.errorMessage.set('');

          this.title.set('');
          this.message.set('');
          this.targetAudience.set('ALL');

          this.loadAnnouncements();
        },
        error: (err) => {
          this.errorMessage.set(
            err?.error?.message ||
            err?.error ||
            'Erreur lors de la publication de l’annonce.'
          );
          this.successMessage.set('');
        }
      });
  }

  disableAnnouncement(id: number): void {
    this.announcementService.disableAnnouncement(id)
      .subscribe({
        next: () => {
          this.successMessage.set('Annonce désactivée avec succès.');
          this.loadAnnouncements();
        },
        error: () => {
          this.errorMessage.set('Erreur lors de la désactivation de l’annonce.');
        }
      });
  }

  getTargetLabel(target: string): string {
    if (target === 'ALL') {
      return 'Clients et coachs';
    }

    if (target === 'CLIENT') {
      return 'Clients uniquement';
    }

    if (target === 'COACH') {
      return 'Coachs uniquement';
    }

    return target;
  }
}