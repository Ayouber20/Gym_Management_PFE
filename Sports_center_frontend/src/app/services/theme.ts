import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  isDark = signal(true);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadTheme();
  }

  loadTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
      this.isDark.set(false);
    } else {
      this.isDark.set(true);
    }

    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDark.update(value => !value);

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
    this.applyTheme();
  }

  applyTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.isDark()) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }
}