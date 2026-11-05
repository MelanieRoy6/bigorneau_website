-- =====================================================================
-- Bigorneaux Party — espace orga : schéma Supabase
-- À coller dans Supabase > SQL Editor > New query, puis "Run".
-- Rejouable sans risque (create if not exists / create or replace).
-- =====================================================================

-- ---------- Tables ----------------------------------------------------

create table if not exists public.registrations (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null check (char_length(first_name) between 1 and 80),
  last_name   text not null check (char_length(last_name) between 1 and 80),
  email       text not null check (char_length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone       text check (char_length(phone) <= 30),
  diet        text check (char_length(diet) <= 500),
  note        text check (char_length(note) <= 1000),
  status      text not null default 'pending' check (status in ('pending', 'validated', 'refused')),
  created_at  timestamptz not null default now()
);
create unique index if not exists registrations_email_key on public.registrations (lower(email));

-- Un profil par compte de connexion (créé automatiquement, voir trigger plus bas).
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  role             text not null default 'member' check (role in ('admin', 'member')),
  registration_id  uuid references public.registrations (id) on delete set null
);

-- Réglages de l'événement : une seule ligne (id = 1).
create table if not exists public.event_settings (
  id                     int primary key default 1 check (id = 1),
  contribution_amount    numeric(8, 2) check (contribution_amount >= 0),
  contribution_deadline  date,
  planning_published     boolean not null default false
);
insert into public.event_settings (id) values (1) on conflict (id) do nothing;

