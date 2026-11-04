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

- Style affiche de voyage en aplats (pêche, lavande, turquoise), inspiré d'affiches du Gois.
- Palette : encre `#2b1d5e`, mer `#12707c`, papier `#ffe3d3`, soleil `#ffd27a`, ocre `#f2a844`, vermillon `#b8352c` (petits textes) / `#e0503f` (décors).
- Titres en Fraunces 800 (capitales), texte en Instrument Sans.
- Scène d'intro en SVG + CSS pur (aucune bibliothèque d'animation), responsive : sur smartphone la scène est décalée pour garder le refuge dans le cadre.

## Motion design

- Intro (≈ 3 s) : compteur « Marée basse » 0 → 100 %, Canadair sur trajectoire courbe (`offset-path`) avec tracé de vol, lâcher de bigorneaux sur la route du Gois, titre révélé mot par mot (flou + montée).
- Ambiance : nuages, mouettes et bulles en dérive lente, parallaxe au scroll.
- Apparition au scroll (30 px, décalage de 0,1 s par élément), micro-interactions (survol, inclinaison 3D des affiches).
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
