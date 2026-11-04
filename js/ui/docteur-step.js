// Docteur STEP sous forme de conversation : une question à la fois, puis une ordonnance.
import { demarrer, repondre, lireNoeud } from '../diagnostic/moteur.js';
import { picto } from '../pictos.js';
import { element, medaille } from './composants.js';

const zone = document.querySelector('#diagnostic');
const arbre = await (await fetch(new URL('../../data/diagnostic.json', import.meta.url))).json();

const PICTOS_SYMPTOMES = {
  'boue-decante-mal': 'boues', 'effluent-trouble': 'vague', 'boues-flottantes': 'bulles', nitrification: 'atome',
  'lit-colmate': 'couches', digesteur: 'flamme', lagune: 'soleil',
};

// Le fil garde chaque question posée et chaque réponse donnée.
let fil = [];

function afficherAccueil() {
  fil = [];
  const liste = element('ul', 'grille deux');
  for (const s of arbre.symptomes) {
    const carte = element('button', 'carte');
    carte.type = 'button';
    const texte = document.createElement('div');
    texte.append(element('strong', 'titre-carte', s.titre), element('span', 'sous', s.description));
    carte.append(medaille(PICTOS_SYMPTOMES[s.id] ?? 'stetho'), texte);
    carte.addEventListener('click', () => afficherNoeud(demarrer(arbre, s.id), s.titre));
    const li = document.createElement('li');
    li.append(carte);
    liste.append(li);
  }
  const venir = element('p', 'discret', `Pas encore couverts : ${arbre.aVenir.join(' ; ')}.`);
  zone.replaceChildren(element('h2', '', 'Que constatez-vous ?'), liste, venir);
}

function ordonnance(noeud) {
  const bloc = element('section', 'ordonnance');
  const tete = document.createElement('div');
  tete.style.cssText = 'display:flex;gap:.8rem;align-items:center;margin-bottom:.6rem';
  const titre = document.createElement('div');
  titre.append(element('p', 'surtitre', 'Diagnostic probable'));
  titre.lastChild.style.margin = '0';
  titre.append(element('h2', '', noeud.cause));
  titre.lastChild.style.cssText = 'margin:0;font-size:1.3rem';
  tete.append(medaille('stetho', 'mauve'), titre);
  bloc.append(tete, element('p', '', noeud.explication), element('h3', '', 'Que faire ?'));
  const remedes = document.createElement('ul');
  for (const r of noeud.remedes) remedes.append(element('li', '', r));
  bloc.append(remedes, element('p', 'discret', `Source : ${noeud.sources.join(' ; ')}`));
  return bloc;
}

function afficherNoeud(noeud, symptome) {
  if (symptome) fil.push({ vous: symptome });
  const conversation = element('div', 'fil');
  for (const e of fil) {
    if (e.docteur) conversation.append(element('div', 'bulle docteur', e.docteur));
    if (e.vous) conversation.append(element('div', 'bulle vous', e.vous));
  }
  const contenu = [conversation];

  if (noeud.reponses) {
    const question = element('div', 'bulle docteur');
    question.append(element('strong', '', noeud.question));
    if (noeud.aide) question.append(element('div', 'discret', noeud.aide));
    conversation.append(question);
    const reponses = element('div', 'reponses');
    noeud.reponses.forEach((r, i) => {
      const b = element('button', 'bouton secondaire', r.texte);
      b.type = 'button';
      b.addEventListener('click', () => {
        fil.push({ docteur: noeud.question, vous: r.texte, id: noeud.id });
        afficherNoeud(repondre(arbre, noeud.id, i));
      });
      reponses.append(b);
    });
    contenu.push(reponses);
  } else {
    const espace = document.createElement('div');
    espace.style.height = '.6rem';
    contenu.push(espace, ordonnance(noeud));
  }

  const actions = element('div', 'boutons');
  if (fil.some((e) => e.id)) {
    const retour = element('button', 'bouton secondaire');
    retour.type = 'button';
    retour.append(picto('retour', 18), 'Revenir');
    retour.addEventListener('click', () => {
      const precedent = fil.pop();
      afficherNoeud(lireNoeud(arbre, precedent.id));
    });
    actions.append(retour);
  }
  const nouveau = element('button', 'bouton secondaire', 'Nouveau diagnostic');
  nouveau.type = 'button';
  nouveau.addEventListener('click', afficherAccueil);
  actions.append(nouveau);
  contenu.push(actions);
  zone.replaceChildren(...contenu);
}

afficherAccueil();
