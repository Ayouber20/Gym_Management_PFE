import { Component, afterNextRender, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  appReady = signal(false);

  constructor() {
    afterNextRender(() => {
      this.appReady.set(true);
    });
  }
}