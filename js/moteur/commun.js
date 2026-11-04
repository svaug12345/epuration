// Contrôles partagés par les moteurs de calcul.

/**
 * Refuse une valeur nulle, négative ou qui n'est pas un nombre.
 * Mieux vaut un message clair qu'un résultat faux affiché avec aplomb.
 */
export function exigerPositif(valeur, nom) {
  if (!Number.isFinite(valeur) || valeur <= 0) {
    throw new Error(`${nom} doit être un nombre supérieur à zéro.`);
  }
}
