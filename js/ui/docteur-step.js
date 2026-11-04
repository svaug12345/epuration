// Interface de Docteur STEP : une question à la fois, puis la conclusion.
import { demarrer, repondre } from '../diagnostic/moteur.js';

const zone = document.querySelector('#diagnostic');
const reponse = await fetch(new URL('../../data/diagnostic.json', import.meta.url));
const arbre = await reponse.json();

// Le chemin parcouru permet de revenir en arrière et de résumer les réponses données.
let historique = [];

const element = (balise, texte, classe) => {
  const e = document.createElement(balise);
  if (texte) e.textContent = texte;
  if (classe) e.className = classe;
  return e;
};

const bouton = (texte, action, classe = 'bouton') => {
  const b = element('button', texte, classe);
  b.type = 'button';
  b.addEventListener('click', action);
  return b;
};

function afficherAccueil() {
  historique = [];
  const liste = element('ul', '', 'cartes');
  for (const symptome of arbre.symptomes) {
    const carte = element('button', '', 'carte');
    carte.type = 'button';
    carte.style.cssText = 'display:block;width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer;border-left:4px solid var(--accent)';
    const titre = element('strong', symptome.titre);
    titre.style.cssText = 'display:block;color:var(--accent-texte)';
    carte.append(titre, element('span', symptome.description, 'discret'));
    carte.addEventListener('click', () => afficherNoeud(demarrer(arbre, symptome.id)));
    const ligne = document.createElement('li');
    ligne.append(carte);
    liste.append(ligne);
  }
  const venir = element('p', `Pas encore couverts : ${arbre.aVenir.join(' ; ')}.`, 'discret');
  zone.replaceChildren(element('h2', 'Que constatez-vous ?'), liste, venir);
}

function afficherQuestion(noeud) {
  const bloc = element('div', '', 'carte');
  bloc.append(element('h2', noeud.question));
  bloc.lastChild.style.fontSize = '1.1rem';
  if (noeud.aide) bloc.append(element('p', noeud.aide, 'discret'));
  const choix = element('div', '', 'boutons');
  choix.style.flexDirection = 'column';
  noeud.reponses.forEach((r, i) => {
    choix.append(bouton(r.texte, () => {
      historique.push({ id: noeud.id, texte: r.texte, question: noeud.question });
      afficherNoeud(repondre(arbre, noeud.id, i));
    }, 'bouton secondaire'));
  });
  bloc.append(choix);
  return bloc;
}

function afficherConclusion(noeud) {
  const bloc = element('div', '', 'carte');
  bloc.style.borderTop = '4px solid var(--accent)';
  bloc.append(element('p', 'Cause probable', 'discret'));
  bloc.lastChild.style.margin = '0';
  bloc.append(element('h2', noeud.cause));
  bloc.lastChild.style.marginTop = '0';
  bloc.append(element('p', noeud.explication));
  bloc.append(element('h3', 'Que faire ?'));
  const remedes = document.createElement('ul');
  for (const remede of noeud.remedes) remedes.append(element('li', remede));
  bloc.append(remedes);
  bloc.append(element('p', `Source : ${noeud.sources.join(' ; ')}`, 'discret'));
  return bloc;
}

function afficherNoeud(noeud) {
  const contenu = [noeud.reponses ? afficherQuestion(noeud) : afficherConclusion(noeud)];
  if (historique.length && !noeud.reponses) {
    const resume = element('details');
    resume.append(element('summary', 'Vos réponses'));
    const liste = document.createElement('ul');
    for (const etape of historique) liste.append(element('li', `${etape.question} ${etape.texte}.`));
    resume.append(liste);
    contenu.push(resume);
  }
  const actions = element('div', '', 'boutons');
  if (historique.length) {
    actions.append(bouton('Revenir', () => {
      const precedent = historique.pop();
      afficherNoeud({ id: precedent.id, ...arbre.noeuds[precedent.id] });
    }, 'bouton secondaire'));
  }
  actions.append(bouton('Nouveau diagnostic', afficherAccueil, 'bouton secondaire'));
  contenu.push(actions);
  zone.replaceChildren(...contenu);
  zone.scrollIntoView({ block: 'nearest' });
}

afficherAccueil();
