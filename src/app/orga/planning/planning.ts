import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Auth } from '../../core/auth';
import { OrgaData } from '../../core/orga-data';
import { errorMessage } from '../../core/supabase';
import { EventSettings, Meal, PlanningCook, formatDay } from '../../core/models';

interface Day { iso: string; label: string; meals: { meal: Meal; cooks: PlanningCook[]; mine: boolean }[] }

@Component({
  selector: 'app-planning',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './planning.html',
})
export class Planning {
  protected readonly auth = inject(Auth);
  private readonly data = inject(OrgaData);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  private readonly meals = signal<Meal[]>([]);
  private readonly cooks = signal<PlanningCook[]>([]);
  protected readonly settings = signal<EventSettings | null>(null);

  /** Les participants ne voient rien tant que le planning n'est pas publié. */
  protected readonly visible = computed(() => this.auth.isAdmin() || this.settings()?.planning_published === true);

  protected readonly days = computed<Day[]>(() => {
    const cooks = this.cooks();
    const byDay = new Map<string, Day>();
    for (const meal of this.meals()) {
      const day = byDay.get(meal.day) ?? { iso: meal.day, label: formatDay(meal.day), meals: [] };
      const mealCooks = cooks.filter((c) => c.meal_id === meal.id);
      day.meals.push({ meal, cooks: mealCooks, mine: mealCooks.some((c) => c.is_me) });
      byDay.set(meal.day, day);
    }
    return [...byDay.values()];
  });

  protected readonly mine = computed(() => this.days().flatMap((d) => d.meals.filter((m) => m.mine)));

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const [meals, settings] = await Promise.all([this.data.meals(), this.data.settings()]);
      this.meals.set(meals);
      this.settings.set(settings);
      if (this.auth.isAdmin() || settings.planning_published) this.cooks.set(await this.data.planning());
    } catch (e) {
      this.error.set(errorMessage(e));
    } finally {
      this.loading.set(false);
    }
  }

  protected mineLabel(): string {
    return this.mine()
      .map((m) => {
        const others = m.cooks.filter((c) => !c.is_me).map((c) => c.display_name);
        return m.meal.label + (others.length ? ' · avec ' + others.join(', ') : '');
      })
      .join(' — ');
  }
}
