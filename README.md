# Épuration

Site pédagogique sur l'épuration biologique des eaux usées : modules de formation, calculateurs,
outil de diagnostic, présentations et vidéos. En français, utilisable sur téléphone.

**En ligne : <https://baiji.fr/epuration/>**

> Outil pédagogique : il ne remplace pas une étude de dimensionnement.
> Projet personnel indépendant, sans lien avec une entreprise.

## Sources

Les faits, formules et ordres de grandeur s'appuient principalement sur F. Edeline,
*L'épuration biologique des eaux — Théorie & technologie des réacteurs* (4e éd., Cebedoc, 1997),
avec la référence de la page. Les textes sont rédigés avec nos propres mots et les schémas sont redessinés.
Le livre lui-même n'est pas dans ce dépôt, et il ne doit jamais y entrer.

## Organisation

| Dossier | Rôle |
|---|---|
| `js/moteur/` | Calculs purs (aucun accès à la page), testés |
| `js/diagnostic/` | Moteur de l'arbre « Docteur STEP » |
| `js/ui/` | Liaison entre formulaires, moteur et graphiques |
| `data/` | Règles chiffrées sourcées, diagnostic, glossaire, quiz |
| `modules/` | Pages des modules de formation |
| `outils/` | Pages des calculateurs |
| `tests/` | Tests du moteur |

## Lancer le site et les tests

Il n'y a ni framework ni étape de compilation. Il faut juste un petit serveur local, car les modules
JavaScript ne se chargent pas depuis un fichier ouvert directement :

```bash
node outils/serveur.mjs
```

```bash
node --test
```

## Licence

Le **code** est sous licence MIT (voir `LICENSE`). Les **textes, schémas, présentations et vidéos**
restent protégés : tous droits réservés.

Réalisation : JM T.
