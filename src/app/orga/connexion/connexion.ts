import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/auth';
import { isSupabaseConfigured } from '../../core/supabase.config';
import { usePage } from '../../core/page';

@Component({
  selector: 'app-connexion',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './connexion.html',
})
export class Connexion {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly configured = isSupabaseConfigured;
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor() {
    usePage('Connexion — espace orga Bigorneaux Party', { noindex: true });
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    const err = await this.auth.signIn(email, password);
    this.busy.set(false);
    if (err) this.error.set(err);
    else await this.router.navigateByUrl('/orga');
  }
}
