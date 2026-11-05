# Bigorneaux Party — site de la 5ème édition

Week-end du 5 juin 2027 · Beauvoir-sur-Mer · olympiades autour du crachat de bigorneau.

## État

Design **v2** (nouvelle direction artistique, validée), avant le développement Angular.

- `design/Main.dc.html` : page bureau (1440 px), source du design. Responsive : bureau, tablette (≤ 1100 px) et smartphone (≤ 760 px).
- `design/Mobile.dc.html` : aperçu smartphone (390 px), même page.
- `design/canvas.json` : disposition des maquettes.
- `design/assets/` : mascotte, affiches des éditions 3 et 4, photos de référence du Gois (les maquettes les référencent par `assets/...`).

## Direction artistique

- Ton « fédération sportive pince-sans-rire » : règlement officiel (« Article 1 »), billet-dossard pour les infos, sections en alternance encre / sable / papier / orange.
- **Scène d'intro inchangée** : affiche de voyage en aplats pêche, lavande et turquoise (soleil `#ffd27a`, mer `#46c4c6` → `#12707c`, ocre `#f2a844`, vermillon `#e0503f`), balise du Gois sur monticule rouge.
- Reste du site : encre `#10222f`, papier `#f4efe5`, sable `#e6d6b8`, accent orange `#ee5a1f` (réglable).
- Typographies : Big Shoulders 800/900 (capitales) pour les titres, Bricolage Grotesque pour le texte, DM Mono pour les étiquettes.

## Motion design

- Intro (≈ 3 s) : compteur « Marée basse » 0 → 100 %, soleil qui se lève, route du Gois qui émerge, Canadair sur trajectoire courbe (`offset-path`) avec tracé de vol, titre révélé mot par mot (flou + montée). Plus de bigorneaux sur la route.
- Démo animée du crachat de bigorneau (gouttelettes, coquille, anneau d'impact, mètre ruban, drapeau « Record »).
- Ambiance : nuages, mouettes et bulles en dérive lente, parallaxe au scroll.
- Apparition au scroll (30 px, décalage par élément), micro-interactions (survol, inclinaison 3D des affiches), le tout en CSS pur (`animation-timeline`).
- `prefers-reduced-motion` désactive toutes les animations.

## Contenu

- Toutes les épreuves se jouent en binôme ; binômes tirés au sort en début de week-end.
- Épreuves imaginées chaque année par les vainqueurs de l'édition précédente, qui remettent leur trophée en jeu.
- Épreuves : crachat de bigorneau (démo animée), passage de relais de bigorneaux à la cuillère, Save Nono le bigorneau, et d'autres.
- Le reste du week-end : concert de rock dans la grange, rugby improvisé, muscadet.

## À compléter (marqué entre crochets dans le design)

Programme complet des épreuves, record du crachat, lien d'inscription, participation.
Lieu « Beauvoir-sur-Mer » : repris des éditions précédentes, à confirmer.

## Structure Angular prévue

```
src/app/
├─ app.component.ts
├─ app.config.ts
├─ core/event.config.ts
├─ shared/{button,reveal.directive.ts}
└─ features/{hero-scene,info-band,olympiades,weekend,editions,join}
```

## Espace orga

Inscriptions, tirage au sort des repas, planning et cotisations : voir [`docs/ESPACE-ORGA.md`](docs/ESPACE-ORGA.md). Schéma de base dans `supabase/schema.sql`.
