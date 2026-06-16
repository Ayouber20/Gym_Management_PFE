import { Component, afterNextRender, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  email = signal('');
  password = signal('');

  errorMessage = signal('');
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    afterNextRender(() => {
      const user = this.authService.getUser();

      if (user) {
        this.redirectByRole(user.role);
      }
    });
  }

  login(): void {
    this.errorMessage.set('');

    if (!this.email() || !this.password()) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    this.loading.set(true);

    this.authService.login(this.email(), this.password())
      .subscribe({
        next: (response) => {
          this.authService.saveAuthData(response);

          const user = response.user;

          this.loading.set(false);
          this.redirectByRole(user.role);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Email ou mot de passe incorrect.');
        }
      });
  }

  redirectByRole(role: string): void {
    if (role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (role === 'CLIENT') {
      this.router.navigate(['/client']);
    } else if (role === 'COACH') {
      this.router.navigate(['/coach']);
    } else {
      this.errorMessage.set('Rôle utilisateur inconnu.');
      this.authService.logout();
    }
  }
}