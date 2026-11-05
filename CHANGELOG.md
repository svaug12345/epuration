# Journal des versions

## v1.3.1 — 5 novembre 2026

- Nouvelle voix pour Jim, à l'accent parisien (la précédente sonnait québécoise).
- Les conversations avec Jim sont enregistrées (voix et texte, sans limite de durée), avec un résumé en français
  et une fiche par conversation : page d'origine, sujet, type de demande, hypothèse vérifiée, questions restées sans réponse.
  La mention sous la page de Jim le signale.

## v1.3.0 — 5 novembre 2026

- L'assistant vocal s'appelle désormais **Jim** : très pro sur le fond, détendu dans la forme, avec une voix jeune et dynamique (James).
- Jim est disponible **sur toutes les pages**, derrière un petit micro mauve dans la barre du haut : il s'ouvre dans un panneau discret.
- Jim **voit la page où vous êtes** : titre, étape de leçon en cours, valeurs saisies dans un calculateur et résultats affichés.
  Si vous changez d'étape ou de valeur pendant l'appel, il est prévenu sans interrompre la conversation.
- Code de conversation commun aux deux interfaces (`js/jim/session.js`).

## v1.2.0 — 5 novembre 2026

- Nouvel outil du Labo : l'**assistant vocal**. On lui parle à voix haute pour poser une question, comprendre une notion,
  réfléchir à deux ou vérifier une hypothèse ; il s'appuie sur les leçons, les valeurs chiffrées et le Docteur STEP du site.
- Sous-titres de la conversation à l'écran (sigles remis en forme : DBO5, DCO…), cartes d'idées pour démarrer.
- La base de connaissances de l'assistant est fabriquée depuis `data/` par `outils/assistant/construire_connaissances.py`.

## v1.1.0 — 4 novembre 2026

- Logo JMT « Jamais Mal Traitée » sur tout le site, les vidéos et les présentations, et comme icône de l'application.
- Animation d'entrée à l'arrivée sur le site : une fois par visite, en paysage ou en portrait, et un toucher suffit pour la passer.
- Nouvelle voix des vidéos (Paul K), avec des sigles écrits en phonétique et des silences resserrés pour un rythme plus vif.
- Générique des vidéos repris de l'animation d'entrée, carte de fin signée, sous-titres calés sur les pauses réelles de la voix.
- Orange du site aligné sur celui du logo.

## v1.0.0 — 4 novembre 2026

Refonte complète : le site devient une véritable appli de formation.

- Nouveau design : polices modernes, héros animé, pictos maison, thème sombre revu, transitions entre pages.
- Navigation d'appli : onglets en bas sur mobile, recherche instantanée dans les leçons, le glossaire et les outils (Ctrl+K).
- Leçons courtes étape par étape, avec animation en direct et questions de vérification intégrées.
- Progression sans compte, gardée dans le navigateur : points, niveaux, badges, jours d'affilée et reprise là où on s'est arrêté.
- Parcours visuel, révision espacée (méthode de Leitner) avec cartes qui se retournent, Docteur STEP en conversation.
- Simulateur boues activées : le bassin animé réagit aux curseurs en direct.
- Vidéos refaites en motion design, en Full HD : 2 min 30 à 3 min, nouveaux textes et voix, image calée sur la voix, sous-titres mot à mot, barre de chapitres, fond sonore discret.
- Présentations refaites, en pleine image.

## v0.7.1 — 4 novembre 2026

Virgule décimale sur l'axe du graphique, et icônes PNG pour installer l'application sur Android.

## v0.7.0 — 4 novembre 2026

Une vidéo de 4 à 5 minutes par module, avec la voix SebastienV, en français, et une signature discrète.

## v0.6.0 — 4 novembre 2026

Une présentation PowerPoint par module, téléchargeable depuis sa page, avec la voix off dans les notes. Schémas corrigés (azote, boues activées, courbe de Monod recalculée). Consignes et feuille de route à jour.

## v0.5.0 — 4 novembre 2026

Modules de formation.

- 7 modules à deux niveaux (Comprendre, Approfondir), avec schémas redessinés, fiche mémo, étude de cas et quiz.
- Un seul fichier de données par module, qui alimentera aussi les présentations et les vidéos.
- Page de révision par cartes question-réponse, tirées des quiz.
- Contrôles automatiques de la structure des modules.

## v0.4.0 — 4 novembre 2026

Calculateurs lit bactérien, azote, méthanisation, lagunage et choix du procédé, tous testés, avec page d'index des outils.

## v0.3.0 — 4 novembre 2026

Docteur STEP : 7 symptômes, de la question à la cause probable et au remède, avec arbre en données contrôlé par des tests.

## v0.2.0 — 4 novembre 2026

Calculateur boues activées.

- Moteur de calcul testé avec les tableaux 6.I et 6.III : charges, âge des boues, classe de charge, qualité d'eau, oxygène, boues produites.
- Alertes sourcées : nitrification, charge à éviter, gonflement, âge des boues, effet du froid.
- Graphique interactif de l'effet de la charge, avec couleurs validées pour les daltonismes.
- Serveur de test local sans dépendance.

## v0.1.0 — 4 novembre 2026

Socle du site.

- Page d'accueil, page « Sources et mentions », en-tête, pied de page signé et version affichée.
- Mise en page mobile d'abord, thème clair ou sombre, bandeau « outil pédagogique » réutilisable.
- `data/regles.json` : règles chiffrées sourcées, avec refus par le code des valeurs non vérifiées.
- Glossaire de 40 termes avec recherche.
- Application installable et consultation hors ligne des pages déjà visitées.
