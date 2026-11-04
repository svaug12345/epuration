// Ajoute à chaque page ce qui est commun : en-tête, bandeau, pied de page, thème.
// Avantage : pour modifier le menu ou la signature, un seul fichier à changer.
import { VERSION } from '../version.js';

// Racine du site calculée depuis l'adresse de ce fichier. Elle reste juste
// en local comme sur baiji.fr/epuration/, et depuis n'importe quel sous-dossier.
const RACINE = new URL('../../', import.meta.url);

const MENU = [
  ['Modules', 'modules/'],
  ['Outils', 'outils/'],
  ['Glossaire', 'glossaire.html'],
];

// --- Thème clair ou sombre ---
// Le stockage local peut être bloqué (navigation privée) : on protège chaque accès,
// et le site fonctionne alors simplement avec le thème du téléphone.
function lireTheme() {
  try { return localStorage.getItem('theme'); } catch { return null; }
}
function ecrireTheme(theme) {
  try { localStorage.setItem('theme', theme); } catch { /* sans gravité */ }
}
function themeActuel() {
  const choisi = document.documentElement.dataset.theme;
  if (choisi) return choisi;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair';
}

function creerEntete() {
  const entete = document.createElement('header');
  entete.className = 'entete';

  const ligne = document.createElement('div');
  ligne.className = 'entete-ligne';

  const marque = document.createElement('a');
  marque.className = 'marque';
  marque.href = RACINE.href;
  marque.textContent = 'Épuration';

  const nav = document.createElement('nav');
  nav.className = 'navigation';
  nav.setAttribute('aria-label', 'Navigation principale');
  for (const [libelle, chemin] of MENU) {
    const lien = document.createElement('a');
    lien.href = new URL(chemin, RACINE).href;
    lien.textContent = libelle;
    if (location.pathname.startsWith(new URL(chemin, RACINE).pathname)) {
      lien.setAttribute('aria-current', 'page');
    }
    nav.append(lien);
  }

  const bouton = document.createElement('button');
  bouton.className = 'bouton-theme';
  bouton.type = 'button';
  const majBouton = () => {
    const sombre = themeActuel() === 'sombre';
    bouton.textContent = sombre ? '☀' : '☾';
    bouton.setAttribute('aria-label', sombre ? 'Passer au thème clair' : 'Passer au thème sombre');
  };
  bouton.addEventListener('click', () => {
    const suivant = themeActuel() === 'sombre' ? 'clair' : 'sombre';
    document.documentElement.dataset.theme = suivant;
    ecrireTheme(suivant);
    majBouton();
  });
  majBouton();
  nav.append(bouton);

  ligne.append(marque, nav);
  entete.append(ligne);
  return entete;
}

/** Bandeau obligatoire des pages d'outils (voir CLAUDE.md, règle 4). */
function creerBandeau() {
  const bandeau = document.createElement('p');
  bandeau.className = 'bandeau';
  bandeau.textContent = 'Outil pédagogique : il ne remplace pas une étude de dimensionnement.';
  return bandeau;
}

function creerPied() {
  const pied = document.createElement('footer');
  pied.className = 'pied';

  const mention = document.createElement('p');
  mention.append('Projet personnel indépendant, sans lien avec une entreprise. ');
  const lien = document.createElement('a');
  lien.href = new URL('a-propos.html', RACINE).href;
  lien.textContent = 'Sources et mentions';
  mention.append(lien);

  const version = document.createElement('p');
  version.innerHTML = `Version ${VERSION} · <span class="signature">JM T.</span>`;

  pied.append(mention, version);
  return pied;
}

// Le thème mémorisé s'applique dès que possible, pour éviter un flash de couleur.
const memorise = lireTheme();
if (memorise) document.documentElement.dataset.theme = memorise;

document.body.prepend(creerEntete());
document.body.append(creerPied());

// Une page d'outil ou de module demande le bandeau avec data-bandeau sur <main>.
const principal = document.querySelector('main');
if (principal?.hasAttribute('data-bandeau')) principal.prepend(creerBandeau());

// Consultation hors ligne : si le navigateur le permet, on inscrit le service worker.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('sw.js', RACINE)).catch(() => {
    /* sans service worker, le site fonctionne en ligne comme d'habitude */
  });
}
