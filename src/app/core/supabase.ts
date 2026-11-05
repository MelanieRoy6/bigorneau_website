import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './supabase.config';

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

/** Message lisible à partir d'une erreur Supabase / réseau. */
export function errorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message;
  }
  return 'Une erreur est survenue. Réessaie dans un instant.';
}
