/**
 * Configuration Supabase (Project Settings > API dans le tableau de bord Supabase).
 *
 * - `url` : l'URL du projet, du type https://abcdefgh.supabase.co
 * - `anonKey` : la clé « anon / publishable ». Elle est publique par conception :
 *   la sécurité repose sur les règles RLS de `supabase/schema.sql`.
 *   Ne mets JAMAIS ici la clé « service_role ».
 */
export const SUPABASE_CONFIG = {
  url: 'https://VOTRE-PROJET.supabase.co',
  anonKey: 'VOTRE_CLE_ANON_PUBLIQUE',
};

export const isSupabaseConfigured =
  !SUPABASE_CONFIG.url.includes('VOTRE-PROJET') && !SUPABASE_CONFIG.anonKey.includes('VOTRE_CLE');
