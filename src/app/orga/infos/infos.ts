import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { OrgaData } from '../../core/orga-data';
import { errorMessage } from '../../core/supabase';
import { EventSettings, money } from '../../core/models';
import { usePage } from '../../core/page';

@Component({
  selector: 'app-infos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './infos.html',
})
export class Infos {
  private readonly data = inject(OrgaData);
  protected readonly money = money;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly settings = signal<EventSettings | null>(null);

  constructor() {
    usePage('Infos pratiques — Espace orga', { noindex: true });
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.settings.set(await this.data.settings());
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }
}
