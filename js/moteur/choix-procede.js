// Aide au choix du procédé. Source : Edeline 1997, appendice, p. 294.
import { val } from '../regles.js';

/**
 * Pour une DBO5 de sortie à ne pas dépasser (dans 80 % des mesures), donne pour chaque
 * procédé la charge volumique la plus élevée permise par le tableau.
 * On ne garde que les lignes dont la garantie respecte la cible, sans interpoler :
 * le livre donne des points de repère, pas une loi continue.
 */
export function garantiesPossibles(cible_mg_l, R) {
  const parProcede = new Map();
  for (const ligne of val(R, 'choix.garanties')) {
    if (ligne.dbo80 > cible_mg_l) continue;
    const actuelle = parProcede.get(ligne.procede);
    if (!actuelle || ligne.cvMax > actuelle.cvMax) parProcede.set(ligne.procede, ligne);
  }
  return [...parProcede.values()];
}
