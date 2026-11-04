// Accès aux règles chiffrées de data/regles.json.
//
// Pourquoi ce petit module ? Il fait respecter une règle du projet : une valeur
// non vérifiée sur la page du livre n'entre pas dans un calculateur. Plutôt que
// de compter sur notre vigilance, le code lève une erreur si on essaie de la lire.

/**
 * Transforme la liste de règles en dictionnaire { id: règle } pour les retrouver vite.
 * @param {{regles: Array<object>}} donnees contenu de data/regles.json
 * @returns {Map<string, object>}
 */
export function indexerRegles(donnees) {
  return new Map(donnees.regles.map((regle) => [regle.id, regle]));
}

/**
 * Renvoie la valeur d'une règle vérifiée, ou lève une erreur.
 * @param {Map<string, object>} index résultat de indexerRegles
 * @param {string} id identifiant de la règle, par ex. "ba.nitrification.charge_max"
 */
export function val(index, id) {
  const regle = index.get(id);
  if (!regle) throw new Error(`Règle inconnue : ${id}`);
  if (regle.verifie !== true) throw new Error(`Règle non vérifiée, usage refusé : ${id}`);
  return regle.valeur;
}

/**
 * Texte court de la source, à afficher à côté d'un résultat.
 * Exemple : « Edeline 1997, p. 161 (Fig. 6.12) ».
 */
export function citer(index, id) {
  const { source } = index.get(id);
  return `${source.ouvrage}, p. ${source.page} (${source.ref})`;
}

/** Charge les règles dans le navigateur. L'adresse reste juste quel que soit le sous-dossier. */
export async function chargerRegles() {
  const reponse = await fetch(new URL('../data/regles.json', import.meta.url));
  if (!reponse.ok) throw new Error('Impossible de charger les règles de calcul.');
  return indexerRegles(await reponse.json());
}

/**
 * Interpolation linéaire entre des points connus, sans jamais extrapoler :
 * hors de la plage, on garde la valeur du bord et on signale `horsPlage`.
 * @param {number[]} xs abscisses croissantes
 * @param {number[]} ys ordonnées
 * @param {number} x point recherché
 * @returns {{valeur: number, horsPlage: boolean}}
 */
export function interpoler(xs, ys, x) {
  if (x <= xs[0]) return { valeur: ys[0], horsPlage: x < xs[0] };
  const dernier = xs.length - 1;
  if (x >= xs[dernier]) return { valeur: ys[dernier], horsPlage: x > xs[dernier] };
  const i = xs.findIndex((borne) => borne >= x);
  const part = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
  return { valeur: ys[i - 1] + part * (ys[i] - ys[i - 1]), horsPlage: false };
}
