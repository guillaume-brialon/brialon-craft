# brialon-craft

Petits outils web construits sur mon temps libre, présentés dans la rubrique
[Artisanat](https://brialon.com/craft/) de brialon.com.

Une seule application React (Vite + TypeScript) : chaque outil est un composant,
affiché dans un cadre façon écran de téléphone sur la page Artisanat, et accessible
seul à sa propre adresse.

| Outil | Dossier | Page seule |
|---|---|---|
| Commande de cafés | `src/tools/coffee` | [brialon.com/coffee](https://brialon.com/coffee) |
| Décompte perpétuel | `src/tools/countdown` | [brialon.com/to/15](https://brialon.com/to/15) (`/to/30`, `/to/60`…) |
| Chronomètre | `src/tools/chrono` | [brialon.com/chrono](https://brialon.com/chrono) |
| Revenu éco-compatible | `src/tools/footprint` | [brialon.com/footprint](https://brialon.com/footprint) |
| Lecture cryptée | `src/tools/scrambler` | [brialon.com/scrambler](https://brialon.com/scrambler) |
| Anecdotes de calendrier xkcd | `src/tools/facts` | [brialon.com/facts](https://brialon.com/facts) |
| Détecteur d'arrière-plan | `src/tools/detector` | [brialon.com/detector](https://brialon.com/detector) |

## Organisation

- `index.html` : page Artisanat (en-tête et pied de page du site, atelier React au centre).
- `<outil>/index.html` : page seule de chaque outil.
- `src/tools/registry.ts` : liste des outils, avec titre, description, orientation et adresse.
- `src/shell/` : l'atelier (liste des outils, cadre, fiche).
- `src/shared/` : styles et utilitaires communs.

Les tailles des outils suivent le cadre (unités `cqmin`), si bien qu'un outil s'affiche
de la même façon dans le cadre et en page seule.

## Dépendances au site

Les outils reprennent les couleurs et polices de brialon.com, chargées depuis `/assets/`.
Le site les garde stables : chaque fichier concerné commence par son contrat avec l'artisanat.

| Fichier du site | Chargé par | Utilisé pour |
|---|---|---|
| `css/tokens.css` | toutes les pages | variables de couleurs (clair et sombre), de polices et de tailles |
| `css/fonts.css` | toutes les pages | polices Figtree, Archivo et Chivo Mono |
| `css/site.css` | page Artisanat | en-tête, pied de page, mise en page (`.wrap`, `.label`, `.section-head`) |
| `js/site.js` | page Artisanat | bouton de thème, hauteur de l'en-tête (`--header-h`), coordonnées |
| `img/favicon.png` | page Artisanat et outils sans icône propre | icône d'onglet |

Les outils n'utilisent aucune classe de `site.css` : leurs pages seules ne chargent que
`tokens.css` et `fonts.css`. Sans le site (clone isolé), ils fonctionnent sans ses couleurs
ni ses polices.

## Développement

Le dépôt du site doit être cloné à côté de celui-ci (`../brialon.com`) : en
développement, Vite y lit les styles communs, et le build y écrit la rubrique.

```sh
npm install
npm run dev     # http://localhost:5173/craft/
npm run build   # vérifie les types et écrit dans ../brialon.com/www/craft/
```

La variable `SITE_DIR` permet de pointer ailleurs que `../brialon.com/www`.

## Ajouter un outil

1. Créer `src/tools/<id>/` avec un composant par défaut qui reçoit `ToolProps`.
2. Le déclarer dans `src/tools/registry.ts`.
3. Ajouter la page seule `<id>/index.html` (copie d'une page existante) et l'id dans
   la liste `TOOLS` de `vite.config.ts`.
4. Ajouter son id à la réécriture des adresses dans le `.htaccess` du site.

## Licence

[MIT](LICENSE)
