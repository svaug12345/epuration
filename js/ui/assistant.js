// La grande page de Jim (outils/assistant.html) : gros bouton d'appel, cartes d'idées, sous-titres.
// Toute la partie « conversation » est partagée avec le petit panneau des autres pages :
// voir js/jim/session.js.
import { picto } from '../pictos.js';
import { element } from './composants.js';
import { annoncer } from './habillage.js';
import { messageErreur, ouvrirSession, pourEcran } from '../jim/session.js';

// Idées de départ : quatre façons de se servir de Jim.
const IDEES = [
  { picto: 'ampoule', titre: 'Comprendre', phrase: "Explique-moi simplement ce qu'est l'âge des boues." },
  { picto: 'balance', titre: 'Vérifier une hypothèse', phrase: 'Si je double la charge de ma station, la nitrification tient-elle encore ?' },
  { picto: 'stetho', titre: 'Diagnostiquer', phrase: "Mon indice de boue est à 250 millilitres par gramme : qu'est-ce que ça veut dire ?" },
  { picto: 'cible', titre: 'Me tester', phrase: 'Pose-moi trois questions sur le lagunage, et corrige-moi.' },
];

const bouton = document.querySelector('#bouton-appel');
const icone = document.querySelector('#icone-appel');
const libelle = document.querySelector('#libelle');
const etatAppel = document.querySelector('#etat-appel');
const fil = document.querySelector('#sous-titres');
const titreFil = document.querySelector('#titre-fil');

let session = null;       // la conversation en cours (null = pas d'appel)
let dernierEnvoi = '';    // dernière phrase envoyée par une carte (pour ne pas l'afficher deux fois)

/** Pose les classes d'état sur <body> ; le CSS anime le gros bouton. */
function etat(nom) {
  document.body.classList.remove('connexion', 'en-ligne', 'parle', 'ecoute');
  if (nom) document.body.classList.add(...nom.split(' '));
}

function sousTitre(source, texte) {
  // Le kit peut renvoyer la phrase d'une carte d'idée déjà affichée : on ne la double pas.
  if (source !== 'ai' && texte === dernierEnvoi) { dernierEnvoi = ''; return; }
  titreFil.hidden = false;
  const jim = source === 'ai';
  const b = element('div', `bulle ${jim ? 'docteur' : 'vous'}`, jim ? pourEcran(texte) : texte);
  fil.append(b);
  b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function repos(message = 'Conversation terminée. Vous pouvez en relancer une quand vous voulez.') {
  session = null;
  etat(null);
  icone.replaceChildren(picto('micro', 40));
  libelle.textContent = 'Parler à Jim';
  etatAppel.textContent = message;
}

async function basculer() {
  if (session) { session.arreter(); return; }
  if (document.body.classList.contains('connexion')) return;
  etat('connexion');
  libelle.textContent = 'Connexion…';
  etatAppel.textContent = '';
  fil.replaceChildren();
  titreFil.hidden = true;
  try {
    session = await ouvrirSession({
      surEtat: (e) => {
        etat(`en-ligne ${e}`);
        icone.replaceChildren(picto('croix', 40));
        libelle.textContent = 'Raccrocher';
        etatAppel.textContent = e === 'parle' ? 'Jim parle… (vous pouvez le couper)' : 'À vous, Jim vous écoute';
      },
      surMessage: sousTitre,
      surFin: () => repos(),
      surErreur: (e) => { console.error(e); repos(messageErreur(e)); },
    }, { suivre: false }); // ici la page ne change pas : seuls les sous-titres bougent
  } catch (e) {
    console.error(e);
    repos(messageErreur(e));
  }
}

repos('Autorisez le micro quand le navigateur le demande.');
bouton.addEventListener('click', basculer);

// Cartes d'idées : pendant un appel, un toucher envoie la phrase à Jim comme si vous l'aviez dite.
document.querySelector('#idees').append(...IDEES.map((idee) => {
  const carte = element('button', 'carte');
  carte.type = 'button';
  const texte = document.createElement('div');
  texte.append(element('strong', 'titre-carte', idee.titre), element('span', 'sous', `« ${idee.phrase} »`));
  const m = element('span', 'medaille mauve');
  m.append(picto(idee.picto, 22));
  carte.append(m, texte);
  carte.addEventListener('click', () => {
    if (!session) { annoncer("Lancez d'abord l'appel avec le gros bouton", 'micro'); return; }
    sousTitre('user', idee.phrase); // affichée d'abord…
    dernierEnvoi = idee.phrase;     // …puis mémorisée, pour ignorer l'éventuel écho du kit
    session.envoyer(idee.phrase);
  });
  const li = document.createElement('li');
  li.append(carte);
  return li;
}));

addEventListener('pagehide', () => session?.arreter());
