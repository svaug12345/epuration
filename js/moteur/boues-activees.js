// Calculs purs des boues activées : des nombres en entrée, des nombres et des alertes en sortie.
// Aucun accès à la page, ce qui permet de tout tester avec node --test.
// Source : Edeline 1997, chap. 6. Les seuils sont lus dans data/regles.json.
import { val, citer, interpoler } from '../regles.js';
import { exigerPositif } from './commun.js';
import { ageMinimalNitrification_j } from './nitrification.js';

/**
 * Charge volumique : DBO5 reçue par m³ de bassin et par jour.
 * Les mg/l valent des g/m³, donc débit × concentration / 1000 donne des kg/j.
 */
export function chargeVolumique_kgDBO5_par_m3_j(debit_m3_j, dbo5Entree_mg_l, volume_m3) {
  return (debit_m3_j * dbo5Entree_mg_l) / 1000 / volume_m3;
}

/** Charge des boues : la nourriture de chaque kilo de boues. Les g/l valent des kg/m³. */
export function chargeBoues_kgDBO5_par_kgMS_j(chargeVolumique, boues_g_l) {
  return chargeVolumique / boues_g_l;
}

/** Temps de séjour de l'eau dans le bassin, en heures. */
export function tempsSejour_h(volume_m3, debit_m3_j) {
  return (volume_m3 / debit_m3_j) * 24;
}

/** Âge des boues estimé depuis la charge : θc = 1,224 · Cb^(−1,125), éq. 6.39, p. 160. */
export function ageBoues_j(chargeBoues, R) {
  return val(R, 'ba.age_boues.coefficient') * chargeBoues ** val(R, 'ba.age_boues.exposant');
}

/**
 * Classe de charge la plus proche dans le Tab. 6.I (p. 157).
 * Le livre donne des valeurs types et non des limites. On compare donc les rapports
 * (échelle logarithmique), car les classes sont échelonnées de façon géométrique.
 */
export function classeCharge(chargeBoues, R) {
  const classes = val(R, 'ba.classes_charge');
  const ecart = (classe) => Math.abs(Math.log(chargeBoues / classe.cb));
  return classes.reduce((meilleure, classe) => (ecart(classe) < ecart(meilleure) ? classe : meilleure));
}

/**
 * Qualité d'eau attendue, par interpolation entre les colonnes du Tab. 6.III (p. 158).
 * Hors du tableau, on garde la valeur du bord et on le signale avec horsPlage.
 */
export function effluentAttendu(chargeBoues, R) {
  const tableau = val(R, 'ba.effluent');
  const resultat = { horsPlage: false };
  for (const parametre of ['dbo5', 'dco', 'nh4', 'norg', 'no3', 'n2']) {
    const { valeur, horsPlage } = interpoler(tableau.cb, tableau[parametre], chargeBoues);
    resultat[parametre] = valeur;
    resultat.horsPlage ||= horsPlage;
  }
  return resultat;
}

/** Calcul complet d'une station, avec ses alertes. */
export function analyserBouesActivees(entrees, R) {
  const { debit_m3_j, dbo5Entree_mg_l, volume_m3, boues_g_l, temperature_C } = entrees;
  exigerPositif(debit_m3_j, 'Le débit');
  exigerPositif(dbo5Entree_mg_l, 'La DBO5 en entrée');
  exigerPositif(volume_m3, 'Le volume');
  exigerPositif(boues_g_l, 'La concentration en boues');
  if (!Number.isFinite(temperature_C)) throw new Error('La température doit être un nombre.');

  const cv = chargeVolumique_kgDBO5_par_m3_j(debit_m3_j, dbo5Entree_mg_l, volume_m3);
  const cb = chargeBoues_kgDBO5_par_kgMS_j(cv, boues_g_l);
  const age = ageBoues_j(cb, R);
  const classe = classeCharge(cb, R);
  const effluent = effluentAttendu(cb, R);
  const ageMinimal = ageMinimalNitrification_j(temperature_C, R);

  // Flux journaliers de pollution, reçue et éliminée.
  const dbo5Recue_kg_j = (debit_m3_j * dbo5Entree_mg_l) / 1000;
  const dbo5Eliminee_kg_j = Math.max(0, (debit_m3_j * (dbo5Entree_mg_l - effluent.dbo5)) / 1000);

  const chargeOk = cb <= val(R, 'ba.nitrification.charge_max');
  const ageOk = age >= ageMinimal;

  const alertes = [];
  const alerter = (id, niveau, message, regle) => alertes.push({ id, niveau, message, source: citer(R, regle) });

  if (!chargeOk) {
    alerter('pas-nitrification', 'attention', 'Charge supérieure à 0,35 : pas de nitrification à attendre.', 'ba.nitrification.charge_max');
  } else if (!ageOk) {
    alerter('nitrification-froid', 'attention', `À ${temperature_C} °C, les nitrifiants ont besoin d'au moins ${ageMinimal.toFixed(1)} j d'âge de boues, sans marge. L'âge estimé est de ${age.toFixed(1)} j.`, 'nit.mu.coefficient');
  }
  if (cb >= val(R, 'ba.zone_eviter.min') && cb <= val(R, 'ba.zone_eviter.max')) {
    alerter('zone-eviter', 'danger', 'Charge entre 0,5 et 1 : plage à éviter, car la boue y décante mal.', 'ba.zone_eviter.min');
  }
  if (cb > val(R, 'ba.gonflement.charge_risque')) {
    alerter('gonflement', 'attention', 'Charge supérieure à 0,5 : toutes les boues activées risquent de gonfler, en particulier en mélange complet.', 'ba.gonflement.charge_risque');
  }
  if (age > val(R, 'ba.age_mauvais.min') && age < val(R, 'ba.age_mauvais.max')) {
    alerter('age-court', 'attention', 'Âge des boues entre 0,4 et 3 j : boues de mauvaise qualité et floculation insuffisante.', 'ba.age_mauvais.max');
  }
  if (age >= val(R, 'ba.age_brulee')) {
    alerter('boue-brulee', 'attention', "Boue très âgée, dite « brûlée » : elle flocule mal et peut gêner le clarificateur.", 'ba.age_brulee');
  }

  return {
    chargeVolumique_kgDBO5_par_m3_j: cv,
    chargeBoues_kgDBO5_par_kgMS_j: cb,
    tempsSejour_h: tempsSejour_h(volume_m3, debit_m3_j),
    ageBoues_j: age,
    ageMinimalNitrification_j: ageMinimal,
    classe,
    effluent,
    nitrificationPossible: chargeOk && ageOk,
    oxygene_kg_j: { min: classe.o2Min * dbo5Recue_kg_j, max: classe.o2Max * dbo5Recue_kg_j },
    boues_kg_j: classe.bouesProduites * dbo5Eliminee_kg_j,
    alertes,
  };
}
