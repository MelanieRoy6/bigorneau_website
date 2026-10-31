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

- Affiche de voyage sobre : papier chaud, bleu nuit, ocre, un seul accent vermillon.
- Titres en Fraunces 800, texte en Instrument Sans.
- Scène d'intro en SVG + CSS pur (aucune bibliothèque d'animation).

## Intro (≈ 5 s)

1. Compteur « Marée basse » 0 → 100 %, soleil qui se lève, route du Gois qui émerge.
2. Canadair sur trajectoire courbe (`offset-path`), tracé de vol.
3. Lâcher de 5 bigorneaux sur la route, en perspective.
4. Titre dévoilé ligne par ligne, puis date et bouton d'inscription.

`prefers-reduced-motion` désactive toutes les animations.

## À compléter (marqué entre crochets dans le design)

Épreuves 2 à 4, record du crachat, lien d'inscription, participation.
Lieu « Beauvoir-sur-Mer » : repris des éditions précédentes, à confirmer.

## Structure Angular prévue

```
src/app/
├─ app.component.ts
├─ app.config.ts
├─ core/event.config.ts
├─ shared/{button,reveal.directive.ts}
└─ features/{hero-scene,info-band,olympiades,editions,join}
```
