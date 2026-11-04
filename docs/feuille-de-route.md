# Feuille de route

Chaque phase se termine par une version publiée (numéro incrémenté, `CHANGELOG.md` à jour)
et testée sur mobile.

## Fait

- [x] **Phase 0 : cadrage**, dépôt, licence, journal des versions.
- [x] **Phase 1 : socle** (v0.1.0) : accueil, thème, bandeau, règles sourcées, glossaire, application installable.
- [x] **Phase 2 : calculateur boues activées** (v0.2.0).
- [x] **Phase 3 : Docteur STEP** (v0.3.0), 7 symptômes.
- [x] **Phase 4 : calculateurs** (v0.4.0) : lit bactérien, azote, méthanisation, lagunage, choix du procédé.
- [x] **Phase 5 : modules** (v0.5.0) : 7 modules à deux niveaux, quiz, révision.
- [x] **Présentations** (v0.6.0) et **vidéos** (v0.7.0), une par module.
- [x] **Refonte** (v1.0.0) : design d'appli, leçons animées, progression, révision espacée, simulateur, vidéos en motion design.

## Reste à faire

### À extraire du livre, puis à vérifier sur la page (voir `sources/regles-edeline.md`, § 6)
- Chap. 5 : formules d'Eckenfelder et tableaux comparatifs.
- Chap. 7 : AGV et alcalinité, séjour selon la température, toxiques → branche « digesteur qui s'acidifie » de Docteur STEP.
- Chap. 7 : bilan thermique (Fig. 7.15) → calculateur méthanisation.
- Chap. 11, § 2.1 : alcalinité → calculateur azote.
- Chap. 6, § 1.2.4 : protozoaires et métazoaires indicateurs → atlas.
- Diagramme de Mosey (Fig. A.4), à redessiner pour le choix du procédé.

### À compléter avec les sources récentes
- Docteur STEP : mousses, en s'appuyant sur le guide d'exploitation EPNAC boues activées (2015).
- Vérifier sur EUR-Lex et Légifrance les valeurs de la DERU 2 et de l'arrêté de 2015, cités dans le module 7
  d'après des sources secondaires. Seulement ensuite : simulateur « ma station est-elle conforme ? ».
- Fiches détaillées des procédés récents (membranes, supports mobiles, granules, anammox, micropolluants).

### Options
- Station virtuelle (jeu de pilotage avec événements : orage, rejet industriel, froid).
- Atlas des micro-organismes indicateurs.
- Agent vocal « expert épuration » (ElevenLabs) avec une base de connaissances **rédigée par nous**, pas le texte du livre.

## Refaire les présentations et les vidéos

Les scripts de `outils/medias/` lisent `data/modules/*.json`. Si un texte change, il faut aussi régénérer la voix
du module (cela consomme des crédits ElevenLabs), avec une pause `<break time="1.6s" />` entre chaque scène.
Les voix sont attendues dans `outils/travail/voix/<module>.mp3` (dossier non publié).
Il faut aussi `playwright-core` dans `outils/travail/studio/`, et le site servi par `node outils/serveur.mjs`.

```bash
node outils/medias/rendre_videos.mjs
```

```bash
node outils/medias/rendre_diapos.mjs
```

```bash
pip install -r outils/medias/requirements.txt
```

```bash
python outils/medias/construire_presentations.py
```
