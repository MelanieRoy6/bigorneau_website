import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-histoire',
  imports: [RouterLink],
  templateUrl: './histoire.html',
})
export class Histoire implements AfterViewInit, OnDestroy {
  private io?: IntersectionObserver;

  constructor(private titleSvc: Title, private metaSvc: Meta) {
    this.titleSvc.setTitle('Notre histoire — Bigorneaux Party');
    this.metaSvc.updateTag({ name: 'description', content: "L'éclipse de la palourde albinos, le pastis de 2023, la courte paille, le trophée BWCP et le mime de bigorneau : la légende de la Bigorneaux Party." });
  }

  ngAfterViewInit() {
    const els = Array.from(document.querySelectorAll('.reveal'));
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm || !els.length || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js');
    this.io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); this.io?.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => this.io!.observe(el));
  }

  ngOnDestroy() {
    this.io?.disconnect();
  }
}
