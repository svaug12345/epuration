// Jim sur toutes les pages : un panneau qui s'ouvre depuis le bouton micro de la barre du haut.
// Ce fichier n'est chargé qu'au premier toucher du bouton (import dynamique dans habillage.js) :
// les visiteurs qui n'appellent pas Jim ne téléchargent rien de plus.
//
// Deux tailles, au choix de la personne, sans couper l'appel :
//   - « compact » (par défaut) : une simple barre en bas de l'écran. On continue de voir et de faire
//     défiler la page, Jim affiche juste sa dernière phrase. Idéal pour parler en regardant un calcul.
//   - « complet » : un grand panneau avec toute la conversation en sous-titres.
// Le dernier choix est mémorisé dans le navigateur.
import { picto } from '../pictos.js';
import { element } from './composants.js';
import { contextePage, messageErreur, ouvrirSession, pourEcran } from '../jim/session.js';
import { lien } from './habillage.js';

const CLE_TAILLE = 'jim-taille'; // mémoire du navigateur : 'compact' ou 'complet'

let panneau = null;  // le panneau, créé une seule fois
let session = null;  // la conversation en cours (null = pas d'appel)
let bouton, icone, statut, derniere, fil, contexte, taille;

// La mémoire du navigateur peut être indisponible (navigation privée) : on ne plante jamais pour ça.
const lireTaille = () => { try { return localStorage.getItem(CLE_TAILLE) === 'complet' ? 'complet' : 'compact'; } catch { return 'compact'; } };
const ecrireTaille = (t) => { try { localStorage.setItem(CLE_TAILLE, t); } catch { /* sans gravité */ } };

/** Pose l'état de l'appel sur le panneau ; le CSS anime le bouton (ondes, couleurs). */
function etat(nom) {
  panneau.classList.remove('connexion', 'en-ligne', 'parle', 'ecoute');
  if (nom) panneau.classList.add(...nom.split(' '));
}

/** Passe d'une taille à l'autre. La conversation continue : seul l'affichage change. */
function choisirTaille(t) {
  panneau.classList.toggle('complet', t === 'complet');
  // Sur <body>, pour réserver la place de la barre en bas de page (voir le CSS).
  document.body.classList.toggle('jim-compact', panneau.classList.contains('ouvert') && t === 'compact');
  const agrandir = t === 'compact';
  taille.replaceChildren(picto(agrandir ? 'agrandir' : 'reduire', 20));
  taille.setAttribute('aria-label', agrandir ? 'Agrandir : voir toute la conversation' : 'Réduire : revoir la page');
  taille.title = taille.getAttribute('aria-label');
  ecrireTaille(t);
  if (!agrandir) fil.scrollTop = fil.scrollHeight;
}

function bulle(source, texte) {
  const jim = source === 'ai';
  const propre = jim ? pourEcran(texte) : texte;
  // element() passe par textContent : le texte reçu n'est jamais interprété comme du HTML.
  fil.append(element('div', `bulle ${jim ? 'docteur' : 'vous'}`, propre));
  fil.scrollTop = fil.scrollHeight; // on suit la dernière phrase
  // En mode compact, seule la dernière phrase de Jim s'affiche, sur deux lignes au plus.
  if (jim) derniere.textContent = propre;
}

function repos(message = 'Conversation terminée. Relance-le quand tu veux.') {
  session = null;
  etat(null);
  icone.replaceChildren(picto('micro', 24));
  bouton.setAttribute('aria-label', 'Parler à Jim');
  statut.textContent = message;
}

async function basculerAppel() {
  if (session) { session.arreter(); return; } // toucher pendant l'appel : on raccroche
  if (panneau.classList.contains('connexion')) return; // pas de double toucher
  etat('connexion');
  statut.textContent = 'Connexion…';
  derniere.textContent = '';
  fil.replaceChildren();
  try {
    session = await ouvrirSession({
      surEtat: (e) => {
        etat(`en-ligne ${e}`);
        icone.replaceChildren(picto('croix', 22));
        bouton.setAttribute('aria-label', 'Raccrocher');
        statut.textContent = e === 'parle' ? 'Jim parle…' : 'À toi, il t\'écoute';
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

function petitBouton(classe, nomPicto, etiquette, action) {
  const b = element('button', `bouton-icone ${classe}`.trim());
  b.type = 'button';
  b.setAttribute('aria-label', etiquette);
  b.title = etiquette;
  b.append(picto(nomPicto, 20));
  b.addEventListener('click', action);
  return b;
}

function creer() {
  panneau = element('aside', 'jim-panneau');
  panneau.setAttribute('aria-label', 'Jim, assistant vocal');

  // --- La ligne du haut, présente dans les deux tailles ---
  // [bouton d'appel] [Jim + état + dernière phrase] [agrandir/réduire] [fermer]
  bouton = element('button', 'bouton-appel mini');
  bouton.type = 'button';
  bouton.addEventListener('click', basculerAppel);
  icone = element('span', 'icone-appel');
  const onde1 = element('span', 'onde');
  const onde2 = element('span', 'onde deux');
  onde1.setAttribute('aria-hidden', 'true');
  onde2.setAttribute('aria-hidden', 'true');
  bouton.append(onde1, onde2, icone);

  const textes = element('div', 'jim-textes');
  statut = element('span', 'jim-statut');
  statut.setAttribute('aria-live', 'polite');
  derniere = element('span', 'jim-derniere');
  textes.append(element('strong', '', 'Jim'), statut, derniere);

  taille = petitBouton('', 'agrandir', '', () => choisirTaille(panneau.classList.contains('complet') ? 'compact' : 'complet'));
  const fermer = petitBouton('', 'croix', 'Fermer Jim', basculerPanneau);

  const ligne = element('div', 'jim-ligne');
  ligne.append(bouton, textes, taille, fermer);

  // --- La partie « complète » : ce que Jim voit, tous les sous-titres, le lien vers sa page ---
  contexte = element('p', 'jim-contexte');
  fil = element('div', 'fil jim-fil');
  fil.setAttribute('aria-live', 'polite');
  const plus = element('a', 'jim-lien', 'Ouvrir la grande page de Jim');
  plus.href = lien('outils/assistant.html');
  const complet = element('div', 'jim-complet');
  complet.append(contexte, fil, plus);

  panneau.append(ligne, complet);
  document.body.append(panneau);
  repos('Touche le micro pour lui parler. Il voit la page où tu es.');
}

/** Ouvre ou ferme Jim. Fermer pendant un appel raccroche : pas d'appel fantôme. */
export function basculerPanneau() {
  if (!panneau) creer();
  const ouvert = panneau.classList.toggle('ouvert');
  document.querySelector('.bouton-jim')?.setAttribute('aria-expanded', String(ouvert));
  if (ouvert) {
    contexte.textContent = `Jim voit : ${contextePage().titre}.`;
    choisirTaille(lireTaille());
    bouton.focus();
  } else {
    document.body.classList.remove('jim-compact');
    session?.arreter();
  }
}

// Échap ferme Jim, comme une fenêtre.
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panneau?.classList.contains('ouvert')) basculerPanneau();
});
// Si la personne quitte la page en pleine conversation, on raccroche proprement.
addEventListener('pagehide', () => session?.arreter());
