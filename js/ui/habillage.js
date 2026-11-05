// Ajoute à chaque page ce qui est commun : barre du haut, onglets du bas, pied, thème, recherche.
// Pour changer le menu ou la signature, un seul fichier à modifier.
import { VERSION } from '../version.js';
import { picto } from '../pictos.js';
import { charger, noterJour, sauver } from '../progression.js';

// Racine du site, juste en local comme sur baiji.fr/epuration/, depuis n'importe quel sous-dossier.
export const RACINE = new URL('../../', import.meta.url);
export const lien = (chemin) => new URL(chemin, RACINE).href;

const MENU = [
  { nom: 'Accueil', chemin: './', picto: 'accueil', exact: true },
  { nom: 'Parcours', chemin: 'modules/', picto: 'route' },
  { nom: 'Labo', chemin: 'outils/', picto: 'fiole' },
  { nom: 'Réviser', chemin: 'revision.html', picto: 'cartes' },
];

// Le thème mémorisé s'applique tout de suite, pour éviter un flash de couleur.
const lireTheme = () => { try { return localStorage.getItem('theme'); } catch { return null; } };
const ecrireTheme = (t) => { try { localStorage.setItem('theme', t); } catch { /* sans gravité */ } };
const themeActuel = () => document.documentElement.dataset.theme
  || (matchMedia('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair');
const memorise = lireTheme();
if (memorise) document.documentElement.dataset.theme = memorise;

const estActif = (entree) => {
  const cible = new URL(entree.chemin, RACINE).pathname;
  const ici = location.pathname.replace(/index\.html$/, '');
  return entree.exact ? ici === cible : ici.startsWith(cible);
};

function creerLiens(conteneurClasse) {
  const nav = document.createElement('nav');
  nav.className = conteneurClasse;
  nav.setAttribute('aria-label', 'Navigation principale');
  for (const entree of MENU) {
    const a = document.createElement('a');
    a.href = lien(entree.chemin);
    a.append(picto(entree.picto, 22));
    const texte = document.createElement('span');
    texte.textContent = entree.nom;
    a.append(texte);
    if (estActif(entree)) a.setAttribute('aria-current', 'page');
    nav.append(a);
  }
  return nav;
}

function creerEntete() {
  const entete = document.createElement('header');
  entete.className = 'entete';
  const ligne = document.createElement('div');
  ligne.className = 'entete-ligne';

  const marque = document.createElement('a');
  marque.className = 'marque';
  marque.href = lien('./');
  const logo = document.createElement('img');
  logo.src = lien('img/logo-jmt.svg');
  logo.alt = 'Logo JMT';
  logo.width = 31;
  logo.height = 40;
  marque.append(logo, 'Épuration');

  const etat = charger();
  const pastille = document.createElement('a');
  pastille.className = 'pastille-xp';
  pastille.href = lien('modules/');
  pastille.append(picto('etoile', 16), `${etat.xp}`);
  pastille.setAttribute('aria-label', `${etat.xp} points. Voir mon parcours`);

  const recherche = document.createElement('button');
  recherche.className = 'bouton-icone';
  recherche.type = 'button';
  recherche.setAttribute('aria-label', 'Rechercher');
  recherche.append(picto('recherche', 22));
  recherche.addEventListener('click', ouvrirRecherche);

  const theme = document.createElement('button');
  theme.className = 'bouton-icone';
  theme.type = 'button';
  const majTheme = () => {
    const sombre = themeActuel() === 'sombre';
    theme.replaceChildren(picto(sombre ? 'soleil' : 'theme', 22));
    theme.setAttribute('aria-label', sombre ? 'Passer au thème clair' : 'Passer au thème sombre');
  };
  theme.addEventListener('click', () => {
    const suivant = themeActuel() === 'sombre' ? 'clair' : 'sombre';
    document.documentElement.dataset.theme = suivant;
    ecrireTheme(suivant);
    majTheme();
  });
  majTheme();

  // Jim, l'assistant vocal : un simple bouton micro, discret, sur toutes les pages.
  // Pas sur la page « Assistant vocal », qui a déjà son grand bouton.
  const elements = [marque, creerLiens('nav-haut'), pastille];
  if (!location.pathname.endsWith('outils/assistant.html')) elements.push(creerBoutonJim());
  ligne.append(...elements, recherche, theme);
  entete.append(ligne);
  return entete;
}

/** Bouton micro de la barre du haut. Le panneau de Jim (js/ui/jim.js) n'est chargé qu'au premier toucher. */
function creerBoutonJim() {
  const bouton = document.createElement('button');
  bouton.className = 'bouton-icone bouton-jim';
  bouton.type = 'button';
  bouton.setAttribute('aria-label', 'Parler à Jim, l\'assistant vocal');
  bouton.setAttribute('aria-expanded', 'false');
  bouton.title = 'Jim, l\'assistant vocal';
  bouton.append(picto('micro', 22));
  bouton.addEventListener('click', async () => {
    const { basculerPanneau } = await import('./jim.js');
    basculerPanneau();
  });
  return bouton;
}

function creerPied() {
  const pied = document.createElement('footer');
  pied.className = 'pied';
  // La marque : le logo et « Jamais Mal Traitée », avec les initiales en orange.
  const marque = document.createElement('div');
  marque.className = 'signature-marque';
  marque.innerHTML = '<span><b>J</b>amais <b>M</b>al <b>T</b>raitée</span>';
  const goutte = document.createElement('img');
  goutte.src = lien('img/logo-jmt.svg');
  goutte.alt = '';
  goutte.width = 28;
  goutte.height = 36;
  marque.prepend(goutte);
  const mention = document.createElement('p');
  mention.append('Projet personnel indépendant, sans lien avec une entreprise. ');
  const a = document.createElement('a');
  a.href = lien('a-propos.html');
  a.textContent = 'Sources et mentions';
  mention.append(a, ' · ');
  const g = document.createElement('a');
  g.href = lien('glossaire.html');
  g.textContent = 'Glossaire';
  mention.append(g);
  const version = document.createElement('p');
  version.append(`Version ${VERSION} · `);
  const signature = document.createElement('span');
  signature.className = 'signature';
  signature.textContent = 'JM T.';
  version.append(signature);
  pied.append(marque, mention, version);
  return pied;
}

/** Recherche chargée à la demande : la page reste légère tant qu'on ne s'en sert pas. */
async function ouvrirRecherche() {
  const { ouvrir } = await import('./recherche.js');
  ouvrir();
}

/** Petite notification, par exemple quand on gagne des points. */
export function annoncer(texte, nomPicto = 'etoile') {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.append(picto(nomPicto, 18), texte);
  document.body.append(toast);
  setTimeout(() => toast.remove(), 2700);
}

/** Met à jour le compteur de points dans la barre du haut. */
export function actualiserPoints() {
  const etat = charger();
  const pastille = document.querySelector('.pastille-xp');
  if (pastille) pastille.replaceChildren(picto('etoile', 16), `${etat.xp}`);
}

/** Fait apparaître les éléments .revele quand ils entrent dans l'écran. */
export function activerApparitions(racine = document) {
  const observateur = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      if (e.isIntersecting) { e.target.classList.add('vu'); observateur.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  racine.querySelectorAll('.revele:not(.vu)').forEach((el) => observateur.observe(el));
}

/** Crée le bandeau obligatoire des pages d'outils (voir CLAUDE.md, règle 4). */
function creerBandeau() {
  const bandeau = document.createElement('p');
  bandeau.className = 'bandeau';
  bandeau.append(picto('ampoule', 16), 'Outil pédagogique : il ne remplace pas une étude de dimensionnement.');
  return bandeau;
}

document.body.prepend(creerEntete());
document.body.append(creerPied(), creerLiens('onglets-bas'));
const principal = document.querySelector('main');
if (principal?.hasAttribute('data-bandeau')) principal.prepend(creerBandeau());
activerApparitions();

// Ctrl+K ou ⌘K ouvre la recherche, comme dans les applications modernes.
addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ouvrirRecherche(); }
});

// Compte le jour d'activité, pour la série de jours d'affilée.
const etat = charger();
noterJour(etat);
sauver(etat);

// Consultation hors ligne, si le navigateur le permet.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('sw.js', RACINE)).catch(() => { /* le site marche sans */ });
}
