// Page d'accueil : animation d'ambiance, reprise du parcours, listes des modules et des outils.
import { MODULES, OUTILS } from '../donnees.js';
import { picto } from '../pictos.js';
import { charger, avancement, serie, niveau } from '../progression.js';
import { lancerVisuel } from '../anim/lecteur.js';
import { activerApparitions } from './habillage.js';
import { carteModule, carteOutil, element } from './composants.js';

document.querySelectorAll('[data-picto]').forEach((m) => m.append(picto(m.dataset.picto, 24)));

lancerVisuel(document.querySelector('#ambiance'), { type: 'ambiance' }, { duree: 1e9, boucle: false });

const etat = charger();
const actions = document.querySelector('#actions-heros');
const total = MODULES.reduce((s, m) => s + m.etapes, 0);
const vues = Object.values(etat.etapes).reduce((s, v) => s + v.length, 0);

const principal = document.createElement('a');
principal.className = 'bouton';
if (etat.dernier) {
  const m = MODULES.find((x) => x.slug === etat.dernier.slug);
  principal.href = `modules/${m.slug}.html`;
  principal.append(picto('lecture', 18), 'Reprendre');
} else {
  principal.href = 'modules/bases.html';
  principal.append(picto('lecture', 18), 'Commencer le parcours');
}
const simulateur = document.createElement('a');
simulateur.className = 'bouton verre';
simulateur.href = 'outils/boues-activees.html';
simulateur.append(picto('jauge', 18), 'Essayer le simulateur');
actions.append(principal, simulateur);

// Tableau de bord, seulement si la personne a déjà commencé.
if (vues > 0) {
  const n = niveau(etat.xp);
  const bloc = element('section', 'carte bilan');
  bloc.style.margin = '0 0 1.5rem';
  const anneau = element('div', 'anneau');
  const pct = Math.round((100 * vues) / total);
  anneau.style.setProperty('--p', pct);
  anneau.append(element('b', '', `${pct} %`));
  const texte = document.createElement('div');
  texte.append(element('strong', 'titre-carte', `Niveau ${n.niveau} · ${etat.xp} points`));
  texte.append(element('span', 'sous', `${vues} étapes sur ${total} · ${serie(etat)} jour(s) d'affilée · ${etat.badges.length} badge(s)`));
  bloc.append(anneau, texte);
  document.querySelector('#reprise').append(bloc);
}

document.querySelector('#liste-modules').append(...MODULES.map((m, i) => {
  const li = document.createElement('li');
  li.append(carteModule(m, i, avancement(etat, m.slug, m.etapes), ''));
  return li;
}));
document.querySelector('#liste-outils').append(...OUTILS.map((o) => {
  const li = document.createElement('li');
  li.append(carteOutil(o, ''));
  return li;
}));
activerApparitions();
