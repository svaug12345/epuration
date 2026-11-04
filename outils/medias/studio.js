// Studio : dessine n'importe quelle image d'une vidéo, à la demande du script de rendu.
import { L, H, C, fond, volet, sousTitres, ecrire, medaillon, entree, prog, sortie, doux, hasard, bacterie, bulle } from '../../js/anim/moteur.js';
import { dessinerVisuel } from '../../js/anim/scenes.js';

const canvas = document.querySelector('#c');
const x = canvas.getContext('2d');
const ECHELLE = canvas.width / L;
const INTRO = 3.6;
const FIN = 4.5;
const TEINTES = [C.orange, C.mauve, C.eau, C.o2];

async function lireModule(slug) {
  const r = await fetch(`../../data/modules/${slug}.json`);
  return r.json();
}

/** Découpe un texte en phrases et répartit leur durée selon leur longueur. */
function decouper(texte, debut, fin) {
  const phrases = texte.match(/[^.!?]+[.!?]*\s*/g).map((s) => s.trim()).filter(Boolean);
  const total = phrases.reduce((s, p) => s + p.length, 0);
  let t = debut;
  return phrases.map((p) => {
    const duree = (fin - debut) * (p.length / total);
    const element = { texte: p, debut: t, fin: t + duree };
    t += duree;
    return element;
  });
}

/** Générique de début : le titre du module se pose sur un essaim de bactéries. */
function generique(m, t) {
  fond(x, t, { teinte: C.orange });
  for (let i = 0; i < 18; i += 1) {
    const p = (hasard(i) * 0.4 + t * 0.09) % 1;
    bulle(x, hasard(i + 5) * L, 730 - p * 780, 5 + hasard(i + 8) * 12);
    const a = doux(prog(t, 0, 1.3));
    bacterie(x, L / 2 + Math.cos(i * 2.1 + t * 0.4) * (720 - 260 * a), H / 2 + Math.sin(i * 1.3 + t * 0.4) * (420 - 110 * a), 16 + hasard(i) * 9, i + t * 0.3, t + i, i % 3 ? C.orange : C.mauve);
  }
  medaillon(x, m.picto, L / 2, 262, 84, prog(t, 0.2, 0.8));
  entree(x, t, 0.5, () => ecrire(x, `Module ${m.numero} sur 7`, L / 2, 410, { taille: 34, poids: 700, couleur: C.orangeClair, align: 'center' }));
  entree(x, t, 0.7, () => ecrire(x, m.titre, L / 2, 485, { taille: 66, poids: 800, align: 'center', largeur: 1120 }));
}

/** Carte de fin, signée. */
function finale(m, t) {
  fond(x, t, { teinte: C.orange });
  medaillon(x, 'trophee', L / 2, 200, 74, prog(t, 0, 0.6));
  entree(x, t, 0.25, () => ecrire(x, 'À vous de jouer !', L / 2, 345, { taille: 66, poids: 800, align: 'center' }));
  entree(x, t, 0.5, () => ecrire(x, 'Quiz, simulateur et diagnostic sur', L / 2, 420, { taille: 34, poids: 500, couleur: C.doux, align: 'center' }));
  entree(x, t, 0.7, () => ecrire(x, 'baiji.fr/epuration', L / 2, 485, { taille: 52, poids: 800, couleur: C.orangeClair, align: 'center' }));
  entree(x, t, 1, () => {
    ecrire(x, 'Outil pédagogique : il ne remplace pas une étude de dimensionnement.', L / 2, 610, { taille: 24, poids: 500, couleur: C.taupe, align: 'center', largeur: 1200 });
    ecrire(x, 'Projet personnel indépendant, sans lien avec une entreprise.', L / 2, 644, { taille: 24, poids: 500, couleur: C.taupe, align: 'center', largeur: 1200 });
  });
}

function signature() {
  ecrire(x, 'JM T.', L - 30, 40, { taille: 22, poids: 700, couleur: 'rgba(255,255,255,.55)', align: 'right' });
}

/** Barre de chapitres, en haut : un segment par scène, comme dans les « stories ». */
function chapitres(plan, t) {
  const n = plan.length;
  const l = (L - 140 - 110) / n;
  plan.forEach((s, i) => {
    const a = 70 + i * l;
    x.fillStyle = 'rgba(255,255,255,.2)';
    x.beginPath(); x.roundRect(a, 18, l - 8, 6, 3); x.fill();
    x.fillStyle = C.orange;
    x.beginPath(); x.roundRect(a, 18, Math.max(0.1, (l - 8) * prog(t, s.debut, s.fin)), 6, 3); x.fill();
  });
}

