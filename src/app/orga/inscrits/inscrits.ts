import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { OrgaData } from '../../core/orga-data';
import { errorMessage } from '../../core/supabase';
import { Registration, RegistrationStatus } from '../../core/models';

type Filter = 'all' | 'pending' | 'validated';

@Component({
  selector: 'app-inscrits',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inscrits.html',
})
export class Inscrits {
  private readonly data = inject(OrgaData);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly items = signal<Registration[]>([]);
  private readonly withAccount = signal<Set<string>>(new Set());
  protected readonly query = signal('');
  protected readonly filter = signal<Filter>('all');
  protected readonly busyId = signal<string | null>(null);

  protected readonly stats = computed(() => {
    const all = this.items();
    return {
      total: all.length,
      pending: all.filter((r) => r.status === 'pending').length,
      validated: all.filter((r) => r.status === 'validated').length,
      accounts: all.filter((r) => this.withAccount().has(r.id)).length,
    };
  });

  protected readonly shown = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    return this.items().filter((r) => {
      if (f !== 'all' && r.status !== f) return false;
      if (!q) return true;
      return `${r.first_name} ${r.last_name} ${r.email}`.toLowerCase().includes(q);
    });
  });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const [items, profiles] = await Promise.all([this.data.registrations(), this.data.profiles()]);
      this.items.set(items);
      this.withAccount.set(new Set(profiles.map((p) => p.registration_id).filter((x): x is string => !!x)));
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }

  protected hasAccount(r: Registration): boolean {
    return this.withAccount().has(r.id);
  }

  protected onQuery(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }

  protected async setStatus(r: Registration, status: RegistrationStatus): Promise<void> {
    await this.run(r.id, async () => {
      await this.data.setRegistrationStatus(r.id, status);
      this.items.update((list) => list.map((x) => (x.id === r.id ? { ...x, status } : x)));
    });
  }

  protected async remove(r: Registration): Promise<void> {
    if (!confirm(`Supprimer l'inscription de ${r.first_name} ${r.last_name} ? Cette action est définitive.`)) return;
    await this.run(r.id, async () => {
      await this.data.deleteRegistration(r.id);
      this.items.update((list) => list.filter((x) => x.id !== r.id));
    });
  }

  private async run(id: string, action: () => Promise<void>): Promise<void> {
    this.busyId.set(id);
    this.error.set(null);
    try {
      await action();
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.busyId.set(null);
    }
  }

  protected exportCsv(): void {
    const esc = (v: string | null) => `"${(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Prénom', 'Nom', 'E-mail', 'Téléphone', 'Note', 'Statut'],
      ...this.shown().map((r) => [r.first_name, r.last_name, r.email, r.phone, r.note, r.status]),
    ];
    const csv = '﻿' + rows.map((row) => row.map(esc).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inscrits-bigorneaux-party.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
