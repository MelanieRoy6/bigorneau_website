# Espace orga — mise en route

Facette privée du site pour l'organisation du week-end : inscrits, tirage au sort des repas, planning, suivi des cotisations. Front Angular (Vercel) + base et comptes **Supabase**.

Maquettes : dans le Design « Bigorneaux Party — Espace orga ».

## Ce qu'il y a

| Page | Qui | Rôle |
|---|---|---|
| `/inscription` | public | formulaire d'inscription (arrive en « en attente ») |
| `/orga/connexion` | public | connexion e-mail + mot de passe |
| `/orga` | participants + admin | planning des repas, « tes repas » en évidence |
| `/orga/inscrits` | admin | liste, validation / refus, export CSV |
| `/orga/tirage` | admin | repas, nombre de cuisiniers, tirage, publication |
| `/orga/cotisations` | admin | montant, qui a versé, partiels, « marquer payé » |

## Mise en place (une seule fois)

1. Crée un projet gratuit sur <https://supabase.com>.
2. **SQL Editor** → colle tout `supabase/schema.sql` → *Run* (rejouable sans risque).
3. **Project Settings › API** : copie l'URL du projet et la clé `anon` / `publishable` dans `src/app/core/supabase.config.ts`. (Jamais la clé `service_role`.)
4. **Authentication › Providers › Email** : désactive « Allow new users to sign up » (seule l'organisation crée les comptes).
5. Crée ton compte : **Authentication › Users › Add user** (e-mail + mot de passe, coche « Auto Confirm User »). Puis, dans le SQL Editor, passe-toi administratrice :
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'ton-adresse@exemple.fr');
   ```
6. Déploie sur Vercel (la CSP de `vercel.json` autorise déjà `https://*.supabase.co`).

## Déroulé d'un événement

1. Les gens s'inscrivent sur `/inscription`.
2. **Inscrits** : tu valides. Pour chaque validé, crée son compte dans Supabase (**Authentication › Users › Add user**) avec **la même adresse e-mail que l'inscription** : le rattachement à sa fiche est automatique. Il se connecte sur `/orga/connexion`.
3. **Tirage** : règle les repas et le nombre de cuisiniers par repas, lance le tirage, relis, puis **publie**. Les participants ne voient rien avant la publication. Relancer le tirage repasse le planning en brouillon.
4. **Cotisations** : fixe le montant, puis coche au fil de l'eau (« Marquer payé » ou « Modifier » pour un versement partiel).

## Le tirage

Il s'exécute côté base (fonction `draw_meals`) : à chaque place, on pioche au hasard parmi les inscrits validés qui ont le **moins** de repas. Donc personne ne passe deux fois avant que tout le monde soit passé une fois ; si les places égalent le nombre de participants, chacun cuisine exactement une fois. L'écran signale quand il manque des places.

## Sécurité

- Les règles d'accès sont dans la base (RLS), pas seulement dans l'interface : un participant ne peut lire ni les autres inscrits, ni les cotisations, ni modifier quoi que ce soit.
- Un participant voit les prénoms des cuisiniers du planning publié (nom de famille jamais ; initiale seulement en cas d'homonyme).
- Le formulaire public ne peut qu'**ajouter** une inscription « en attente » (champ piège anti-robots inclus). Si du spam apparaît, active un CAPTCHA dans Supabase (Authentication › Attack Protection) ou ajoute Cloudflare Turnstile.
- Les pages `/orga` sont en `noindex` et exclues via `robots.txt`.

## Développement

```bash
npm install
npm start          # http://localhost:4200
```
Sans configuration Supabase, le site public fonctionne et les pages orga affichent un message d'aide.
