import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styles: ``,
})
export class Home implements AfterViewInit {
  ngAfterViewInit() {
    const els = Array.from(document.querySelectorAll('.reveal'));
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm || !els.length || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
    if (window.matchMedia('(hover: hover)').matches) {
      document.querySelectorAll('.tilt3d').forEach((el) => {
        el.addEventListener('pointermove', (e) => {
          const pe = e as PointerEvent;
          const r = (el as HTMLElement).getBoundingClientRect();
          (el as HTMLElement).style.setProperty('--ry', ((pe.clientX - r.left) / r.width - 0.5) * 8 + 'deg');
          (el as HTMLElement).style.setProperty('--rx', (-((pe.clientY - r.top) / r.height - 0.5)) * 8 + 'deg');
        });
        el.addEventListener('pointerleave', () => {
          (el as HTMLElement).style.setProperty('--rx', '0deg');
          (el as HTMLElement).style.setProperty('--ry', '0deg');
        });
      });
    }
  }
}
