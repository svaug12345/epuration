# Assistant vocal — mode d'emploi

La page `outils/assistant.html` parle avec l'agent ElevenLabs **« Assistant Épuration »**
(`agent_0501m6n51nz3e7vbx3sesy59mrp9`), voix **SebastienV**.

## Ce qui est réglé côté ElevenLabs

| Réglage | Valeur | Pourquoi |
|---|---|---|
| Consignes | `prompt.md` (copie de référence) | Tuteur : répondre, faire réfléchir, vérifier les hypothèses |
| Modèle | Claude Haiku 5.5, température 0,3 | Rapide à l'oral, un peu de souplesse pour reformuler |
| Voix | SebastienV, Eleven v4 Turbo, stabilité 0,6, similarité 0,85 | Mêmes réglages que l'assistant Nexus |
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
