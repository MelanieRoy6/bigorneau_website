import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { supabase } from '../../core/supabase';
import { isSupabaseConfigured } from '../../core/supabase.config';
import { usePage } from '../../core/page';

@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inscription.html',
})
export class Inscription {
  protected readonly configured = isSupabaseConfigured;
  protected readonly busy = signal(false);
  protected readonly done = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    first_name: ['', [Validators.required, Validators.maxLength(80)]],
    last_name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    phone: ['', [Validators.maxLength(30)]],
    diet: ['', [Validators.maxLength(500)]],
    note: ['', [Validators.maxLength(1000)]],
    website: [''], // champ piège anti-robots : doit rester vide
  });

  constructor() {
    usePage("Inscription — Bigorneaux Party 5ème édition", {
      description: "Inscris-toi à la 5ème édition de la Bigorneaux Party, les 4, 5 et 6 juin 2027.",
    });
  }

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (v.website) {
      this.done.set(true); // robot : on fait semblant sans rien enregistrer
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    const { error } = await supabase.from('registrations').insert({
      first_name: v.first_name.trim(),
      last_name: v.last_name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim() || null,
      diet: v.diet.trim() || null,
      note: v.note.trim() || null,
    });
    this.busy.set(false);
    if (!error) {
      this.done.set(true);
    } else if (error.code === '23505') {
      this.error.set('Cette adresse e-mail est déjà inscrite. Écris-nous si tu veux modifier ton inscription.');
    } else {
      this.error.set("L'inscription n'a pas pu être envoyée. Réessaie dans un instant.");
    }
  }
}
