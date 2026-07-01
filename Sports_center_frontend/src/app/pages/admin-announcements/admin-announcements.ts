import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AnnouncementService } from '../../services/announcement';

@Component({
  selector: 'app-admin-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
    this.errorMessage.set('');

    this.announcementService.getAllAnnouncements()
      .subscribe({
        next: (data) => {
          const sortedAnnouncements = data.sort((a, b) => {
            if (a.active && !b.active) {
              return -1;
            }

            if (!a.active && b.active) {
              return 1;
            }

            const dateA = a.createdAt || '';
            const dateB = b.createdAt || '';

            return dateB.localeCompare(dateA);
          });

          this.announcements.set(sortedAnnouncements);
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
      title: this.title().trim(),
      message: this.message().trim(),
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
          this.errorMessage.set(this.getBackendErrorMessage(err) || 'Erreur lors de la publication de l’annonce.');
          this.successMessage.set('');
        }
      });
  }

  disableAnnouncement(id: number): void {
    if (!confirm('Voulez-vous désactiver cette annonce ?')) {
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.announcementService.disableAnnouncement(id)
      .subscribe({
        next: () => {
          this.successMessage.set('Annonce désactivée avec succès.');
          this.errorMessage.set('');
          this.loadAnnouncements();
        },
        error: (err) => {
          this.errorMessage.set(this.getBackendErrorMessage(err) || 'Erreur lors de la désactivation de l’annonce.');
          this.successMessage.set('');
        }
      });
  }

  deleteAnnouncement(id: number): void {
    if (!confirm('Voulez-vous supprimer définitivement cette annonce ?')) {
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.announcementService.deleteAnnouncement(id)
      .subscribe({
        next: () => {
          this.announcements.update(announcements =>
            announcements.filter(announcement => announcement.id !== id)
          );

          this.successMessage.set('Annonce supprimée avec succès.');
          this.errorMessage.set('');
        },
        error: (err) => {
          this.errorMessage.set(this.getBackendErrorMessage(err) || 'Erreur lors de la suppression de l’annonce.');
          this.successMessage.set('');
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

  private getBackendErrorMessage(err: any): string {
    if (typeof err?.error === 'string') {
      return err.error;
    }

    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.message) {
      return err.message;
    }

    return '';
  }

  activateAnnouncement(id: number): void {
    if (!confirm('Voulez-vous réactiver cette annonce ?')) {
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');

    this.announcementService.activateAnnouncement(id)
      .subscribe({
        next: () => {
          this.successMessage.set('Annonce réactivée avec succès.');
          this.errorMessage.set('');
          this.loadAnnouncements();
        },
        error: (err) => {
          this.errorMessage.set(this.getBackendErrorMessage(err) || 'Erreur lors de la réactivation de l’annonce.');
          this.successMessage.set('');
        }
      });
  }
}