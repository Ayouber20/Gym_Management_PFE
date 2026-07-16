import { Component, afterNextRender, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme';
import { ProfileMenu } from './components/profile-menu/profile-menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProfileMenu],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  appReady = signal(false);

  constructor(private themeService: ThemeService) {
    afterNextRender(() => {
      this.appReady.set(true);
      this.themeService.loadTheme();
    });
  }
  
}