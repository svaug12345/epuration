// Jim sur toutes les pages : un panneau discret qui s'ouvre depuis le bouton micro de la barre du haut.
// Ce fichier n'est chargé qu'au premier toucher du bouton (import dynamique dans habillage.js) :
// les visiteurs qui n'appellent pas Jim ne téléchargent rien de plus.
import { picto } from '../pictos.js';
import { element } from './composants.js';
import { contextePage, messageErreur, ouvrirSession, pourEcran } from '../jim/session.js';
import { lien } from './habillage.js';

let panneau = null;  // le panneau, créé une seule fois
let session = null;  // la conversation en cours (null = pas d'appel)
let bouton, icone, libelle, statut, fil, contexte;

/** Pose l'état sur le panneau ; le CSS anime le bouton (ondes, couleurs). */
function etat(nom) {
  panneau.classList.remove('connexion', 'en-ligne', 'parle', 'ecoute');
  if (nom) panneau.classList.add(...nom.split(' '));
}

function bulle(source, texte) {
  const jim = source === 'ai';
  // element() passe par textContent : le texte reçu n'est jamais interprété comme du HTML.
  fil.append(element('div', `bulle ${jim ? 'docteur' : 'vous'}`, jim ? pourEcran(texte) : texte));
  fil.scrollTop = fil.scrollHeight; // on suit la dernière phrase
}

function repos(message = 'Conversation terminée. Relancez quand vous voulez.') {
  session = null;
  etat(null);
  icone.replaceChildren(picto('micro', 30));
  bouton.setAttribute('aria-label', 'Parler à Jim');
  libelle.textContent = 'Parler à Jim';
  statut.textContent = message;
}

async function basculer() {
  if (session) { session.arreter(); return; } // toucher pendant l'appel : on raccroche
  if (panneau.classList.contains('connexion')) return; // pas de double toucher
  etat('connexion');
  libelle.textContent = 'Connexion…';
  statut.textContent = '';
  fil.replaceChildren();
  try {
    session = await ouvrirSession({
      surEtat: (e) => {
        etat(`en-ligne ${e}`);
        icone.replaceChildren(picto('croix', 28));
        bouton.setAttribute('aria-label', 'Raccrocher');
        libelle.textContent = 'Raccrocher';
        statut.textContent = e === 'parle' ? 'Jim parle… (vous pouvez le couper)' : 'À vous, Jim vous écoute';
      },
      surMessage: bulle,
      surFin: () => repos(),
      surErreur: (e) => { console.error(e); repos(messageErreur(e)); },
    });
  } catch (e) {
    console.error(e);
    repos(messageErreur(e));
  }
}

function creer() {
  panneau = element('aside', 'jim-panneau');
  panneau.setAttribute('role', 'dialog');
  panneau.setAttribute('aria-label', 'Jim, assistant vocal');

  // En-tête : avatar, nom, bouton de fermeture.
  const tete = element('div', 'jim-tete');
  const avatar = element('span', 'medaille mauve');
  avatar.append(picto('micro', 20));
  const nom = document.createElement('div');
  nom.append(element('strong', '', 'Jim'), element('span', 'sous', 'Votre assistant vocal'));
  const fermer = element('button', 'bouton-icone');
  fermer.type = 'button';
  fermer.setAttribute('aria-label', 'Fermer le panneau de Jim');
  fermer.append(picto('croix', 20));
  fermer.addEventListener('click', basculerPanneau);
  tete.append(avatar, nom, fermer);

  // Ce que Jim « voit » : rassurant, et utile pour comprendre ses réponses.
  contexte = element('p', 'jim-contexte');

  // Le bouton d'appel (mêmes ondes que sur la page Assistant vocal, en plus petit).
  const zone = element('div', 'jim-appel');
  bouton = element('button', 'bouton-appel petit');
  bouton.type = 'button';
  bouton.addEventListener('click', basculer);
  // Deux « ondes » qui grandissent quand Jim parle, et l'icône par-dessus.
  icone = element('span', 'icone-appel');
  bouton.append(element('span', 'onde'), element('span', 'onde deux'), icone);
  bouton.querySelectorAll('.onde').forEach((o) => o.setAttribute('aria-hidden', 'true'));
  libelle = element('p', 'libelle-appel');
  statut = element('p', 'etat-appel');
  statut.setAttribute('aria-live', 'polite');
  zone.append(bouton, libelle, statut);

  fil = element('div', 'fil jim-fil');
  fil.setAttribute('aria-live', 'polite');

  const plus = element('a', 'jim-lien', 'Ouvrir la grande page de Jim');
  plus.href = lien('outils/assistant.html');

  panneau.append(tete, contexte, zone, fil, plus);
  document.body.append(panneau);
  repos('Il voit la page où vous êtes : demandez-lui « explique-moi ça ».');
}

/** Ouvre ou ferme le panneau. Fermer pendant un appel raccroche : pas d'appel fantôme. */
export function basculerPanneau() {
  if (!panneau) creer();
  const ouvert = panneau.classList.toggle('ouvert');
  document.querySelector('.bouton-jim')?.setAttribute('aria-expanded', String(ouvert));
  if (ouvert) {
    contexte.textContent = `Vous êtes sur ${contextePage().titre}.`;
    bouton.focus();
  } else if (session) {
    session.arreter();
  }
}

// Échap ferme le panneau, comme une fenêtre.
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panneau?.classList.contains('ouvert')) basculerPanneau();
});
// Si la personne quitte la page en pleine conversation, on raccroche proprement.
addEventListener('pagehide', () => session?.arreter());
