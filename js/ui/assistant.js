// Assistant vocal : une conversation à voix haute avec l'agent ElevenLabs « Assistant Épuration ».
//
// Comment ça marche ?
//  1. Au toucher du bouton, le navigateur demande l'accès au micro.
//  2. On charge alors seulement le kit (SDK) d'ElevenLabs depuis un CDN : la page reste légère
//     tant qu'on n'appelle pas.
//  3. Le SDK ouvre une liaison avec l'agent : votre voix part, la sienne revient, et on reçoit
//     au passage le texte de chaque phrase, qu'on affiche en sous-titres.
// Tout le « cerveau » (consignes, base de connaissances, voix) est réglé côté ElevenLabs :
// voir outils/assistant/LISEZMOI.md.
import { picto } from '../pictos.js';
import { element } from './composants.js';
import { annoncer } from './habillage.js';

// Identifiant public de l'agent (il n'a rien de secret : il figure dans toute page qui l'utilise).
const AGENT_ID = 'agent_0501m6n51nz3e7vbx3sesy59mrp9';
// Version figée du SDK, la même que sur les autres assistants de baiji.fr :
// une mise à jour du SDK ne peut donc pas casser la page sans prévenir.
const SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.32.1/+esm';

// Tous les textes affichés, regroupés pour être faciles à retoucher.
const TEXTES = {
  parler: "Parler à l'assistant",
  connexion: 'Connexion…',
  raccrocher: 'Raccrocher',
  ilParle: "L'assistant parle… (vous pouvez l'interrompre)",
  aVous: 'À vous, je vous écoute',
  termine: 'Conversation terminée. Vous pouvez en relancer une quand vous voulez.',
  micro: 'Le micro est bloqué : autorisez-le dans les réglages du navigateur, puis réessayez.',
  erreur: "Impossible de joindre l'assistant pour l'instant. Vérifiez la connexion et réessayez.",
};

// Idées de départ : trois façons de s'en servir (question, hypothèse, réflexion).
const IDEES = [
  { picto: 'ampoule', titre: 'Comprendre', phrase: "Explique-moi simplement ce qu'est l'âge des boues." },
  { picto: 'balance', titre: 'Vérifier une hypothèse', phrase: 'Si je double la charge de ma station, la nitrification tient-elle encore ?' },
  { picto: 'stetho', titre: 'Diagnostiquer', phrase: "Mon indice de boue est à 250 millilitres par gramme : qu'est-ce que ça veut dire ?" },
  { picto: 'cible', titre: 'Me tester', phrase: 'Pose-moi trois questions sur le lagunage, et corrige-moi.' },
];

// L'agent écrit les sigles « comme ils se prononcent » pour que la voix française les lise bien
// (« dé bé o cinq »). À l'écran, on préfère l'écriture habituelle : on les remet en forme ici.
// Chaque paire = [expression à chercher, texte affiché]. « i » : majuscules ou minuscules.
const SIGLES = [
  [/d[ée][\s-]?b[ée][\s-]?o[\s-]?cinq/gi, 'DBO5'],
  [/d[ée][\s-]?c[ée][\s-]?o\b/gi, 'DCO'],
  [/\bM[\s-]E[\s-]S\b/g, 'MES'],
  [/\bS[\s-]V[\s-]I\b/g, 'SVI'],
  [/\bN[\s-]H[\s-]4\b/g, 'NH4'],
  [/\bN[\s-]O[\s-]3\b/g, 'NO3'],
  [/d[ée][\s-]?e[\s-]?r[\s-]?u[\s-]deux/gi, 'DERU 2'],
];
export const pourEcran = (texte) => SIGLES.reduce((t, [motif, sigle]) => t.replace(motif, sigle), texte);

// Raccourcis vers les éléments de la page.
const bouton = document.querySelector('#bouton-appel');
const icone = document.querySelector('#icone-appel');
const libelle = document.querySelector('#libelle');
const etatAppel = document.querySelector('#etat-appel');
const fil = document.querySelector('#sous-titres');
const titreFil = document.querySelector('#titre-fil');

let conversation = null; // la conversation en cours (null = pas d'appel)
let dernierEnvoi = '';    // dernière phrase envoyée par une carte d'idée (pour ne pas l'afficher deux fois)

/** Pose UNE classe d'état sur <body> ; le CSS s'occupe de l'animation du bouton. */
function etat(nom) {
  document.body.classList.remove('connexion', 'en-ligne', 'parle', 'ecoute');
  if (nom) document.body.classList.add(...nom.split(' '));
}

