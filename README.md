# brialon-craft

Petits outils web construits sur mon temps libre, présentés dans la rubrique
[Artisanat](https://brialon.com/craft/) de brialon.com.

Une seule application React (Vite + TypeScript) : chaque outil est un composant,
présenté par catégorie sur la page Artisanat, ouvert dans un cadre façon écran de
téléphone, et accessible seul à sa propre adresse.

| Catégorie | Outil | Dossier | Page seule |
|---|---|---|---|
| Temps | Décompte perpétuel | `src/tools/countdown` | [brialon.com/to/15](https://brialon.com/to/15) (`/to/30`, `/to/60`…) |
| Temps | Chronomètre | `src/tools/chrono` | [brialon.com/chrono](https://brialon.com/chrono) |
| Temps | Déclinaison solaire | `src/tools/declination` | [brialon.com/declination](https://brialon.com/declination) |
| Temps | Détecteur d'arrière-plan | `src/tools/detector` | [brialon.com/detector](https://brialon.com/detector) |
| Mots | Aide au Quordle | `src/tools/quordle` | [brialon.com/quordle](https://brialon.com/quordle) |
| Mots | Lecture cryptée | `src/tools/scrambler` | [brialon.com/scrambler](https://brialon.com/scrambler) |
| Mots | Anecdotes xkcd | `src/tools/facts` | [brialon.com/facts](https://brialon.com/facts) |
| Pratique | Commande de cafés | `src/tools/coffee` | [brialon.com/coffee](https://brialon.com/coffee) |
| Pratique | Revenu éco-compatible | `src/tools/footprint` | [brialon.com/footprint](https://brialon.com/footprint) |
| Chiffres | Festival du film court | `src/tools/festival` | [brialon.com/festival](https://brialon.com/festival) |
| Art génératif | Diskr | `src/tools/diskr` | [brialon.com/diskr](https://brialon.com/diskr) |
| Art génératif | Mondrian infini | `src/tools/piet` | [brialon.com/piet](https://brialon.com/piet) |

La page présente aussi des extensions Firefox, dont le code vit dans leur propre dépôt :
elle n'en montre qu'une capture, dans un cadre façon fenêtre de navigateur.

| Extension | Dépôt | Fiche |
|---|---|---|
| Relooking pour le Zimbra de Free | [zimbra-free-relooke](https://github.com/guillaume-brialon/zimbra-free-relooke) | [addons.mozilla.org](https://addons.mozilla.org/addon/relooking-pour-zimbra-de-free/) |

## Organisation

- `index.html` : page Artisanat (en-tête et pied de page du site, atelier React au centre).
- `<outil>/index.html` : page seule de chaque outil.
- `src/categories.ts` : catégories, dans l'ordre des sections de la page.
- `src/tools/registry.ts` : liste des outils, avec catégorie, titre, description, orientation et adresse.
- `src/extensions/registry.ts` : liste des extensions, avec leur capture et leur icône.
- `src/shell/` : l'atelier (sections par catégorie, cartes, fenêtre d'un outil).
- `src/shared/` : styles et utilitaires communs.

Une carte s'ouvre par l'ancre de l'adresse (`/craft/#diskr`) ; l'art génératif y tourne
en vignette. Les tailles des outils suivent leur conteneur (unités `cqmin`), si bien qu'un
outil s'affiche de la même façon dans la vignette, dans le cadre et en page seule.

Les films du festival n'existent que dans `src/tools/festival/films.json`, un film par
ligne : on y ajoute ceux de chaque édition, avec les noms de pays déjà employés.

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
| `data/words-fr-5.json` | Aide au Quordle | dictionnaire des mots de cinq lettres |

Les outils n'utilisent aucune classe de `site.css` : leurs pages seules ne chargent que
`tokens.css` et `fonts.css`. Sans le site (clone isolé), ils fonctionnent sans ses couleurs
ni ses polices.

Le dictionnaire de l'aide au Quordle n'est pas dans ce dépôt : la liste de mots n'est pas
sous licence libre, elle ne peut donc pas être distribuée ici sous licence MIT. Sans le site,
l'outil indique que le dictionnaire est indisponible.

## Développement

Le dépôt du site doit être cloné à côté de celui-ci (`../brialon.com`) : en
développement, Vite y lit les styles communs, et le build y écrit la rubrique.

```sh
yarn            # installe les dépendances
yarn dev        # http://localhost:5173/craft/
yarn build      # vérifie les types et écrit dans ../brialon.com/www/craft/
```

La variable `SITE_DIR` permet de pointer ailleurs que `../brialon.com/www`.

## Ajouter un outil

1. Créer `src/tools/<id>/` avec un composant par défaut qui reçoit `ToolProps`.
2. Le déclarer dans `src/tools/registry.ts`, avec sa catégorie (`src/categories.ts`).
3. Ajouter la page seule `<id>/index.html` (copie d'une page existante) et l'id dans
   la liste `TOOLS` de `vite.config.ts`.
4. Ajouter son id à la réécriture des adresses dans le `.htaccess` du site.
5. Ajouter son lien à la liste de secours de `index.html`, sous sa catégorie.

## Ajouter une extension

1. Copier sa capture publiée sur addons.mozilla.org et son icône dans `src/extensions/<id>/`.
2. La déclarer dans `src/extensions/registry.ts`.
3. Ajouter son lien à la liste de secours de `index.html`.

## Licence

[MIT](LICENSE)
