# Jim, l'assistant vocal — mode d'emploi

Jim est l'agent ElevenLabs **« Jim – Assistant Épuration »** (`agent_0501m6n51nz3e7vbx3sesy59mrp9`), voix **James** (`YQtnmWKnwPI7Z6URWJSj`).
On lui parle depuis la grande page `outils/assistant.html`, ou depuis le petit micro de la barre du haut, sur toutes les pages
(`js/ui/jim.js`). La conversation elle-même est dans `js/jim/session.js`.

## Le contexte de la page

Au démarrage, la page envoie deux « variables dynamiques » que les consignes utilisent :
`page_titre` (« le module « Les boues activées » ») et `page_contexte` (valeurs saisies + texte affiché, 1 800 caractères au plus).
Pendant l'appel, un `MutationObserver` repère les changements de la page et les envoie à Jim avec `sendContextualUpdate`
(une information silencieuse : Jim ne répond pas à voix haute).

## Ce qui est réglé côté ElevenLabs

| Réglage | Valeur | Pourquoi |
|---|---|---|
| Consignes | `prompt.md` (copie de référence) | Tuteur : répondre, faire réfléchir, vérifier les hypothèses |
| Modèle | Claude Haiku 5.5, température 0,3 | Rapide à l'oral, un peu de souplesse pour reformuler |
| Voix | James, Eleven v4 Turbo, stabilité 0,5, similarité 0,8, vitesse 1,05 | Jeune et dynamique ; stabilité plus basse = plus vivant |
| Durée max | 10 min | Une séance de révision ; à baisser si les crédits fondent |
| Attente | 12 s avant relance, raccroche après 60 s de silence | Laisser le temps de réfléchir |
| Connaissances | 10 fiches de `connaissances/`, recherche « RAG » | Voir ci-dessous |

## Mettre à jour ce que sait l'assistant

Les fiches de `connaissances/` sont **fabriquées** à partir de `data/` (modules, règles, glossaire, Docteur STEP) :

```bash
python3 outils/assistant/construire_connaissances.py
git add outils/assistant/connaissances && git commit -m "Assistant : connaissances à jour"
```

ElevenLabs relit chaque fiche depuis GitHub (synchronisation automatique, au moins tous les 7 jours) :
il n'y a rien d'autre à faire. Pour un nouveau module, il faut en revanche ajouter sa fiche à l'agent
(nouveau document « URL » dans sa base de connaissances).

## Pourquoi pas la bulle toute faite d'ElevenLabs ?

Notre propre bouton garde la charte du site et évite l'écran de conditions en anglais.
Le SDK (`@elevenlabs/client`, version figée 1.32.1) n'est chargé qu'au premier appel.
