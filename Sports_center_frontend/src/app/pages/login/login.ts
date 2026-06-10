import { Component, afterNextRender } from '@angular/core';
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

  email = '';
  password = '';

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

    if (!this.email || !this.password) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    this.authService.login(this.email, this.password)
      .subscribe({
        next: (user) => {
          this.authService.saveUser(user);
          this.redirectByRole(user.role);
        },
        error: () => {
          alert('Email ou mot de passe incorrect.');
        }
      });
  }

  redirectByRole(role: string): void {
    if (role === 'CLIENT') {
      this.router.navigate(['/client']);
    } else if (role === 'COACH') {
      this.router.navigate(['/coach']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else {
      alert('Rôle inconnu.');
    }
  }
}