function iconeBouton(nom) {
  icone.replaceChildren(picto(nom, 40));
}

/** Ajoute une bulle au fil : à gauche l'assistant, à droite vous (mêmes bulles que le Docteur STEP). */
function sousTitre(source, texte) {
  titreFil.hidden = false;
  const assistant = source === 'ai';
  // textContent (via element) : le texte reçu n'est jamais interprété comme du HTML.
  const bulle = element('div', `bulle ${assistant ? 'docteur' : 'vous'}`, assistant ? pourEcran(texte) : texte);
  fil.append(bulle);
  bulle.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** Retour au repos : appel terminé, d'un côté ou de l'autre. */
function repos(message) {
  conversation = null;
  etat(null);
  iconeBouton('micro');
  libelle.textContent = TEXTES.parler;
  etatAppel.textContent = message || TEXTES.termine;
}

function erreur(e) {
  console.error(e);
  // NotAllowedError = la personne (ou le navigateur) a refusé le micro.
  repos(e && e.name === 'NotAllowedError' ? TEXTES.micro : TEXTES.erreur);
}

async function basculer() {
  // Toucher pendant l'appel : on raccroche.
  if (conversation) { await conversation.endSession(); return; }
  if (document.body.classList.contains('connexion')) return; // évite les doubles touchers

  // Retour visuel immédiat, avant même la réponse du réseau.
  etat('connexion');
  libelle.textContent = TEXTES.connexion;
  etatAppel.textContent = '';
  fil.replaceChildren();
  titreFil.hidden = true;

  try {
    // 1) Le micro (obligatoire pour parler). On le demande nous-mêmes pour pouvoir
    //    afficher un message clair en cas de refus.
    await navigator.mediaDevices.getUserMedia({ audio: true });
    // 2) Le SDK, chargé à la demande.
    const { Conversation } = await import(SDK);
    // 3) La conversation. On n'utilise pas la bulle toute faite d'ElevenLabs :
    //    notre propre bouton garde la charte du site et évite l'écran de conditions en anglais.
    conversation = await Conversation.startSession({
      agentId: AGENT_ID,
      onConnect: () => {
        etat('en-ligne parle');
        iconeBouton('croix');
        libelle.textContent = TEXTES.raccrocher;
        etatAppel.textContent = TEXTES.ilParle; // il commence par son message d'accueil
      },
      // mode « speaking » = l'assistant parle ; « listening » = il vous écoute.
      onModeChange: ({ mode }) => {
        const parle = mode === 'speaking';
        etat(`en-ligne ${parle ? 'parle' : 'ecoute'}`);
        etatAppel.textContent = parle ? TEXTES.ilParle : TEXTES.aVous;
      },
      onMessage: ({ source, message }) => {
        if (!message) return;
        // Si le SDK renvoie la phrase d'une carte d'idée déjà affichée, on ne la double pas.
        if (source !== 'ai' && message === dernierEnvoi) { dernierEnvoi = ''; return; }
        sousTitre(source, message);
      },
      onDisconnect: () => repos(),
      onError: (e) => erreur(e),
    });
  } catch (e) {
    erreur(e);
  }
}

// --- Mise en place de la page ---
iconeBouton('micro');
bouton.addEventListener('click', basculer);

// Les cartes d'idées. Pendant un appel, un toucher envoie la phrase à l'assistant comme si
// vous l'aviez dite (sendUserMessage, prévu par le SDK) : pratique dans un endroit bruyant.
// Hors appel, on invite simplement à lancer la conversation.
document.querySelector('#idees').append(...IDEES.map((idee) => {
  const carte = element('button', 'carte');
  carte.type = 'button';
  const texte = document.createElement('div');
  texte.append(element('strong', 'titre-carte', idee.titre), element('span', 'sous', `« ${idee.phrase} »`));
  const m = element('span', 'medaille mauve');
  m.append(picto(idee.picto, 22));
  carte.append(m, texte);
  carte.addEventListener('click', () => {
    if (conversation && typeof conversation.sendUserMessage === 'function') {
      dernierEnvoi = idee.phrase;
      conversation.sendUserMessage(idee.phrase);
      sousTitre('user', idee.phrase); // le SDK ne renvoie pas les messages tapés : on l'affiche nous-mêmes
    } else {
      annoncer("Lancez d'abord l'appel avec le gros bouton", 'micro');
    }
  });
  const li = document.createElement('li');
  li.append(carte);
  return li;
}));

// On raccroche proprement si la personne quitte la page en pleine conversation.
addEventListener('pagehide', () => conversation?.endSession());
