import { Injectable } from '@angular/core';
import { supabase } from './supabase';
import type {
  Contribution, EventSettings, Meal, PlanningCook, Profile, Registration, RegistrationStatus,
} from './models';

/** Petit utilitaire : lève l'erreur Supabase si elle existe, sinon renvoie les données. */
function unwrap<T>(res: { data: T | null; error: { message: string } | null }, fallback: T): T {
  if (res.error) throw res.error;
  return res.data ?? fallback;
}

@Injectable({ providedIn: 'root' })
export class OrgaData {
  // ---------- Inscrits ----------
  async registrations(): Promise<Registration[]> {
    return unwrap(
      await supabase.from('registrations').select('*').order('created_at', { ascending: true }),
      [] as Registration[],
    );
  }

  async setRegistrationStatus(id: string, status: RegistrationStatus): Promise<void> {
    const { error } = await supabase.from('registrations').update({ status }).eq('id', id);
    if (error) throw error;
  }

  async deleteRegistration(id: string): Promise<void> {
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) throw error;
  }

  /** Comptes de connexion existants (pour savoir qui a déjà un accès). */
  async profiles(): Promise<Profile[]> {
    return unwrap(
      await supabase.from('profiles').select('id, role, registration_id'),
      [] as Profile[],
    );
  }

  // ---------- Réglages ----------
  async settings(): Promise<EventSettings> {
    return unwrap(
      await supabase.from('event_settings').select('*').eq('id', 1).single(),
      { contribution_amount: null, contribution_deadline: null, planning_published: false } as EventSettings,
    );
  }

  async updateSettings(patch: Partial<EventSettings>): Promise<void> {
    const { error } = await supabase.from('event_settings').update(patch).eq('id', 1);
    if (error) throw error;
  }

  // ---------- Cotisations ----------
  async contributions(): Promise<Contribution[]> {
    return unwrap(await supabase.from('contributions').select('*'), [] as Contribution[]);
  }

  async saveContribution(c: Contribution): Promise<void> {
    const { error } = await supabase.from('contributions').upsert(c, { onConflict: 'registration_id' });
    if (error) throw error;
  }

  // ---------- Repas & tirage ----------
  async meals(): Promise<Meal[]> {
    return unwrap(
      await supabase.from('meals').select('*').order('day').order('sort_order').order('label'),
      [] as Meal[],
    );
  }

  async addMeal(m: Omit<Meal, 'id'>): Promise<void> {
    const { error } = await supabase.from('meals').insert(m);
    if (error) throw error;
  }

  async updateMeal(id: string, patch: Partial<Meal>): Promise<void> {
    const { error } = await supabase.from('meals').update(patch).eq('id', id);
    if (error) throw error;
  }

  async deleteMeal(id: string): Promise<void> {
    const { error } = await supabase.from('meals').delete().eq('id', id);
    if (error) throw error;
  }

  async draw(): Promise<void> {
    const { error } = await supabase.rpc('draw_meals');
    if (error) throw error;
  }

  async clearDraw(): Promise<void> {
    const { error } = await supabase.from('meal_assignments').delete().not('meal_id', 'is', null);
    if (error) throw error;
    await this.updateSettings({ planning_published: false });
  }

  async planning(): Promise<PlanningCook[]> {
    return unwrap(await supabase.rpc('planning_cooks'), [] as PlanningCook[]);
  }
}
