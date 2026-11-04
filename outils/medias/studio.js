// Studio : dessine n'importe quelle image d'une vidéo, à la demande du script de rendu.
import { L, H, C, fond, volet, sousTitres, ecrire, entree, prog, sortie, doux, rebond, hasard, bacterie, bulle } from '../../js/anim/moteur.js';
import { dessinerVisuel } from '../../js/anim/scenes.js';
import { LOGO } from '../../js/anim/logo-trace.js';

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

/**
 * Découpe un texte en phrases. Leur durée suit d'abord leur longueur, puis chaque fin de phrase
 * se cale sur la pause réelle la plus proche dans la voix : les sous-titres restent synchrones.
 */
function decouper(texte, debut, fin, pauses) {
  const phrases = texte.match(/[^.!?]+[.!?]*\s*/g).map((s) => s.trim()).filter(Boolean);
  const total = phrases.reduce((s, p) => s + p.length, 0);
  const internes = pauses.filter((p) => p > debut + 0.3 && p < fin - 0.3);
  let cumul = 0;
  let t = debut;
  return phrases.map((p, i) => {
    cumul += p.length;
    let bord = i === phrases.length - 1 ? fin : debut + (fin - debut) * (cumul / total);
    if (i < phrases.length - 1 && internes.length) {
      const proche = internes.reduce((a, b) => (Math.abs(b - bord) < Math.abs(a - bord) ? b : a));
      if (Math.abs(proche - bord) < 1.6 && proche > t + 0.3) bord = proche;
    }
    const element = { texte: p, debut: t, fin: bord };
    t = bord;
    return element;
  });
}

const ORANGE_LOGO = '#E36C1F';
const TRACES = { goutte: new Path2D(LOGO.goutte), reflet: new Path2D(LOGO.reflet), lettres: new Path2D(LOGO.lettres) };

/** Le logo, sa pointe basse posée sur (a, b). echelle 1 : 256 de haut. */
function logo(a, b, echelle, { lettres = 1, reflet = 1 } = {}) {
  x.save();
  x.translate(a - 100 * echelle, b - 250 * echelle);
  x.scale(echelle, echelle);
  x.fillStyle = ORANGE_LOGO;
  x.shadowColor = ORANGE_LOGO;
  x.shadowBlur = 40;
  x.fill(TRACES.goutte);
  x.shadowBlur = 0;
  if (reflet > 0) {
    x.strokeStyle = 'rgba(255,255,255,.55)';
    x.lineWidth = 8;
    x.lineCap = 'round';
    x.setLineDash([80 * reflet, 80]);
    x.stroke(TRACES.reflet);
    x.setLineDash([]);
  }
  x.globalAlpha *= lettres;
  x.fillStyle = C.blanc;
  x.fill(TRACES.lettres);
  x.restore();
}

/** « Jamais Mal Traitée », sur trois lignes, initiales en orange. */
function marque(a, b, taille) {
  x.font = `900 ${taille}px "Nunito Variable", Arial`;
  x.textAlign = 'left';
  x.textBaseline = 'alphabetic';
  [['J', 'amais'], ['M', 'al'], ['T', 'raitée.']].forEach(([i, reste], n) => {
    const y = b + n * taille * 1.02;
    x.fillStyle = '#F7A25F';
    x.fillText(i, a, y);
    const l = x.measureText(i).width;
    x.fillStyle = C.blanc;
    x.fillText(reste, a + l, y);
  });
}

