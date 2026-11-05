import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrgaData } from '../../core/orga-data';
import { errorMessage } from '../../core/supabase';
import { Registration, RegistrationStatus } from '../../core/models';

type Filter = 'all' | 'pending' | 'validated';

@Component({
  selector: 'app-inscrits',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
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

  protected readonly showAdd = signal(false);
  protected readonly addBusy = signal(false);
  protected readonly addError = signal<string | null>(null);
  protected readonly addForm = inject(FormBuilder).nonNullable.group({
    first_name: ['', [Validators.required, Validators.maxLength(80)]],
    last_name:  ['', [Validators.required, Validators.maxLength(80)]],
    email:      ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    phone:      ['', [Validators.maxLength(30)]],
    note:       ['', [Validators.maxLength(1000)]],
  });

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

  protected toggleAdd(): void {
    this.showAdd.update((v) => !v);
    this.addError.set(null);
    this.addForm.reset();
  }

  protected async submitAdd(): Promise<void> {
    if (this.addBusy()) return;
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    const v = this.addForm.getRawValue();
    this.addBusy.set(true);
    this.addError.set(null);
    try {
      const created = await this.data.addRegistration({
        first_name: v.first_name.trim(),
        last_name:  v.last_name.trim(),
        email:      v.email.trim(),
        phone:      v.phone.trim() || null,
        note:       v.note.trim() || null,
      });
      this.items.update((list) => [...list, created]);
      this.showAdd.set(false);
      this.addForm.reset();
    } catch (e: unknown) {
      const msg = errorMessage(e);
      this.addError.set(msg.includes('23505') ? 'Cette adresse e-mail est déjà inscrite.' : msg);
    } finally {
      this.addBusy.set(false);
    }
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
