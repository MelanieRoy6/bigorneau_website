import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrgaData } from '../../core/orga-data';
import { errorMessage } from '../../core/supabase';
import {
  Contribution, EventSettings, PayMethod, PayStatus, Registration, formatShort, money, payStatus,
} from '../../core/models';

type Filter = 'all' | PayStatus;

@Component({
  selector: 'app-cotisations',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cotisations.html',
})
export class Cotisations {
  private readonly data = inject(OrgaData);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly info = signal<string | null>(null);
  protected readonly filter = signal<Filter>('all');
  protected readonly editing = signal<string | null>(null);

  private readonly people = signal<Registration[]>([]);
  private readonly contribs = signal<Map<string, Contribution>>(new Map());
  protected readonly settings = signal<EventSettings>({ contribution_amount: null, contribution_deadline: null, planning_published: false });

  protected readonly money = money;
  protected readonly formatShort = formatShort;
  protected readonly methods: { value: PayMethod; label: string }[] = [
    { value: 'virement', label: 'Virement' },
    { value: 'especes', label: 'Espèces' },
    { value: 'cheque', label: 'Chèque' },
    { value: 'autre', label: 'Autre' },
  ];

  protected readonly settingsForm = this.fb.group({
    amount: this.fb.control<number | null>(null, [Validators.min(0)]),
    deadline: this.fb.control<string | null>(null),
  });

  protected readonly editForm = this.fb.group({
    amount_paid: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    paid_at: this.fb.control<string | null>(null),
    method: this.fb.control<PayMethod | null>(null),
  });

  protected readonly rows = computed(() =>
    this.people()
      .filter((r) => r.status === 'validated')
      .map((r) => {
        const c = this.contribs().get(r.id);
        const paid = c?.amount_paid ?? 0;
        return {
          reg: r, paid, paidAt: c?.paid_at ?? null, method: c?.method ?? null,
          status: payStatus(paid, this.settings().contribution_amount),
        };
      }),
  );

  protected readonly counts = computed(() => {
    const rows = this.rows();
    return {
      total: rows.length,
      paid: rows.filter((r) => r.status === 'paid').length,
      partial: rows.filter((r) => r.status === 'partial').length,
      pending: rows.filter((r) => r.status === 'pending').length,
      collected: rows.reduce((n, r) => n + r.paid, 0),
    };
  });

  protected readonly percent = computed(() => {
    const c = this.counts();
    return c.total ? Math.round((c.paid / c.total) * 100) : 0;
  });

  protected readonly shown = computed(() => {
    const f = this.filter();
    return this.rows().filter((r) => f === 'all' || r.status === f);
  });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const [people, contribs, settings] = await Promise.all([
        this.data.registrations(), this.data.contributions(), this.data.settings(),
      ]);
      this.people.set(people);
      this.contribs.set(new Map(contribs.map((c) => [c.registration_id, c])));
      this.settings.set(settings);
      this.settingsForm.setValue({ amount: settings.contribution_amount, deadline: settings.contribution_deadline });
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }

  private async run(action: () => Promise<void>, ok?: string): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    this.info.set(null);
    try {
      await action();
      if (ok) this.info.set(ok);
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.busy.set(false);
    }
  }

  protected async saveSettings(): Promise<void> {
    if (this.settingsForm.invalid) return;
    const { amount, deadline } = this.settingsForm.getRawValue();
    const patch = { contribution_amount: amount === null || amount === undefined ? null : Number(amount), contribution_deadline: deadline || null };
    await this.run(async () => {
      await this.data.updateSettings(patch);
      this.settings.update((s) => ({ ...s, ...patch }));
    }, 'Réglages enregistrés.');
  }

  private async save(c: Contribution): Promise<void> {
    await this.run(async () => {
      await this.data.saveContribution(c);
      this.contribs.update((m) => new Map(m).set(c.registration_id, c));
      this.editing.set(null);
    });
  }

  protected async markPaid(id: string): Promise<void> {
    const amount = this.settings().contribution_amount;
    if (amount === null) {
      this.error.set("Renseigne d'abord le montant de la cotisation ci-dessus, ou utilise « Modifier ».");
      return;
    }
    const prev = this.contribs().get(id);
    await this.save({
      registration_id: id, amount_paid: amount,
      paid_at: new Date().toISOString().slice(0, 10), method: prev?.method ?? null, note: prev?.note ?? null,
    });
  }

  protected startEdit(row: { reg: Registration; paid: number; paidAt: string | null; method: PayMethod | null }): void {
    this.editing.set(row.reg.id);
    this.editForm.setValue({ amount_paid: row.paid, paid_at: row.paidAt, method: row.method });
  }

  protected async submitEdit(id: string): Promise<void> {
    if (this.editForm.invalid) return;
    const v = this.editForm.getRawValue();
    const prev = this.contribs().get(id);
    await this.save({
      registration_id: id, amount_paid: Number(v.amount_paid), paid_at: v.paid_at || null,
      method: v.method || null, note: prev?.note ?? null,
    });
  }
}
