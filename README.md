# brialon-craft

Petits outils web construits sur mon temps libre, présentés dans la rubrique
[Artisanat](https://brialon.com/craft/) de brialon.com.

## État

Les sources sont importées telles quelles depuis leurs projets d'origine,
sans leur historique. Elles seront réunies en une seule application React
(Vite + TypeScript) : chaque outil devient un composant, affiché dans un cadre
sur la page Artisanat et accessible seul à sa propre adresse.

| Dossier | Outil | Adresse actuelle | Origine |
|---|---|---|---|
| `src/tools/coffee` | Commande de cafés | brialon.com/coffee | projet `coffee-order` (Create React App) |
| `src/tools/countdown` | Décompte perpétuel | brialon.com/to/15 | projet `perpetual-countdown` (Create React App) |
| `src/tools/detector` | Détecteur de mise en arrière-plan | brialon.com/detector | page HTML autonome |

`brialon.com/quart-d-heure`, version antérieure du décompte perpétuel,
devient une simple redirection vers `brialon.com/to/15`.

Dépendances des projets d'origine : React 18.2, react-icons 4.9 (coffee) ;
react-router-dom 6.8, react-circular-progressbar 2.1, @fontsource/days-one 4.5,
prop-types (countdown).

## Construction

Le build écrira dans `../brialon.com/www/craft/`, le dépôt du site étant
cloné à côté de celui-ci.

## Licence

[MIT](LICENSE)
