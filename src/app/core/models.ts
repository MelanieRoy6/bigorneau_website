export type RegistrationStatus = 'pending' | 'validated' | 'refused';
export type Role = 'admin' | 'member' | 'user';
export type SleepingPref = 'camion' | 'tente' | 'maison';
export type PayMethod = 'virement' | 'especes' | 'cheque' | 'autre';

export interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  diet: string | null;
  note: string | null;
  status: RegistrationStatus;
  sleeping_pref: SleepingPref | null;
  bring_alcohol: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  role: Role;
  registration_id: string | null;
}

export interface EventSettings {
  contribution_amount: number | null;
  contribution_deadline: string | null;
  planning_published: boolean;
}

export interface Contribution {
  registration_id: string;
  amount_paid: number;
  paid_at: string | null;
  method: PayMethod | null;
  note: string | null;
}

export interface Meal {
  id: string;
  label: string;
  day: string; // YYYY-MM-DD
  time_label: string | null;
  sort_order: number;
  cooks_needed: number;
}

export interface PlanningCook {
  meal_id: string;
  registration_id: string;
  display_name: string;
  is_me: boolean;
}

export type PayStatus = 'paid' | 'partial' | 'pending';

export function payStatus(paid: number, due: number | null): PayStatus {
  if (paid <= 0) return 'pending';
  if (due !== null && paid >= due) return 'paid';
  // Montant dû non défini : tout versement est considéré comme réglé.
  return due === null ? 'paid' : 'partial';
}

const dayFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
export function formatDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const s = dayFmt.format(new Date(Date.UTC(y, m - 1, d, 12)));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const shortFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
export function formatShort(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return shortFmt.format(new Date(Date.UTC(y, m - 1, d, 12)));
}

export function money(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}
