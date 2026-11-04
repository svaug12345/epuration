# Projet « Épuration » — consignes pour Claude Code

> Dossier de transmission préparé le 4 novembre 2026 à partir d'une session d'analyse
> du livre de F. Edeline. À lire en entier avant toute modification du projet.

## 1. Le projet en une phrase

Construire, à partir du livre **F. Edeline, *L'épuration biologique des eaux — Théorie & technologie des réacteurs*
(4e éd., Cebedoc, 1997)**, un ensemble cohérent de **modules de formation**, d'**outils de calcul et de diagnostic**
et un **site pédagogique**, complétés par des sources récentes (réglementation DERU 2, guides EPNAC, IWA).

## 2. Qui est l'utilisateur et comment il travaille

- **Sébastien** (compte GitHub `svaug12345`), développeur autodidacte motivé : il veut **apprendre en même temps**.
  → **Code toujours bien commenté en français**, et des explications dans les réponses (pourquoi, pas seulement quoi).
- **Incrémenter le numéro de version à chaque mise à jour** (ex. `v0.1.0` → `v0.1.1`), version affichée dans le pied de page
  et notée dans `CHANGELOG.md`.
- Il travaille **depuis GitHub** (dépôts `svaug12345/…`), souvent depuis son téléphone Android : tout doit être
  **utilisable sur mobile**.
- Hébergement : **GitHub Pages**, servi sous **baiji.fr** en sous-chemin (le dépôt `svaug12345/epuration` serait
  publié sur `baiji.fr/epuration/` automatiquement, via le dépôt utilisateur `svaug12345.github.io`, qui porte le domaine).
  `mirobol.fr` est son domaine **bac à sable**, à utiliser pour les tests si besoin.
- Identité visuelle : voir le § 6, point 5.

## 3. ⚠️ Règles impératives sur la source

1. **Droits d'auteur** : le livre est protégé (© Cebedoc 1997). Le dépôt et le site sont **publics**.
   - ✅ Autorisé : utiliser les **faits, formules, ordres de grandeur et règles** pour construire nos propres outils et textes,
     avec la référence (chapitre, page).
   - ❌ Interdit : recopier des passages, scanner ou reproduire des tableaux et figures tels quels, et mettre le PDF en ligne.
   - Tout texte pédagogique est **rédigé avec nos propres mots** ; les schémas sont **redessinés** (SVG maison).
2. **Le PDF ne doit jamais être commité.** Il se range dans `sources/` (dossier ignoré par `.gitignore`).
3. **Traçabilité** : chaque valeur chiffrée utilisée dans un outil porte sa source (`livre`, `page`, `tableau/équation`)
   et un statut `verifie: true/false`. Une valeur non vérifiée sur la page **n'entre pas** dans un calculateur.
4. **Le livre date de 1993-1997.** Les fondamentaux tiennent, mais :
   - les normes de rejet citées sont anciennes → utiliser l'arrêté du 21/07/2015 et la DERU 2 (voir `docs/sources-complementaires.md`) ;
   - les procédés récents manquent (bioréacteurs à membrane, biofilm sur supports mobiles, boues granulaires, anammox, micropolluants) ;
   - toujours afficher dans les outils un bandeau « Outil pédagogique — ne remplace pas une étude de dimensionnement ».
5. **Le PDF est scanné en double page** (1 page PDF = 2 pages du livre ; page gauche du livre = 2 × page PDF − 6).
   L'extraction texte (`pdftotext`) mélange les tableaux : **vérifier chaque chiffre visuellement sur la page**.

## 4. Architecture proposée (à valider avec Sébastien)

Site statique, **sans framework ni étape de build** (HTML + CSS + JavaScript en modules ES), pour rester simple
à comprendre, à modifier depuis GitHub et à héberger sur Pages.

```
epuration/
├── index.html              # accueil : parcours, outils, glossaire
├── manifest.webmanifest    # appli installable sur téléphone (PWA)
├── sw.js                   # service worker : consultation hors ligne
├── css/
│   └── style.css           # charte SV, mobile d'abord, thème clair/sombre
├── js/
│   ├── moteur/             # calculs PURS (aucun accès au DOM) → testables
│   │   ├── boues-activees.js
│   │   ├── lits-bacteriens.js
│   │   ├── nitrification.js
│   │   └── methanisation.js
│   ├── diagnostic/         # moteur de l'arbre « Docteur STEP »
│   └── ui/                 # liaison formulaires ↔ moteur, graphiques
├── data/
│   ├── regles.json         # toutes les valeurs chiffrées sourcées (voir § 5)
│   ├── diagnostic.json     # symptômes → causes → remèdes, sourcés
│   ├── glossaire.json      # notations du livre + vocabulaire
│   └── quiz/               # une banque de questions par module
├── modules/                # pages des modules de formation
├── tests/                  # tests du moteur (node --test, sans dépendance)
├── docs/                   # documentation projet (ce dossier de transmission)
├── sources/                # PDF et extraits privés — IGNORÉ PAR GIT
├── CHANGELOG.md
└── .gitignore              # contient au minimum : sources/
```

