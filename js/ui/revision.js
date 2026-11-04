// Révision espacée : les cartes viennent des quiz. Une carte réussie revient plus tard,
// une carte ratée revient vite. C'est la méthode de Leitner, qui est efficace pour mémoriser.
import { MODULES } from '../donnees.js';
import { picto } from '../pictos.js';
import { charger, sauver, noterCarte, cartesDues, repartitionBoites, nouveauxBadges } from '../progression.js';
import { annoncer, actualiserPoints } from './habillage.js';
import { element, confettis } from './composants.js';

const RACINE = new URL('../../', import.meta.url);
const modules = await Promise.all(MODULES.map(async (m) => (await fetch(new URL(`data/modules/${m.slug}.json`, RACINE))).json()));
const toutes = modules.flatMap((m) => m.quiz.map((q, i) => ({
  id: `${m.slug}-${i}`, slug: m.slug, titre: m.titre, question: q.question,
  reponse: q.choix[q.bonne], explication: q.explication, source: q.source,
})));

const zone = document.querySelector('#carte');
const selecteur = document.querySelector('#module');
const zoneBoites = document.querySelector('#boites');
for (const m of modules) {
  const o = document.createElement('option');
  o.value = m.slug;
  o.textContent = `${m.numero}. ${m.titre}`;
  selecteur.append(o);
}

function melanger(liste) {
  const c = [...liste];
  for (let i = c.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

const filtrees = () => (selecteur.value ? toutes.filter((c) => c.slug === selecteur.value) : toutes);
let paquet = [];

function afficherBoites() {
  const etat = charger();
  const ids = filtrees().map((c) => c.id);
  const rep = repartitionBoites(etat, ids);
  const noms = ['Nouvelles', 'Demain', '3 j', '7 j', '16 j', '35 j'];
  zoneBoites.replaceChildren(...rep.map((n, i) => {
    const d = document.createElement('div');
    d.append(element('b', '', String(n)), noms[i]);
    return d;
  }));
}

function nouveauPaquet() {
  const etat = charger();
  const dues = new Set(cartesDues(etat, filtrees().map((c) => c.id)));
  paquet = melanger(filtrees().filter((c) => dues.has(c.id)));
  afficher();
}

function terminer() {
  const fin = element('div', 'carte fin-lecon');
  fin.style.display = 'block';
  const med = element('span', 'medaille vert');
  med.append(picto('coche', 40));
  fin.append(med, element('h2', '', 'Tout est révisé !'));
  fin.lastChild.style.marginTop = '0';
  fin.append(element('p', 'sous', 'Revenez demain : les cartes reviendront au bon moment.'));
  const encore = element('button', 'bouton secondaire', 'Tout revoir quand même');
  encore.type = 'button';
  encore.style.marginTop = '1rem';
  encore.addEventListener('click', () => { paquet = melanger(filtrees()); afficher(); });
  fin.append(encore);
  zone.replaceChildren(fin);
  confettis(fin);
}

function afficher() {
  afficherBoites();
  if (!paquet.length) { terminer(); return; }
  const carte = paquet[0];
  const bloc = element('div', 'retourne');
  const interieur = element('div', 'retourne-int');
  const avant = element('div', 'face avant');
  avant.append(element('p', '', `${carte.titre} · ${paquet.length} à revoir`));
  avant.lastChild.style.cssText = 'font-size:.82rem;opacity:.8;margin:0 0 .6rem';
  avant.append(element('p', 'question-texte', carte.question));
  const arriere = element('div', 'face arriere');
  arriere.append(element('p', 'reponse-texte', carte.reponse), element('p', '', carte.explication));
  if (carte.source) arriere.append(element('p', 'discret', `Source : ${carte.source}`));
  // La face cachée n'est pas lue par les lecteurs d'écran.
  arriere.inert = true;
  interieur.append(avant, arriere);
  bloc.append(interieur);

  const actions = element('div', 'boutons');
  const voir = element('button', 'bouton', 'Voir la réponse');
  voir.type = 'button';
  voir.style.flex = '1';
  actions.append(voir);
  const noter = (reussi) => {
    const etat = charger();
    noterCarte(etat, carte.id, reussi);
    sauver(etat);
    actualiserPoints();
    if (reussi) annoncer('+2 points');
    for (const b of nouveauxBadges(etat)) { annoncer(`Badge : ${b.nom}`, 'trophee'); sauver(etat); }
    paquet.shift();
    if (!reussi) paquet.push(carte); // une carte ratée revient dans la même séance
    afficher();
  };
  voir.addEventListener('click', () => {
    bloc.classList.add('vue');
    avant.inert = true;
    arriere.inert = false;
    const rate = element('button', 'bouton secondaire');
    rate.type = 'button';
    rate.style.flex = '1';
    rate.append(picto('croix', 18), 'À revoir');
    rate.addEventListener('click', () => noter(false));
    const ok = element('button', 'bouton');
    ok.type = 'button';
    ok.style.flex = '1';
    ok.append(picto('coche', 18), 'Je savais');
    ok.addEventListener('click', () => noter(true));
    actions.replaceChildren(rate, ok);
    ok.focus();
  });
  zone.replaceChildren(bloc, actions);
}

selecteur.addEventListener('change', nouveauPaquet);
nouveauPaquet();
