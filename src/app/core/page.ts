import { DestroyRef, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

/** Définit le titre de la page ; `noindex` masque la page aux moteurs de recherche (restauré à la sortie). */
export function usePage(title: string, options: { noindex?: boolean; description?: string } = {}): void {
  const titleSvc = inject(Title);
  const meta = inject(Meta);
  titleSvc.setTitle(title);
  if (options.description) meta.updateTag({ name: 'description', content: options.description });
  if (options.noindex) {
    meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    inject(DestroyRef).onDestroy(() => meta.updateTag({ name: 'robots', content: 'index, follow' }));
  }
}
