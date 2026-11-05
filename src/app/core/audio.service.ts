import { Injectable, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  isPlaying = false;
  private userStopped = false;
  private attempted = false;

  constructor(private ngZone: NgZone) {}

  init() {
    this.audio = document.querySelector<HTMLAudioElement>('#bg-audio');
    if (!this.audio || this.attempted) return;
    this.audio.volume = 0.45;
    this.attempted = true;
    if (!this.userStopped) {
      this.audio.play()
        .then(() => this.ngZone.run(() => { this.isPlaying = true; }))
        .catch(() => {});
    }
  }

  toggle() {
    if (!this.audio) return;
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      this.userStopped = true;
    } else {
      this.audio.play();
      this.isPlaying = true;
      this.userStopped = false;
    }
  }
}
