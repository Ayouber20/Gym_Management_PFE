import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      email,
      password
    });
  }

  saveAuthData(response: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
    }
  }

  getUser(): any {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }

    return null;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }

    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null && this.getToken() !== null;
  }
}