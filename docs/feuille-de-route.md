# Feuille de route

Chaque phase se termine par une version publiée (numéro incrémenté, `CHANGELOG.md` à jour)
et testée sur mobile.

## Phase 0 — Cadrage (avant tout code)
- [ ] Poser à Sébastien les questions ouvertes de `CLAUDE.md` § 6 (public, nom, public/privé, formats).
- [ ] Créer le dépôt `svaug12345/<nom>`, `.gitignore` avec `sources/`, `README.md`, `CHANGELOG.md`, licence du code.
- [ ] Ranger le PDF dans `sources/` (local uniquement) et vérifier qu'il n'apparaît pas dans `git status`.

## Phase 1 — Socle du site (v0.1.x)
- [ ] Page d'accueil mobile d'abord, charte SV, thème clair/sombre, pied de page avec version.
- [ ] Bandeau « outil pédagogique » réutilisable.
- [ ] `data/regles.json` initialisé avec les règles ✅ de `sources/regles-edeline.md`.
- [ ] Glossaire des notations (Cb, Cv, θc, θl, Y, b, Ks, µ̂, SVI, DBO5, DCO, MES, EH…).
- [ ] Publication GitHub Pages → vérifier l'adresse `baiji.fr/<nom>/`.

## Phase 2 — Calculateur boues activées (v0.2.x) — priorité n° 1
- Entrées : débit (m³/j), DBO5 entrée (mg/l), volume d'aérateur (m³), concentration en boues (g/l), température (°C).
- Sorties : Cv, Cb, temps de séjour, âge des boues estimé (θc = 1,224·Cb^−1,125), classe de charge (Tab. 6.I),
  effluent attendu (Tab. 6.III), besoin en O₂ et production de boues (ordres de grandeur), nitrification possible ou non.
- Alertes : Cb > 0,35 (pas de nitrification), 0,5 < Cb < 1,0 (zone à éviter), θc < 3 j ou très élevé, Cb > 0,5 (risque de gonflement).
- Graphique interactif : effet d'un curseur Cb sur DBO5 / NH₄ / NO₃ de sortie.
- Tests `node --test` avec les lignes des tableaux 6.I et 6.III comme cas de référence.

## Phase 3 — « Docteur STEP » (v0.3.x) — priorité n° 2
- Arbre de décision en données (`data/diagnostic.json`) : symptôme → questions → causes probables → remèdes, chaque nœud sourcé.
- Premier symptôme couvert : **boue qui décante mal / SVI élevé** (règles p. 128-133).
- Puis : mousses, effluent trouble, nitrification qui décroche, digesteur qui s'acidifie, lit bactérien colmaté.
- Enrichissement avec le guide d'exploitation EPNAC boues activées (2015).

## Phase 4 — Autres calculateurs (v0.4.x)
- Lit bactérien : charge volumique et surfacique, force de rinçage, contrôle de la nitrification (≤ 2 g/m².j).
- Nitrification : µ selon la température, âge des boues minimal, besoin en O₂ (4,33 g O₂/g N), alcalinité.
- Choix du procédé : tableau de l'annexe + diagramme de Mosey redessiné.
- Méthanisation : θc, bilan thermique simplifié.

## Phase 5 — Modules de formation (v0.5.x)
- Parcours proposé : 1. Bases (DBO, DCO, biomasse, Monod) · 2. Boues activées · 3. Lits bactériens ·
  4. Azote et phosphore · 5. Méthanisation · 6. Lagunage et filières rustiques · 7. Réglementation et procédés récents.
- Pour chaque module : page de cours (nos mots, schémas SVG maison), fiche mémo, quiz, étude de cas utilisant les calculateurs.
- Mode révision (cartes question/réponse).

## Phase 6 — Compléments modernes (v0.6.x)
- Module DERU 2 + simulateur « ma station est-elle conforme ? » (avant / après DERU 2) — après vérification des valeurs officielles.
- Fiches procédés récents (membranes, supports mobiles, granules, anammox, micropolluants).

## Phase 7 — Options
- Station virtuelle (jeu de pilotage avec événements : orage, rejet industriel, froid).
- Atlas des micro-organismes indicateurs.
- Agent vocal « expert épuration » (ElevenLabs, comme ses autres assistants) avec une base de connaissances **rédigée par nous**, pas le texte du livre.
- Appli installable (PWA) avec consultation hors ligne.
