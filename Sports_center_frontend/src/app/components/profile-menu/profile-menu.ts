import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile-menu.html',
  styleUrls: ['./profile-menu.css']
})
export class ProfileMenu {

  menuOpen = signal(false);
  passwordModalOpen = signal(false);

  oldPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  successMessage = signal('');
  errorMessage = signal('');

  user: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getUser();
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  openPasswordModal(): void {
    this.passwordModalOpen.set(true);
    this.menuOpen.set(false);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  closePasswordModal(): void {
    this.passwordModalOpen.set(false);
    this.oldPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  changePassword(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.user) {
      this.errorMessage.set('Utilisateur introuvable.');
      return;
    }

    if (!this.oldPassword() || !this.newPassword() || !this.confirmPassword()) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    if (this.newPassword().length < 6) {
      this.errorMessage.set('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    const request = {
      userId: this.user.id,
      oldPassword: this.oldPassword(),
      newPassword: this.newPassword()
    };

    this.authService.changePassword(request)
      .subscribe({
        next: () => {
            this.successMessage.set('Mot de passe modifié avec succès.');
            this.oldPassword.set('');
            this.newPassword.set('');
            this.confirmPassword.set('');

            setTimeout(() => {
                this.closePasswordModal();
            }, 800);
            },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ||
            error?.error ||
            'Erreur lors du changement du mot de passe.'
          );
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getFullName(): string {
    if (!this.user) {
      return 'Utilisateur';
    }

    return `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
  }

  getEmail(): string {
    return this.user?.email || '';
  }

  getRole(): string {
    return this.user?.role || '';
  }

  getInitials(): string {
    const firstName = this.user?.firstName || '';
    const lastName = this.user?.lastName || '';

    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    return firstInitial + lastInitial || 'U';
  }
}