import { Component, AfterViewInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AudioService } from './core/audio.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  isOrga = false;

  constructor(public audio: AudioService, private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e) => {
      this.isOrga = (e as NavigationEnd).urlAfterRedirects.startsWith('/orga');
    });
  }

  ngAfterViewInit() {
    this.audio.init();
  }
}