Principes :
- **Moteur séparé de l'interface** : chaque fonction de calcul prend des nombres et renvoie des nombres plus des alertes.
  Elle est testée avec les valeurs des tableaux du livre (cas de référence dans `sources/regles-edeline.md`).
- **Règles dans des données, pas dans le code** : les seuils et plages sont lus depuis `data/regles.json`,
  ce qui permet d'ajouter une source plus récente sans réécrire le code.
- **Unités explicites partout** (dans les noms de variables et l'interface), par ex. `chargeBoues_kgDBO5_par_kgMS_j`.

### Format d'une règle dans `data/regles.json`

```json
{
  "id": "ba.nitrification.charge_max",
  "libelle": "Au-delà de cette charge des boues, pas de nitrification",
  "valeur": 0.35,
  "unite": "kg DBO5/kg MS.j",
  "source": { "ouvrage": "Edeline 1997", "page": 161, "ref": "Fig. 6.12" },
  "verifie": true,
  "remarque": "Système traditionnel, mélange complet."
}
```

## 5. Contenu déjà extrait

- `sources/regles-edeline.md` : les règles et valeurs **vérifiées visuellement**, avec leurs pages,
  et la carte des chapitres.
- `docs/sources-complementaires.md` : réglementation et références récentes, avec liens.
- `docs/feuille-de-route.md` : phases du projet et première tâche.

## 6. Décisions de cadrage (prises le 4 novembre 2026, remplacent les questions ouvertes)

1. **Public** : d'abord Sébastien lui-même, en accès libre pour tous. Chaque module a **deux niveaux** :
   « Comprendre » (sans équation) et « Approfondir » (formules, démonstrations).
2. **Nom** : `epuration` → `baiji.fr/epuration/`.
3. **Site public** sur GitHub Pages. Publication **automatique** à chaque version, sans redemander.
4. **Formats** : leçons interactives + **une présentation PowerPoint** et **une vidéo de 2 min 30 à 3 min par module**
   (Sébastien a demandé en novembre 2026 un format plus dynamique que les 3 à 5 min de départ).
5. **Charte** (remplace la charte SV) : palette ci-dessous, **sans aucun logo ni nom d'entreprise** sur le site,
   les présentations et les vidéos. La raison de ce choix est notée dans `sources/decisions-privees.md`.
   Mention obligatoire : « Projet personnel indépendant, sans lien avec une entreprise ».
   Orange `#EB690B` (accent, grands éléments), orange foncé `#C2540A` (texte et boutons, contraste suffisant),
   anthracite `#2C2A29`, taupe `#897879`, mauve `#8685BB`, fond `#F5F5F7`.
   Polices libres hébergées avec le site : Plus Jakarta Sans (titres) et Inter (texte).
6. **Signature** : discrète, « JM T. », dans le pied de page, les présentations et la fin des vidéos.
7. **Voix des vidéos** : ElevenLabs, voix **SebastienV** (`4BvORvhWrVjpfXilyDBc`). Français uniquement.

## 7. Niveau d'exigence visuelle

Sébastien veut un rendu moderne, façon appli de formation : navigation par onglets, leçons courtes animées,
questions intégrées, progression, révision espacée, simulateur en direct. Pas de page de texte à l'ancienne.
- Les scènes animées (`js/anim/`) servent à la fois au site et aux vidéos : une image est une fonction pure du temps.
- Une scène se décrit dans `data/modules/*.json` (`visuel`), sans toucher au code de dessin.
- Vidéos : voix avec pauses `<break time="1.6s" />`, repérées par ffmpeg pour caler l'image, puis `outils/medias/rendre_videos.mjs`.

## 8. Façon de travailler attendue

- Avancer **par petites étapes livrables** (une fonctionnalité = un commit clair), et expliquer chaque étape.
- Avant de coder un calcul : citer la règle et sa page, puis écrire le test, puis la fonction.
- Tester sur un affichage mobile (largeur 375 px) avant de déclarer une page terminée.
- Messages de commit en français.
