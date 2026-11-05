import { Injectable, computed, signal } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import { supabase, errorMessage } from './supabase';
import { isSupabaseConfigured } from './supabase.config';
import type { Profile } from './models';

@Injectable({ providedIn: 'root' })
export class Auth {
  readonly user = signal<User | null>(null);
  readonly profile = signal<Profile | null>(null);
  readonly firstName = signal<string | null>(null);

  readonly isAdmin = computed(() => this.profile()?.role === 'admin');
  readonly isSignedIn = computed(() => this.user() !== null && this.profile() !== null);

  private readonly initPromise: Promise<void>;

  constructor() {
    this.initPromise = isSupabaseConfigured ? this.init() : Promise.resolve();
  }

  /** Résolu une fois la session restaurée (utilisé par les guards). */
  ready(): Promise<void> {
    return this.initPromise;
  }

  private async init(): Promise<void> {
    const { data } = await supabase.auth.getSession();
    await this.applySession(data.session?.user ?? null);
    supabase.auth.onAuthStateChange((_event, session) => {
      // Ne pas appeler Supabase directement dans ce callback (risque de blocage).
      setTimeout(() => void this.applySession(session?.user ?? null), 0);
    });
  }

  private async applySession(user: User | null): Promise<void> {
    this.user.set(user);
    if (!user) {
      this.profile.set(null);
      this.firstName.set(null);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('id, role, registration_id, registrations(first_name)')
      .eq('id', user.id)
      .maybeSingle();
    if (!data) {
      this.profile.set(null);
      this.firstName.set(null);
      return;
    }
    this.profile.set({ id: data.id, role: data.role, registration_id: data.registration_id });
    const reg = data.registrations as { first_name: string } | { first_name: string }[] | null;
    const first = Array.isArray(reg) ? reg[0]?.first_name : reg?.first_name;
    this.firstName.set(first ?? null);
  }

  /** Retourne un message d'erreur, ou null si la connexion a réussi. */
  async signIn(email: string, password: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return 'Identifiant ou mot de passe incorrect.';
      await this.applySession(data.user);
      if (!this.profile()) {
        await this.signOut();
        return "Ce compte n'a pas d'accès à l'espace orga.";
      }
      return null;
    } catch (e) {
      return errorMessage(e);
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    this.user.set(null);
    this.profile.set(null);
    this.firstName.set(null);
  }
}
