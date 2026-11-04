# Bigorneaux Party — site de la 5ème édition

Week-end du 5 juin 2027 · Beauvoir-sur-Mer · olympiades autour du crachat de bigorneau.

## État

Premier jet du **design** (validé), avant le développement Angular.

- `design/Main.dc.html` : page bureau (1360 px), source du design.
- `design/Mobile.dc.html` : aperçu smartphone (390 px), même page.
- `design/canvas.json` : disposition des maquettes.
- `design/assets/` : mascotte, affiches des éditions 3 et 4, photos de référence du Gois.
  Dans les maquettes, les images sont référencées par des liens internes (`/_blob/...`) :
  pour le développement, utiliser les fichiers de ce dossier.

## Direction artistique

- Palette tirée de la scène d'intro : ciel `#ece0c4`, eau `#2e6f8e`, soleil `#f2c879`, ocre `#e3a72f`, vermillon `#b03d25` (petits textes) / `#d8553a` (décors), bleu nuit `#0e1a2b`.
- Titres en Fraunces 800, texte en Instrument Sans.
- Scène d'intro en SVG + CSS pur (aucune bibliothèque d'animation), route du Gois en perspective.

## Intro (≈ 5 s)

1. Compteur « Marée basse » 0 → 100 %, soleil qui se lève, route du Gois qui émerge.
2. Canadair sur trajectoire courbe (`offset-path`), tracé de vol.
3. Lâcher de 5 bigorneaux sur la route, en perspective.
4. Titre dévoilé ligne par ligne, puis date et bouton d'inscription.

`prefers-reduced-motion` désactive toutes les animations.

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
