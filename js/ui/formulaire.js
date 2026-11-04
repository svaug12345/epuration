// Outils communs aux pages de calcul : lire un formulaire, afficher résultats et alertes.
// Ce module ne contient aucun calcul : il relie la page au moteur.

/** Format français : virgule décimale et chiffres significatifs raisonnables. */
export function nombre(valeur, decimales = 2) {
  return valeur.toLocaleString('fr-FR', { maximumFractionDigits: decimales });
}

/** Lit tous les champs numériques d'un formulaire dans un objet { nom: nombre }. */
export function lireNombres(formulaire) {
  const valeurs = {};
  for (const champ of formulaire.querySelectorAll('input[name]')) {
    // On accepte aussi la virgule, plus naturelle en français sur un clavier de téléphone.
    valeurs[champ.name] = Number(champ.value.replace(',', '.'));
  }
  return valeurs;
}

/** Affiche une liste de résultats : [{ valeur: '12,5 j', libelle: 'Âge des boues' }]. */
export function afficherResultats(conteneur, resultats) {
  conteneur.className = 'resultats';
  conteneur.replaceChildren(...resultats.map(({ valeur, libelle }) => {
    const bloc = document.createElement('div');
    bloc.className = 'resultat';
    const fort = document.createElement('b');
    fort.textContent = valeur;
    const legende = document.createElement('span');
    legende.textContent = libelle;
    bloc.append(fort, legende);
    return bloc;
  }));
}

/** Crée le bloc d'une alerte. Le mot en tête évite de reposer sur la seule couleur. */
function blocAlerte({ niveau, message, source }) {
  const mots = { danger: 'À corriger', attention: 'Attention', ok: 'Correct', info: 'À savoir' };
  const bloc = document.createElement('div');
  bloc.className = `alerte ${niveau}`;
  const texte = document.createElement('p');
  const mot = document.createElement('strong');
  mot.textContent = `${mots[niveau] ?? 'À savoir'} : `;
  texte.append(mot, message);
  bloc.append(texte);
  if (source) {
    const petit = document.createElement('small');
    petit.textContent = `Source : ${source}`;
    bloc.append(petit);
  }
  return bloc;
}

/** Affiche les alertes, ou un message rassurant s'il n'y en a aucune. */
export function afficherAlertes(conteneur, alertes, messageSiRien = 'Aucune alerte avec ces valeurs.') {
  const liste = alertes.length ? alertes : [{ niveau: 'ok', message: messageSiRien }];
  conteneur.replaceChildren(...liste.map(blocAlerte));
}

/**
 * Branche un formulaire sur une fonction de calcul : recalcul à chaque frappe,
 * et message clair si le moteur refuse une valeur.
 */
export function brancher(formulaire, zoneErreur, calculer) {
  const lancer = () => {
    try {
      zoneErreur.replaceChildren();
      calculer(lireNombres(formulaire));
    } catch (erreur) {
      zoneErreur.replaceChildren(blocAlerte({ niveau: 'danger', message: erreur.message }));
    }
  };
  formulaire.addEventListener('input', lancer);
  formulaire.addEventListener('submit', (evenement) => evenement.preventDefault());
  lancer();
}
