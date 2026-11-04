// Calculs purs des lits bactériens. Source : Edeline 1997, chap. 5, p. 106-107.
import { val, citer } from '../regles.js';
import { exigerPositif } from './commun.js';

export function analyserLit(entrees, R) {
  const { debit_m3_j, dbo5Entree_mg_l, surface_m2, hauteur_m, surfaceSpecifique_m2_m3, bras, tours_par_h, biodisque } = entrees;
  exigerPositif(debit_m3_j, 'Le débit');
  exigerPositif(dbo5Entree_mg_l, 'La DBO5 en entrée');
  exigerPositif(surface_m2, 'La surface');
  exigerPositif(hauteur_m, 'La hauteur');
  exigerPositif(surfaceSpecifique_m2_m3, 'La surface spécifique');
  exigerPositif(bras, 'Le nombre de bras');
  exigerPositif(tours_par_h, 'La vitesse de rotation');

  const volume_m3 = surface_m2 * hauteur_m;
  const dbo5_kg_j = (debit_m3_j * dbo5Entree_mg_l) / 1000;
  const cv = dbo5_kg_j / volume_m3;
  // Flux sur le biofilm : la DBO5 répartie sur toute la surface de support.
  // ×1000 pour passer de kg à g, /σ pour passer du m³ de lit au m² de support.
  const flux = (cv * 1000) / surfaceSpecifique_m2_m3;
  const chargeHydraulique_m_h = debit_m3_j / surface_m2 / 24;
  // S = Ch / (a·n) avec Ch en mm/h : c'est la hauteur d'eau déposée à chaque passage de bras.
  const forceRincage_mm = (chargeHydraulique_m_h * 1000) / (bras * tours_par_h);

  const alertes = [];
  const alerter = (id, niveau, message, regle) => alertes.push({ id, niveau, message, source: citer(R, regle) });

  const regleNitrif = biodisque ? 'lb.flux_nitrification_disque' : 'lb.flux_nitrification_lit';
  if (flux > val(R, regleNitrif)) {
    alerter('pas-nitrification', 'attention', `Flux supérieur à ${val(R, regleNitrif)} g/m².j : pas de nitrification complète à attendre.`, regleNitrif);
  }
  if (flux > val(R, 'lb.flux_nitrification_lit')) {
    alerter('decanteur', 'attention', 'Au-delà de 2 g/m².j, les boues ne sont pas stabilisées : un décanteur secondaire est indispensable.', 'lb.flux_nitrification_lit');
  }
  if (cv > val(R, 'lb.charge_atv')) {
    alerter('charge-atv', 'info', 'Charge volumique supérieure à la recommandation allemande ATV de 0,4 kg DBO5/m³.j.', 'lb.charge_atv');
  }
  if (forceRincage_mm > 2 * val(R, 'lb.rincage_optimum')) {
    alerter('rincage-fort', 'attention', "Force de rinçage très au-dessus de l'optimum de 2 mm : le film risque d'être arraché.", 'lb.rincage_optimum');
  } else if (forceRincage_mm < val(R, 'lb.rincage_optimum') / 2) {
    alerter('rincage-faible', 'attention', "Force de rinçage très en dessous de l'optimum de 2 mm : le film s'épaissit et des mares peuvent se former.", 'lb.rincage_optimum');
  }
  if (chargeHydraulique_m_h < val(R, 'lb.irrigation_min')) {
    alerter('irrigation', 'info', "Irrigation sous les 0,8 m/h souvent cités. Ce n'est pas forcément un défaut : des lits à faible charge fonctionnent bien bien plus bas.", 'lb.irrigation_min');
  }

  return {
    volume_m3,
    chargeVolumique_kgDBO5_par_m3_j: cv,
    flux_gDBO5_par_m2_j: flux,
    chargeHydraulique_m_h,
    forceRincage_mm,
    alertes,
  };
}