let courant = null;

/** Prépare une vidéo. calage : début et fin de chaque scène dans l'audio, en secondes. */
window.preparer = async (slug, calage, dureeAudio) => {
  const m = await lireModule(slug);
  const plan = m.scenes.map((s, i) => ({ scene: s, debut: INTRO + calage[i][0], fin: INTRO + calage[i][1], suivant: i + 1 < calage.length ? INTRO + calage[i + 1][0] : INTRO + dureeAudio }));
  const phrases = plan.flatMap((p) => decouper(p.scene.narration, p.debut, p.fin));
  const total = INTRO + dureeAudio + FIN;
  courant = { m, plan, phrases, total };
  return total;
};

/** Dessine l'instant t de la vidéo préparée. */
function dessiner(t) {
  const { m, plan, phrases, total } = courant;
  x.setTransform(ECHELLE, 0, 0, ECHELLE, 0, 0);
  x.globalAlpha = 1;
  if (t < INTRO) {
    generique(m, t);
  } else if (t >= total - FIN) {
    finale(m, t - (total - FIN));
  } else {
    let index = plan.findIndex((p) => t < p.suivant);
    if (index < 0) index = plan.length - 1;
    const p = plan[index];
    const local = Math.max(0, t - (index === 0 ? INTRO : plan[index - 1].suivant));
    const duree = p.fin - p.debut;
    const teinte = TEINTES[index % TEINTES.length];
    fond(x, t, { teinte });
    dessinerVisuel(x, p.scene.visuel, local, duree + 0.6);
    chapitres(plan, t);
    sousTitres(x, phrases, t);
    signature();
  }
  // Volet orange sur chaque changement de scène.
  const bords = [INTRO, ...plan.map((p) => p.suivant)];
  for (const b of bords) {
    const e = t - b;
    if (e > -0.34 && e < 0) volet(x, doux(prog(e, -0.34, 0)), C.orange);
    if (e >= 0 && e < 0.34) {
      x.save();
      x.translate(L, H);
      x.rotate(Math.PI);
      volet(x, 1 - doux(prog(e, 0, 0.34)), C.orange);
      x.restore();
    }
  }
}

window.image = (t, qualite = 0.9) => {
  dessiner(t);
  return canvas.toDataURL('image/jpeg', qualite).slice(23);
};

/** Image fixe d'une scène, sans sous-titres, pour les présentations. */
window.imageScene = async (slug, index) => {
  const m = await lireModule(slug);
  const s = m.scenes[index];
  x.setTransform(ECHELLE, 0, 0, ECHELLE, 0, 0);
  x.globalAlpha = 1;
  fond(x, 40 + index * 3, { teinte: TEINTES[index % TEINTES.length] });
  dessinerVisuel(x, s.visuel, 40, 25);
  return canvas.toDataURL('image/jpeg', 0.92).slice(23);
};

/** Planche de contrôle : une vignette par scène d'un module, à la fraction f de sa durée. */
window.planche = async (slug, f) => {
  const m = await lireModule(slug);
  const n = m.scenes.length;
  const cols = 2;
  const rangs = Math.ceil(n / cols);
  const sortieC = document.createElement('canvas');
  sortieC.width = 640 * cols;
  sortieC.height = 360 * rangs;
  const y = sortieC.getContext('2d');
  m.scenes.forEach((s, i) => {
    x.setTransform(ECHELLE, 0, 0, ECHELLE, 0, 0);
    x.globalAlpha = 1;
    fond(x, 10 + i * 3, { teinte: TEINTES[i % TEINTES.length] });
    dessinerVisuel(x, s.visuel, 20 * f, 20);
    y.drawImage(canvas, (i % cols) * 640, Math.floor(i / cols) * 360, 640, 360);
  });
  return sortieC.toDataURL('image/jpeg', 0.85).slice(23);
};

await document.fonts.load('800 40px "Plus Jakarta Sans Variable"');
await document.fonts.load('500 40px "Plus Jakarta Sans Variable"');
window.studioPret = true;
