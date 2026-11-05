import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrgaData } from '../../core/orga-data';
import { errorMessage } from '../../core/supabase';
import { EventSettings, Meal, PlanningCook, formatDay } from '../../core/models';

@Component({
  selector: 'app-tirage',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tirage.html',
})
export class Tirage {
  private readonly data = inject(OrgaData);

  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly info = signal<string | null>(null);
  protected readonly meals = signal<Meal[]>([]);
  protected readonly cooks = signal<PlanningCook[]>([]);
  protected readonly settings = signal<EventSettings | null>(null);
  protected readonly participants = signal(0);

  protected readonly slots = computed(() => this.meals().reduce((n, m) => n + m.cooks_needed, 0));
  protected readonly hasDraw = computed(() => this.cooks().length > 0);

  protected readonly balance = computed(() => {
    const slots = this.slots();
    const people = this.participants();
    if (people === 0) return { kind: 'warn', text: "Aucun participant validé pour l'instant : valide des inscrits avant de tirer au sort." };
    if (slots < people) {
      return { kind: 'warn', text: `${people - slots} participant(s) ne cuisineront pas : ajoute des places ou un repas pour que chacun mette la main à la patte.` };
    }
    if (slots === people) return { kind: 'ok', text: 'Tout le monde passe exactement une fois.' };
    return { kind: 'ok', text: `${slots - people} place(s) en plus : certains passeront plusieurs fois (tirés au hasard, équitablement).` };
  });

  protected readonly results = computed(() => {
    const cooks = this.cooks();
    return this.meals().map((m) => ({
      meal: m,
      day: formatDay(m.day),
      cooks: cooks.filter((c) => c.meal_id === m.id),
    }));
  });

  protected readonly newMeal = inject(FormBuilder).nonNullable.group({
    label: ['', [Validators.required, Validators.maxLength(80)]],
    day: ['2027-06-05', [Validators.required]],
    time_label: [''],
    cooks_needed: [2, [Validators.required, Validators.min(1), Validators.max(30)]],
  });

  constructor() {
    void this.load();
  }

  protected dayLabel(iso: string): string {
    return formatDay(iso);
  }

  private async load(): Promise<void> {
    try {
      const [meals, settings, regs, cooks] = await Promise.all([
        this.data.meals(), this.data.settings(), this.data.registrations(), this.data.planning(),
      ]);
      this.meals.set(meals);
      this.settings.set(settings);
      this.participants.set(regs.filter((r) => r.status === 'validated').length);
      this.cooks.set(cooks);
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

  private async reload(): Promise<void> {
    const [meals, settings, cooks] = await Promise.all([this.data.meals(), this.data.settings(), this.data.planning()]);
    this.meals.set(meals);
    this.settings.set(settings);
    this.cooks.set(cooks);
  }

  protected async step(m: Meal, delta: number): Promise<void> {
    const next = Math.min(30, Math.max(1, m.cooks_needed + delta));
    if (next === m.cooks_needed) return;
    await this.run(async () => {
      await this.data.updateMeal(m.id, { cooks_needed: next });
      this.meals.update((l) => l.map((x) => (x.id === m.id ? { ...x, cooks_needed: next } : x)));
    });
  }

  protected async removeMeal(m: Meal): Promise<void> {
    if (!confirm(`Supprimer le repas « ${m.label} » ?`)) return;
    await this.run(async () => {
      await this.data.deleteMeal(m.id);
      await this.reload();
    });
  }

  protected async addMeal(): Promise<void> {
    if (this.newMeal.invalid) {
      this.newMeal.markAllAsTouched();
      return;
    }
    const v = this.newMeal.getRawValue();
    const sort = Math.max(0, ...this.meals().filter((m) => m.day === v.day).map((m) => m.sort_order)) + 1;
    await this.run(async () => {
      await this.data.addMeal({
        label: v.label.trim(), day: v.day, time_label: v.time_label.trim() || null,
        sort_order: sort, cooks_needed: v.cooks_needed,
      });
      this.newMeal.patchValue({ label: '', time_label: '' });
      await this.reload();
    });
  }

  protected async draw(): Promise<void> {
    if (this.hasDraw() && !confirm('Un tirage existe déjà : le relancer remplace le planning actuel. Continuer ?')) return;
    await this.run(async () => {
      await this.data.draw();
      await this.reload();
    }, 'Tirage effectué. Relis le résultat puis publie le planning.');
  }

  protected async clear(): Promise<void> {
    if (!confirm('Effacer le tirage ? Le planning redeviendra vide.')) return;
    await this.run(async () => {
      await this.data.clearDraw();
      await this.reload();
    }, 'Tirage effacé.');
  }

  protected async setPublished(published: boolean): Promise<void> {
    await this.run(async () => {
      await this.data.updateSettings({ planning_published: published });
      await this.reload();
    }, published ? 'Planning publié : les participants le voient.' : 'Planning masqué aux participants.');
  }
}
