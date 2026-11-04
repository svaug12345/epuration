// Calculs purs de la nitrification et de la dénitrification (aucun accès à la page).
// Sources : Edeline 1997, chap. 10 (p. 243-245) et chap. 8 (p. 226-227).
import { val, citer } from '../regles.js';
import { exigerPositif } from './commun.js';

/**
 * Taux de croissance des nitrifiants selon la température (Downing et Hopwood).
 * µT = 0,47 · 1,103^(T − 15), éq. 10.3, p. 245.
 */
export function tauxCroissance_par_j(temperature_C, R) {
  return val(R, 'nit.mu.coefficient') * val(R, 'nit.mu.theta') ** (temperature_C - 15);
}

/**
 * Âge des boues en dessous duquel les nitrifiants sont évacués plus vite qu'ils ne poussent.
 * On prend 1/µ : la mortalité est négligée, ce qui donne une borne basse, sans marge de sécurité.
 */
export function ageMinimalNitrification_j(temperature_C, R) {
  return 1 / tauxCroissance_par_j(temperature_C, R);
}

/**
 * Bilan azote d'une installation.
 * Les concentrations en mg/l valent des g/m³, donc débit × concentration / 1000 donne des kg/j.
 */
export function analyserAzote(entrees, R) {
  const {
    debit_m3_j, azoteANitrifier_mg_l, azoteADenitrifier_mg_l, temperature_C, oxygene_mg_l, ageBoues_j,
  } = entrees;
  exigerPositif(debit_m3_j, 'Le débit');
  exigerPositif(ageBoues_j, "L'âge des boues");

  const azoteNitrifie_kg_j = (debit_m3_j * azoteANitrifier_mg_l) / 1000;
  const azoteDenitrifie_kg_j = (debit_m3_j * azoteADenitrifier_mg_l) / 1000;
  const age_min = ageMinimalNitrification_j(temperature_C, R);

  const alertes = [];
  if (ageBoues_j < age_min) {
    alertes.push({
      id: 'age-court',
      niveau: 'danger',
      message: `Âge des boues trop court : il faut au moins ${age_min.toFixed(1)} j à ${temperature_C} °C, sans compter la marge de sécurité. Les nitrifiants seraient évacués.`,
      source: citer(R, 'nit.mu.coefficient'),
    });
  }
  if (oxygene_mg_l < val(R, 'nit.o2_min')) {
    alertes.push({
      id: 'oxygene-bas',
      niveau: 'danger',
      message: 'Oxygène sous 1 mg/l : la flore nitrifiante manque du minimum dont elle a besoin.',
      source: citer(R, 'nit.o2_min'),
    });
  }
  if (temperature_C > val(R, 'nit.temperature_baisse')) {
    alertes.push({
      id: 'chaleur',
      niveau: 'attention',
      message: "Au-delà de 31 °C, l'activité des nitrifiants diminue : le calcul devient optimiste.",
      source: citer(R, 'nit.temperature_baisse'),
    });
  }

  return {
    tauxCroissance_par_j: tauxCroissance_par_j(temperature_C, R),
    ageMinimal_j: age_min,
    oxygene_kg_j: azoteNitrifie_kg_j * val(R, 'nit.o2_reel'),
    methanol_kg_j: azoteDenitrifie_kg_j * val(R, 'denit.methanol_reel'),
    alertes,
  };
}