-- Cotisation : une ligne par inscrit (créée à la demande par l'admin).
create table if not exists public.contributions (
  registration_id  uuid primary key references public.registrations (id) on delete cascade,
  amount_paid      numeric(8, 2) not null default 0 check (amount_paid >= 0),
  paid_at          date,
  method           text check (method in ('virement', 'especes', 'cheque', 'autre')),
  note             text check (char_length(note) <= 300)
);

create table if not exists public.meals (
  id            uuid primary key default gen_random_uuid(),
  label         text not null check (char_length(label) between 1 and 80),
  day           date not null,
  time_label    text check (char_length(time_label) <= 40),
  sort_order    int not null default 0,
  cooks_needed  int not null default 2 check (cooks_needed between 1 and 30)
);

create table if not exists public.meal_assignments (
  meal_id          uuid not null references public.meals (id) on delete cascade,
  registration_id  uuid not null references public.registrations (id) on delete cascade,
  primary key (meal_id, registration_id)
);

-- ---------- Fonctions utilitaires -------------------------------------

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_registration_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select registration_id from public.profiles where id = auth.uid();
$$;

create or replace function public.has_account()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

-- À la création d'un compte (Authentication > Users), on crée le profil
-- et on le rattache à l'inscription ayant la même adresse e-mail.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, registration_id)
  values (
    new.id,
    (select r.id from public.registrations r where lower(r.email) = lower(new.email) limit 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Tirage au sort --------------------------------------------
-- Répartit les cuisiniers entre les repas parmi les inscrits validés.
-- Équilibré : on pioche toujours parmi ceux qui ont le moins de repas
-- (au hasard en cas d'égalité) → personne ne passe deux fois avant que
-- tout le monde soit passé une fois.
-- Le planning repasse en « non publié » : l'admin le republie après relecture.

create or replace function public.draw_meals()
returns void
language plpgsql security definer set search_path = public
as $$
declare
  m record;
begin
  if not public.is_admin() then
    raise exception 'Réservé aux administrateurs' using errcode = '42501';
  end if;

  delete from public.meal_assignments where true;

  create temporary table _cnt on commit drop as
    select r.id as registration_id, 0 as n
    from public.registrations r
    where r.status = 'validated';

  for m in select * from public.meals order by day, sort_order, label loop
    insert into public.meal_assignments (meal_id, registration_id)
      select m.id, c.registration_id
      from _cnt c
      order by c.n, random()
      limit m.cooks_needed;

    update _cnt set n = n + 1
      where registration_id in (select registration_id from public.meal_assignments where meal_id = m.id);
  end loop;

  update public.event_settings set planning_published = false where id = 1;
end;
$$;

-- ---------- Planning visible par les participants ---------------------
-- Renvoie qui cuisine quoi, avec le prénom seulement (+ initiale du nom
-- en cas d'homonyme). Visible une fois le planning publié (ou par l'admin).

create or replace function public.planning_cooks()
returns table (meal_id uuid, registration_id uuid, display_name text, is_me boolean)
language sql stable security definer set search_path = public
as $$
  select
    a.meal_id,
    a.registration_id,
    r.first_name || case
      when exists (
        select 1 from public.registrations o
        where o.id <> r.id and o.status = 'validated' and lower(o.first_name) = lower(r.first_name)
      ) then ' ' || left(r.last_name, 1) || '.'
      else ''
    end,
    a.registration_id is not distinct from public.my_registration_id()
  from public.meal_assignments a
  join public.registrations r on r.id = a.registration_id
  where public.has_account()
    and (public.is_admin() or (select planning_published from public.event_settings where id = 1));
$$;

-- ---------- Sécurité (RLS) --------------------------------------------

alter table public.registrations     enable row level security;
alter table public.profiles          enable row level security;
alter table public.event_settings    enable row level security;
alter table public.contributions     enable row level security;
alter table public.meals             enable row level security;
alter table public.meal_assignments  enable row level security;

-- On repart de zéro côté droits, puis on accorde le strict nécessaire.
revoke all on public.registrations, public.profiles, public.event_settings,
              public.contributions, public.meals, public.meal_assignments
  from anon, authenticated;

grant insert on public.registrations to anon, authenticated;       -- formulaire public
grant select, update, delete on public.registrations to authenticated;
grant select on public.profiles to authenticated;
grant select, update on public.event_settings to authenticated;
grant select, insert, update, delete on public.contributions to authenticated;
grant select, insert, update, delete on public.meals to authenticated;
grant select, delete on public.meal_assignments to authenticated;

revoke all on function public.draw_meals(), public.planning_cooks(),
                       public.is_admin(), public.my_registration_id(), public.has_account()
  from public, anon;
grant execute on function public.draw_meals(), public.planning_cooks(),
                          public.is_admin(), public.my_registration_id(), public.has_account()
  to authenticated;

-- registrations
drop policy if exists "inscription publique" on public.registrations;
create policy "inscription publique" on public.registrations
  for insert to anon, authenticated
  with check (status = 'pending');

drop policy if exists "admin gère les inscrits" on public.registrations;
create policy "admin gère les inscrits" on public.registrations
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "membre voit sa fiche" on public.registrations;
create policy "membre voit sa fiche" on public.registrations
  for select to authenticated
  using (id = public.my_registration_id());

-- profiles
drop policy if exists "profil perso" on public.profiles;
create policy "profil perso" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- event_settings
drop policy if exists "réglages lisibles" on public.event_settings;
create policy "réglages lisibles" on public.event_settings
  for select to authenticated using (public.has_account());

drop policy if exists "admin règle l'événement" on public.event_settings;
create policy "admin règle l'événement" on public.event_settings
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- contributions
drop policy if exists "admin gère les cotisations" on public.contributions;
create policy "admin gère les cotisations" on public.contributions
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "membre voit sa cotisation" on public.contributions;
create policy "membre voit sa cotisation" on public.contributions
  for select to authenticated
  using (registration_id = public.my_registration_id());

-- meals
drop policy if exists "repas lisibles" on public.meals;
create policy "repas lisibles" on public.meals
  for select to authenticated using (public.has_account());

drop policy if exists "admin gère les repas" on public.meals;
create policy "admin gère les repas" on public.meals
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- meal_assignments (les participants passent par planning_cooks())
drop policy if exists "admin voit le tirage" on public.meal_assignments;
create policy "admin voit le tirage" on public.meal_assignments
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Repas par défaut (modifiables dans l'appli) ---------------

insert into public.meals (label, day, time_label, sort_order, cooks_needed)
select * from (values
  ('Vendredi soir',  date '2027-06-04', 'Dîner',      1, 3),
  ('Samedi midi',    date '2027-06-05', 'Déjeuner',   1, 4),
  ('Apéro',          date '2027-06-05', 'Apéritif',   2, 4),
  ('Samedi soir',    date '2027-06-05', 'Dîner',      3, 6),
  ('Dimanche midi',  date '2027-06-06', 'Déjeuner',   1, 4)
) as v(label, day, time_label, sort_order, cooks_needed)
where not exists (select 1 from public.meals);
