// Relie la page du calculateur boues activées au moteur de calcul.
import { chargerRegles, val } from '../regles.js';
import { analyserBouesActivees, effluentAttendu } from '../moteur/boues-activees.js';
import { afficherResultats, afficherAlertes, brancher, nombre } from './formulaire.js';
import { dessinerCourbes } from './graphique.js';

const R = await chargerRegles();
const $ = (selecteur) => document.querySelector(selecteur);

function calculer(entrees) {
  const r = analyserBouesActivees(entrees, R);

  afficherResultats($('#resultats'), [
    { valeur: nombre(r.chargeBoues_kgDBO5_par_kgMS_j, 3), libelle: 'Charge des boues Cb (kg DBO5/kg MS.j)' },
    { valeur: nombre(r.chargeVolumique_kgDBO5_par_m3_j, 2), libelle: 'Charge volumique Cv (kg DBO5/m³.j)' },
    { valeur: `${nombre(r.ageBoues_j, 1)} j`, libelle: 'Âge des boues estimé θc' },
    { valeur: `${nombre(r.tempsSejour_h, 1)} h`, libelle: 'Temps de séjour θl' },
    {
      // Une fourchette n'a de sens que si ses deux bornes diffèrent.
      valeur: r.oxygene_kg_j.min === r.oxygene_kg_j.max
        ? nombre(r.oxygene_kg_j.min, 0)
        : `${nombre(r.oxygene_kg_j.min, 0)} à ${nombre(r.oxygene_kg_j.max, 0)}`,
      libelle: "Besoin d'oxygène (kg O2/j, ordre de grandeur)",
    },
    { valeur: `${r.classe.bouesSens} ${nombre(r.boues_kg_j, 0)}`, libelle: 'Boues produites (kg/j, ordre de grandeur)' },
  ]);

  const classe = $('#classe');
  classe.replaceChildren();
  const titre = document.createElement('strong');
  titre.textContent = `Classe de charge la plus proche : ${r.classe.nom}`;
  const degre = document.createElement('p');
  degre.style.margin = '.2rem 0 .3rem';
  degre.textContent = r.classe.degre;
  const nitrif = document.createElement('p');
  nitrif.style.margin = '0';
  nitrif.textContent = r.nitrificationPossible
    ? 'Nitrification : possible avec ces valeurs.'
    : 'Nitrification : pas à attendre avec ces valeurs.';
  classe.append(titre, degre, nitrif);

  afficherAlertes($('#alertes'), r.alertes);

  const e = r.effluent;
  afficherResultats($('#effluent'), [
    { valeur: `${nombre(e.dbo5, 0)} mg/l`, libelle: 'DBO5' },
    { valeur: `${nombre(e.dco, 0)} mg/l`, libelle: 'DCO' },
    { valeur: `${nombre(e.nh4, 1)} mg/l`, libelle: 'Azote ammoniacal (N-NH4)' },
    { valeur: `${nombre(e.no3, 1)} mg/l`, libelle: 'Azote nitrique (N-NO3)' },
  ]);
  if (e.horsPlage) {
    const note = document.createElement('div');
    note.className = 'alerte attention';
    const texte = document.createElement('p');
    texte.textContent = 'Attention : la charge sort de la plage connue (0,15 à 1). Les valeurs affichées sont celles du bord, pas une prévision.';
    note.append(texte);
    $('#effluent').after(note);
    $('#effluent').dataset.note = 'oui';
  }

  // Le curseur démarre sur la charge calculée, tant qu'elle reste dans la plage.
  deplacer(r.chargeBoues_kgDBO5_par_kgMS_j);
}

// --- Graphique ---
const tableau = val(R, 'ba.effluent');
const lireValeurs = (cb) => {
  const e = effluentAttendu(cb, R);
  return [e.dbo5, e.nh4, e.no3];
};
const placer = dessinerCourbes($('#graphique'), {
  xs: tableau.cb,
  series: [
    { libelle: 'DBO5', ys: tableau.dbo5 },
    { libelle: 'N-NH4', ys: tableau.nh4 },
    { libelle: 'N-NO3', ys: tableau.no3 },
  ],
  titreX: 'Charge des boues (kg DBO5/kg MS.j)',
  titreY: 'Concentration de sortie (mg/l)',
  lireValeurs,
});

const curseur = $('#curseur');
function deplacer(cb) {
  const borne = Math.min(Number(curseur.max), Math.max(Number(curseur.min), cb));
  curseur.value = borne;
  placer(borne);
}
curseur.addEventListener('input', () => placer(Number(curseur.value)));

brancher($('#formulaire'), $('#erreur'), (entrees) => {
  // On retire l'éventuelle note hors plage du calcul précédent.
  if ($('#effluent').dataset.note) {
    $('#effluent').nextElementSibling?.remove();
    delete $('#effluent').dataset.note;
  }
  calculer(entrees);
});
