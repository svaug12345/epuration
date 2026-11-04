// Moteur de l'arbre « Docteur STEP », sans accès à la page.
// L'arbre vit dans data/diagnostic.json : on peut ajouter un symptôme sans toucher au code.

/** Nœud de départ d'un symptôme. */
export function demarrer(arbre, idSymptome) {
  const symptome = arbre.symptomes.find((s) => s.id === idSymptome);
  if (!symptome) throw new Error(`Symptôme inconnu : ${idSymptome}`);
  return lireNoeud(arbre, symptome.depart);
}

export function lireNoeud(arbre, id) {
  const noeud = arbre.noeuds[id];
  if (!noeud) throw new Error(`Étape inconnue : ${id}`);
  return { id, ...noeud };
}

/** Passe à l'étape désignée par une réponse. */
export function repondre(arbre, idNoeud, indexReponse) {
  const noeud = lireNoeud(arbre, idNoeud);
  const reponse = noeud.reponses?.[indexReponse];
  if (!reponse) throw new Error(`Réponse inconnue à l'étape ${idNoeud}`);
  return lireNoeud(arbre, reponse.suivant);
}

/**
 * Contrôle la qualité de l'arbre et renvoie la liste des problèmes (vide si tout va bien) :
 * liens valides, pas de boucle, pas d'étape orpheline, et conclusions toutes sourcées.
 */
export function verifierArbre(arbre) {
  const problemes = [];
  const atteints = new Set();

  const parcourir = (id, chemin) => {
    if (chemin.includes(id)) { problemes.push(`Boucle : ${[...chemin, id].join(' → ')}`); return; }
    const noeud = arbre.noeuds[id];
    if (!noeud) { problemes.push(`Lien mort vers ${id}`); return; }
    atteints.add(id);
    if (noeud.reponses) {
      if (!noeud.question) problemes.push(`Question manquante : ${id}`);
      for (const reponse of noeud.reponses) parcourir(reponse.suivant, [...chemin, id]);
    } else {
      if (!noeud.cause || !noeud.explication) problemes.push(`Conclusion incomplète : ${id}`);
      if (!noeud.sources?.length) problemes.push(`Conclusion sans source : ${id}`);
      if (!noeud.remedes) problemes.push(`Conclusion sans remèdes : ${id}`);
    }
  };

  for (const symptome of arbre.symptomes) parcourir(symptome.depart, []);
  for (const id of Object.keys(arbre.noeuds)) {
    if (!atteints.has(id)) problemes.push(`Étape jamais atteinte : ${id}`);
  }
  return problemes;
}