/** Générique : la goutte tombe, l'onde se propage, le logo jaillit, le titre se pose. */
function generique(m, t) {
  fond(x, t, { teinte: ORANGE_LOGO });
  const ix = L / 2;
  const iy = 345;
  for (let i = 0; i < 16; i += 1) {
    const p = (hasard(i) * 0.4 + t * 0.09) % 1;
    bulle(x, hasard(i + 5) * L, 730 - p * 780, 5 + hasard(i + 8) * 12, 0.5);
    const a = doux(prog(t, 0, 1.3));
    bacterie(x, L / 2 + Math.cos(i * 2.1 + t * 0.4) * (720 - 180 * a), H / 2 + Math.sin(i * 1.3 + t * 0.4) * (430 - 60 * a), 14 + hasard(i) * 8, i + t * 0.3, t + i, i % 3 ? C.orange : C.mauve);
  }
  // 1. La petite goutte qui tombe en accélérant
  const chute = prog(t, 0, 0.5);
  if (chute < 1) {
    x.save();
    x.translate(ix, iy - 620 * (1 - chute * chute));
    x.beginPath();
    x.moveTo(0, -36);
    x.bezierCurveTo(0, -36, -17, -12, -17, 0);
    x.arc(0, 0, 17, Math.PI, 0, true);
    x.bezierCurveTo(17, -12, 0, -36, 0, -36);
    x.fillStyle = ORANGE_LOGO;
    x.fill();
    x.restore();
  }
  // 2. Les ronds dans l'eau
  [0.48, 0.66, 0.84].forEach((d) => {
    const p = prog(t, d, d + 1);
    if (p <= 0 || p >= 1) return;
    x.save();
    x.globalAlpha = (1 - p) * 0.9;
    x.strokeStyle = ORANGE_LOGO;
    x.lineWidth = 4;
    x.beginPath();
    x.ellipse(ix, iy, 40 + p * 420, 6 + p * 62, 0, 0, 7);
    x.stroke();
    x.restore();
  });
  // 3. Le logo jaillit, avec un rebond
  const j = prog(t, 0.55, 1.2);
  if (j > 0) logo(ix, iy, rebond(j) * 1.05, { lettres: sortie(prog(t, 1, 1.4)), reflet: prog(t, 1.05, 1.5) });
  // 4. Le titre du module
  entree(x, t, 1.3, () => ecrire(x, `Module ${m.numero} sur 7`, L / 2, 420, { taille: 34, poids: 700, couleur: C.orangeClair, align: 'center' }));
  entree(x, t, 1.5, () => ecrire(x, m.titre, L / 2, 495, { taille: 66, poids: 800, align: 'center', largeur: 1120 }));
}

/** Carte de fin : le logo complet, l'adresse et les mentions. */
function finale(m, t) {
  fond(x, t, { teinte: ORANGE_LOGO });
  const j = prog(t, 0, 0.6);
  if (j > 0) logo(380, 430, rebond(j) * 1.4);
  entree(x, t, 0.3, () => {
    ecrire(x, 'Avec moi, l\u2019eau n\u2019est', 590, 170, { taille: 32, poids: 500, couleur: C.doux });
    marque(590, 248, 80);
  });
  entree(x, t, 0.7, () => ecrire(x, 'Quiz, simulateur et diagnostic sur baiji.fr/epuration', L / 2, 530, { taille: 34, poids: 700, couleur: C.orangeClair, align: 'center', largeur: 1200 }));
  entree(x, t, 1, () => {
    ecrire(x, 'Outil pédagogique : il ne remplace pas une étude de dimensionnement.', L / 2, 610, { taille: 24, poids: 500, couleur: C.taupe, align: 'center', largeur: 1200 });
    ecrire(x, 'Projet personnel indépendant, sans lien avec une entreprise.', L / 2, 644, { taille: 24, poids: 500, couleur: C.taupe, align: 'center', largeur: 1200 });
  });
}

function signature() {
  logo(L - 100, 48, 0.15, { reflet: 0 });
  ecrire(x, 'JM T.', L - 24, 40, { taille: 22, poids: 700, couleur: 'rgba(255,255,255,.7)', align: 'right' });
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
window.preparer = async (slug, calage, dureeAudio, pauses = []) => {
  const m = await lireModule(slug);
  const plan = m.scenes.map((s, i) => ({ scene: s, debut: INTRO + calage[i][0], fin: INTRO + calage[i][1], suivant: i + 1 < calage.length ? INTRO + calage[i + 1][0] : INTRO + dureeAudio }));
  const pausesVideo = pauses.map((p) => INTRO + p);
  const phrases = plan.flatMap((p) => decouper(p.scene.narration, p.debut, p.fin, pausesVideo));
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
await document.fonts.load('900 40px "Nunito Variable"');
window.studioPret = true;
