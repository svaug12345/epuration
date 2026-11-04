// Relie les pages de calcul simples à leur moteur.
// La page indique son calculateur avec <main data-calculateur="...">. Chaque entrée
// ci-dessous transforme les résultats du moteur en lignes affichées.
import { chargerRegles } from '../regles.js';
import { analyserLit } from '../moteur/lits-bacteriens.js';
import { analyserLagune } from '../moteur/lagunage.js';
import { analyserDigesteur } from '../moteur/methanisation.js';
import { analyserAzote } from '../moteur/nitrification.js';
import { garantiesPossibles } from '../moteur/choix-procede.js';
import { afficherResultats, afficherAlertes, brancher, nombre } from './formulaire.js';

const R = await chargerRegles();
const $ = (selecteur) => document.querySelector(selecteur);

const CALCULATEURS = {
  lit(entrees) {
    const biodisque = $('#biodisque').checked ? 1 : 0;
    const r = analyserLit({ ...entrees, biodisque }, R);
    afficherResultats($('#resultats'), [
      { valeur: nombre(r.flux_gDBO5_par_m2_j, 1), libelle: 'Flux sur le biofilm (g DBO5/m².j)' },
      { valeur: nombre(r.chargeVolumique_kgDBO5_par_m3_j, 2), libelle: 'Charge volumique (kg DBO5/m³.j)' },
      { valeur: nombre(r.chargeHydraulique_m_h, 2), libelle: 'Charge hydraulique (m/h)' },
      { valeur: `${nombre(r.forceRincage_mm, 1)} mm`, libelle: 'Force de rinçage (optimum : 2 mm)' },
    ]);
    afficherAlertes($('#alertes'), r.alertes);
  },

  azote(entrees) {
    const r = analyserAzote(entrees, R);
    afficherResultats($('#resultats'), [
      { valeur: `${nombre(r.ageMinimal_j, 1)} j`, libelle: 'Âge minimal des boues, sans marge' },
      { valeur: `${nombre(r.tauxCroissance_par_j, 2)} /j`, libelle: 'Croissance des nitrifiants' },
      { valeur: `${nombre(r.oxygene_kg_j, 0)} kg/j`, libelle: 'Oxygène pour la nitrification' },
      { valeur: `${nombre(r.methanol_kg_j, 0)} kg/j`, libelle: 'Méthanol pour la dénitrification' },
    ]);
    afficherAlertes($('#alertes'), r.alertes);
  },

  digesteur(entrees) {
    const r = analyserDigesteur(entrees, R);
    afficherResultats($('#resultats'), [
      { valeur: `${nombre(r.age_j, 1)} j`, libelle: 'Âge des boues θc' },
      { valeur: `${nombre(r.volumePratiqueMin_m3, 0)} à ${nombre(r.volumePratiqueMax_m3, 0)} m³`, libelle: 'Volume utile pour 10 à 30 jours' },
    ]);
    afficherAlertes($('#alertes'), r.alertes);
  },

  lagune(entrees) {
    const r = analyserLagune(entrees, R);
    afficherResultats($('#resultats'), [
      { valeur: `${nombre(r.dbo5Sortie_mg_l, 0)} mg/l`, libelle: 'DBO5 de sortie estimée' },
      { valeur: `${nombre(r.rendement_pct, 0)} %`, libelle: 'Rendement sur la DBO5' },
      { valeur: `${nombre(r.k_par_j, 2)} /j`, libelle: 'Constante k à cette température' },
      { valeur: `${nombre(r.surface_m2, 0)} m²`, libelle: 'Surface à 5 m²/EH' },
      { valeur: `${nombre(r.surfaceAllemande_m2, 0)} m²`, libelle: 'Surface à 10 m²/EH (norme allemande)' },
    ]);
    afficherAlertes($('#alertes'), r.alertes);
  },

  choix({ cible_mg_l }) {
    const lignes = garantiesPossibles(cible_mg_l, R);
    afficherResultats($('#resultats'), lignes.map((l) => ({
      valeur: `≤ ${nombre(l.cvMax, 2)}`,
      libelle: `${l.procede} : charge volumique à ne pas dépasser (kg DBO5/m³.j), pour ${l.dbo80} mg/l en sortie et ${l.dboMoyenne} mg/l en moyenne`,
    })));
    afficherAlertes($('#alertes'), lignes.length ? [] : [{
      niveau: 'attention',
      message: 'Aucune ligne du tableau ne garantit une valeur aussi basse. Le meilleur repère est de 25 mg/l, en boues activées.',
      source: 'Edeline 1997, p. 294',
    }], 'Ces repères datent de 1997 et portent sur des installations de l\'époque.');
  },
};

const nom = $('main').dataset.calculateur;
brancher($('#formulaire'), $('#erreur'), CALCULATEURS[nom]);
