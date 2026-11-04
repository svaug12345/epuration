// Calculs purs de la méthanisation. Source : Edeline 1997, chap. 7, p. 197.
import { val, citer } from '../regles.js';
import { exigerPositif } from './commun.js';

/**
 * Digesteur sans recyclage : les boues restent le temps de séjour de l'eau, donc θc = V / Q.
 * Avec un recyclage, l'âge réel serait plus élevé : ce calcul ne s'applique plus tel quel.
 */
export function analyserDigesteur(entrees, R) {
  const { volume_m3, debitBoues_m3_j } = entrees;
  exigerPositif(volume_m3, 'Le volume');
  exigerPositif(debitBoues_m3_j, 'Le débit de boues');

  const age_j = volume_m3 / debitBoues_m3_j;
  const alertes = [];
  const alerter = (id, niveau, message, regle) => alertes.push({ id, niveau, message, source: citer(R, regle) });

  if (age_j < val(R, 'meth.age_min')) {
    alerter('lessivage', 'danger', 'Âge inférieur à 3 j : minimum théorique non atteint, les méthanogènes sont évacués.', 'meth.age_min');
  } else if (age_j < val(R, 'meth.age_pratique_min')) {
    alerter('sous-pratique', 'attention', 'Âge entre 3 et 10 j : possible en théorie, mais en dessous de la pratique courante.', 'meth.age_pratique_min');
  } else if (age_j > val(R, 'meth.age_pratique_max')) {
    alerter('sur-pratique', 'info', 'Âge supérieur à 30 j : au-dessus de la plage courante, le volume semble généreux.', 'meth.age_pratique_max');
  }

  return {
    age_j,
    volumePratiqueMin_m3: debitBoues_m3_j * val(R, 'meth.age_pratique_min'),
    volumePratiqueMax_m3: debitBoues_m3_j * val(R, 'meth.age_pratique_max'),
    alertes,
  };
}
