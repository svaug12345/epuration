// Calculs purs du lagunage. Source : Edeline 1997, chap. 12, p. 263-267.
import { val, citer, interpoler } from '../regles.js';
import { exigerPositif } from './commun.js';

/** Constante k selon la température, interpolée dans le Tab. 12.I (p. 263). */
export function constanteK_par_j(temperature_C, R) {
  const { t, k } = val(R, 'lag.k_temperature');
  return interpoler(t, k, temperature_C);
}

export function analyserLagune(entrees, R) {
  const { dbo5Entree_mg_l, temperature_C, sejour_j, habitants_EH } = entrees;
  exigerPositif(dbo5Entree_mg_l, 'La DBO5 en entrée');
  exigerPositif(sejour_j, 'Le temps de séjour');
  exigerPositif(habitants_EH, 'Le nombre d\'équivalents-habitants');
  if (!Number.isFinite(temperature_C)) throw new Error('La température doit être un nombre.');

  const { valeur: k, horsPlage } = constanteK_par_j(temperature_C, R);
  // Modèle du mélange complet : S1 = S0 / (1 + k·θ).
  const dbo5Sortie_mg_l = dbo5Entree_mg_l / (1 + k * sejour_j);
  const rendement_pct = 100 * (1 - dbo5Sortie_mg_l / dbo5Entree_mg_l);

  const alertes = [];
  const alerter = (id, niveau, message, regle) => alertes.push({ id, niveau, message, source: citer(R, regle) });

  if (rendement_pct > val(R, 'lag.rendement_fiable')) {
    alerter('rendement-eleve', 'attention', 'Le modèle est jugé acceptable pour des rendements inférieurs à 90 % : au-delà, le résultat est optimiste.', 'lag.rendement_fiable');
  }
  if (horsPlage) {
    alerter('temperature', 'attention', 'Température hors du tableau (5 à 35 °C) : on garde la valeur de k du bord.', 'lag.k_temperature');
  }
  alerter('algues', 'info', "Ce modèle ne tient compte ni de l'ensoleillement ni des algues, qui font sortir des matières en suspension même quand l'eau est bien épurée.", 'lag.k_temperature');

  return {
    k_par_j: k,
    dbo5Sortie_mg_l,
    rendement_pct,
    surface_m2: habitants_EH * val(R, 'lag.surface_par_eh'),
    surfaceAllemande_m2: habitants_EH * 10,
    alertes,
  };
}
