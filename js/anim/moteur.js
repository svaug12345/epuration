// Moteur d'animation partagé par le site (en direct) et par les vidéos (image par image).
//
// Règle d'or : chaque image est une fonction pure du temps t. On ne stocke aucun état
// d'une image à l'autre. Résultat : on peut dessiner n'importe quel instant dans n'importe
// quel ordre, ce qui rend le rendu vidéo exact et reproductible.
// Tout est dessiné dans un repère logique de 1280 × 720, quelle que soit la taille réelle.
import { PICTOS } from '../pictos.js';

export const L = 1280;
export const H = 720;

export const C = {
  orange: '#E36C1F', orangeClair: '#F7A25F', mauve: '#9C9BE0', taupe: '#B5A6A7',
  blanc: '#FFFFFF', doux: '#D9D3D2', fond: '#17151A', carte: 'rgba(255,255,255,.07)', bord: 'rgba(255,255,255,.16)',
  eau: '#37B6E8', o2: '#2FD6C4', vert: '#63C95E', rouge: '#FF6B5E', jaune: '#FFC94D',
};
const POLICE_TITRE = '"Plus Jakarta Sans Variable", Arial, sans-serif';

// --- Mathématiques de l'animation ---
export const borne = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** Progression de 0 à 1 entre les instants a et b. */
export const prog = (t, a, b) => borne((t - a) / (b - a));
export const sortie = (p) => 1 - (1 - p) ** 3;
export const doux = (p) => p * p * (3 - 2 * p);
/** Léger dépassement, comme un objet qui rebondit en arrivant. */
export const rebond = (p) => { const c = 1.70158; return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2; };
export const mix = (a, b, p) => a + (b - a) * p;
/** Nombre pseudo-aléatoire stable : le même i donne toujours la même valeur. */
export const hasard = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// --- Dessin de base ---
export function rectArrondi(x, a, b, l, h, r) {
  x.beginPath();
  x.roundRect(a, b, l, h, r);
}

export function carte(x, a, b, l, h, { r = 26, fond = C.carte, bord = C.bord, lueur = null } = {}) {
  x.save();
  if (lueur) { x.shadowColor = lueur; x.shadowBlur = 44; }
  rectArrondi(x, a, b, l, h, r);
  x.fillStyle = fond;
  x.fill();
  x.restore();
  rectArrondi(x, a, b, l, h, r);
  x.strokeStyle = lueur ?? bord;
  x.lineWidth = 2;
  x.stroke();
}

/** Coupe un texte en lignes selon la largeur disponible. */
export function couper(x, texte, largeur) {
  const lignes = [];
  let ligne = '';
  for (const mot of String(texte).split(' ')) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (x.measureText(essai).width > largeur && ligne) { lignes.push(ligne); ligne = mot; } else ligne = essai;
  }
  lignes.push(ligne);
  return lignes;
}

/** Écrit un texte, avec retour à la ligne automatique. Renvoie la hauteur occupée. */
export function ecrire(x, texte, a, b, { taille = 36, poids = 600, couleur = C.blanc, align = 'left', largeur = 1100, interligne = 1.2, base = 'alphabetic' } = {}) {
  x.font = `${poids} ${taille}px ${POLICE_TITRE}`;
  x.fillStyle = couleur;
  x.textAlign = align;
  x.textBaseline = base;
  const lignes = couper(x, texte, largeur);
  lignes.forEach((ligne, i) => x.fillText(ligne, a, b + i * taille * interligne));
  return lignes.length * taille * interligne;
}

/** Dessine un picto centré en (a, b). */
export function dessinerPicto(x, nom, a, b, taille, couleur = C.blanc, trait = 1.8) {
  const echelle = taille / 24;
  x.save();
  x.translate(a - taille / 2, b - taille / 2);
  x.scale(echelle, echelle);
  x.strokeStyle = couleur;
  x.lineWidth = trait;
  x.lineCap = 'round';
  x.lineJoin = 'round';
  x.stroke(new Path2D(PICTOS[nom] ?? PICTOS.goutte));
  x.restore();
}

/** Médaillon rond avec picto, qui arrive avec un rebond. p va de 0 à 1. */
export function medaillon(x, nom, a, b, r, p = 1, couleur = C.orange) {
  if (p <= 0) return;
  const s = rebond(p);
  x.save();
  x.translate(a, b);
  x.scale(s, s);
  x.globalAlpha *= borne(p * 2);
  x.shadowColor = couleur;
  x.shadowBlur = 34;
  x.beginPath();
  x.arc(0, 0, r, 0, 7);
  x.fillStyle = couleur;
  x.fill();
  x.shadowBlur = 0;
  dessinerPicto(x, nom, 0, 0, r * 1.15, C.blanc, 2);
  x.restore();
}

/** Applique une entrée « glisse et apparaît » au contenu dessiné dans fn. */
export function entree(x, t, debut, fn, { dy = 26, duree = 0.55 } = {}) {
  const p = prog(t, debut, debut + duree);
  if (p <= 0) return;
  x.save();
  x.globalAlpha *= sortie(p);
  x.translate(0, dy * (1 - sortie(p)));
  fn();
  x.restore();
}

/** Titre de scène, en haut à gauche, qui apparaît mot par mot. */
export function titreScene(x, texte, t, { b = 92, taille = 50 } = {}) {
  x.font = `800 ${taille}px ${POLICE_TITRE}`;
  x.textAlign = 'left';
  x.textBaseline = 'alphabetic';
  let a = 70;
  String(texte).split(' ').forEach((mot, i) => {
    const p = prog(t, 0.08 + i * 0.07, 0.5 + i * 0.07);
    const largeur = x.measureText(`${mot} `).width;
    x.save();
    x.globalAlpha *= sortie(p);
    x.fillStyle = C.blanc;
    x.fillText(mot, a, b + 22 * (1 - sortie(p)));
    x.restore();
    a += largeur;
  });
}

// --- Décor ---
/** Fond sombre vivant : trois halos colorés qui dérivent lentement, et de fines particules. */
export function fond(x, t, { teinte = C.orange, particules = 26 } = {}) {
  x.fillStyle = C.fond;
  x.fillRect(0, 0, L, H);
  const halos = [
    [teinte, 300 + 130 * Math.sin(t * 0.21), 170 + 70 * Math.cos(t * 0.17), 620, 0.34],
    [C.mauve, 1020 + 110 * Math.cos(t * 0.15), 560 + 70 * Math.sin(t * 0.23), 660, 0.25],
    [C.eau, 760 + 170 * Math.sin(t * 0.11), 90 + 60 * Math.sin(t * 0.19), 460, 0.13],
  ];
  for (const [couleur, a, b, r, force] of halos) {
    const g = x.createRadialGradient(a, b, 0, a, b, r);
    g.addColorStop(0, couleur);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.globalAlpha = force;
    x.fillStyle = g;
    x.fillRect(0, 0, L, H);
  }
  x.globalAlpha = 1;
  for (let i = 0; i < particules; i += 1) {
    const vitesse = 8 + hasard(i) * 14;
    const a = (hasard(i + 50) * L + Math.sin(t * 0.3 + i) * 18) % L;
    const b = (hasard(i + 90) * (H + 40) - t * vitesse) % (H + 40);
    x.beginPath();
    x.arc(a, b < 0 ? b + H + 40 : b, 1 + hasard(i + 7) * 2.2, 0, 7);
    x.fillStyle = `rgba(255,255,255,${0.05 + hasard(i + 3) * 0.13})`;
    x.fill();
  }
}

/** Une bactérie : une capsule lumineuse, avec un flagelle qui ondule. */
export function bacterie(x, a, b, taille, angle, t, couleur = C.orange) {
  x.save();
  x.translate(a, b);
  x.rotate(angle);
  x.strokeStyle = couleur;
  x.lineWidth = Math.max(1.5, taille * 0.09);
  x.lineCap = 'round';
  x.beginPath();
  x.moveTo(-taille, 0);
  for (let i = 1; i <= 8; i += 1) {
    x.lineTo(-taille - i * taille * 0.14, Math.sin(t * 7 + i) * taille * 0.15);
  }
  x.stroke();
  x.shadowColor = couleur;
  x.shadowBlur = taille * 0.8;
  rectArrondi(x, -taille, -taille * 0.5, taille * 2, taille, taille * 0.5);
  x.fillStyle = couleur;
  x.fill();
  x.shadowBlur = 0;
  x.fillStyle = 'rgba(255,255,255,.55)';
  x.beginPath();
  x.ellipse(taille * 0.2, -taille * 0.13, taille * 0.42, taille * 0.12, 0, 0, 7);
  x.fill();
  x.restore();
}

/** Bulle d'air avec reflet. */
export function bulle(x, a, b, r, alpha = 0.8) {
  x.save();
  x.globalAlpha *= alpha;
  x.beginPath();
  x.arc(a, b, r, 0, 7);
  x.fillStyle = 'rgba(255,255,255,.1)';
  x.fill();
  x.strokeStyle = 'rgba(255,255,255,.75)';
  x.lineWidth = 1.5;
  x.stroke();
  x.beginPath();
  x.arc(a - r * 0.3, b - r * 0.3, r * 0.2, 0, 7);
  x.fillStyle = 'rgba(255,255,255,.8)';
  x.fill();
  x.restore();
}

/** Floc : un amas de bactéries qui tourne doucement. */
export function floc(x, a, b, r, t, i = 0) {
  x.save();
  x.translate(a, b);
  x.rotate(t * 0.25 + i);
  for (let k = 0; k < 9; k += 1) {
    const angle = k * 2.4;
    const d = r * 0.65 * Math.sqrt((k + 1) / 9);
    x.beginPath();
    x.arc(Math.cos(angle) * d, Math.sin(angle) * d, r * (0.22 + hasard(k + i) * 0.13), 0, 7);
    x.fillStyle = k % 3 === 0 ? C.orangeClair : '#C8843F';
    x.fill();
  }
  x.restore();
}

/** Position le long d'un tracé (liste de points), pour p entre 0 et 1. */
export function surTrace(points, p) {
  const longueurs = [];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const l = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    longueurs.push(l);
    total += l;
  }
  let reste = borne(p) * total;
  for (let i = 0; i < longueurs.length; i += 1) {
    if (reste <= longueurs[i]) {
      const q = longueurs[i] ? reste / longueurs[i] : 0;
      return [mix(points[i][0], points[i + 1][0], q), mix(points[i][1], points[i + 1][1], q)];
    }
    reste -= longueurs[i];
  }
  return points[points.length - 1];
}

/** Tuyau : un trait épais, parcouru de particules qui suivent le sens du flux. */
export function tuyau(x, points, t, { couleur = C.eau, nb = 8, vitesse = 0.22, epaisseur = 12, apparition = 1, decalage = 0 } = {}) {
  const fin = surTrace(points, apparition);
  x.save();
  x.lineCap = 'round';
  x.lineJoin = 'round';
  x.lineWidth = epaisseur;
  x.strokeStyle = 'rgba(255,255,255,.14)';
  x.beginPath();
  x.moveTo(...points[0]);
  let cumul = 0;
  const total = points.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - points[i][0], q[1] - points[i][1]), 0);
  for (let i = 1; i < points.length; i += 1) {
    cumul += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    if (cumul / total <= apparition) x.lineTo(...points[i]); else { x.lineTo(...fin); break; }
  }
  x.stroke();
  x.restore();
  if (apparition <= 0) return;
  for (let i = 0; i < nb; i += 1) {
    const p = ((t * vitesse + i / nb + decalage) % 1);
    if (p > apparition) continue;
    const [a, b] = surTrace(points, p);
    x.save();
    x.shadowColor = couleur;
    x.shadowBlur = 14;
    x.beginPath();
    x.arc(a, b, epaisseur * 0.34, 0, 7);
    x.fillStyle = couleur;
    x.fill();
    x.restore();
  }
}

/** Volet de transition entre deux scènes : p va de 0 (rien) à 1 (écran couvert). */
export function volet(x, p, couleur = C.orange) {
  if (p <= 0) return;
  const biais = 220;
  x.fillStyle = couleur;
  x.beginPath();
  x.moveTo(0, 0);
  x.lineTo((L + biais) * p, 0);
  x.lineTo((L + biais) * p - biais, H);
  x.lineTo(0, H);
  x.closePath();
  x.fill();
}

/**
 * Sous-titres dynamiques : la phrase en cours, avec le mot prononcé en orange.
 * Le temps de chaque mot est estimé d'après sa longueur à l'intérieur de la scène.
 */
export function sousTitres(x, phrases, t) {
  const phrase = phrases.find((s) => t >= s.debut && t < s.fin);
  if (!phrase) return;
  const taille = 30;
  x.font = `700 ${taille}px ${POLICE_TITRE}`;
  x.textAlign = 'left';
  x.textBaseline = 'alphabetic';
  const lignes = couper(x, phrase.texte, 1080);
  // Une phrase longue est affichée par blocs de deux lignes.
  const parBloc = 2;
  const nbBlocs = Math.ceil(lignes.length / parBloc);
  const avancee = prog(t, phrase.debut, phrase.fin);
  const indexBloc = Math.min(nbBlocs - 1, Math.floor(avancee * nbBlocs));
  const bloc = lignes.slice(indexBloc * parBloc, (indexBloc + 1) * parBloc);
  const motsAvant = lignes.slice(0, indexBloc * parBloc).join(' ').split(' ').filter(Boolean).length;
  const nbMots = phrase.texte.split(' ').length;
  const motCourant = Math.floor(avancee * nbMots);

  const hauteur = bloc.length * taille * 1.28 + 22;
  const haut = H - hauteur - 20;
  const largeurMax = Math.max(...bloc.map((l) => x.measureText(l).width));
  rectArrondi(x, L / 2 - largeurMax / 2 - 22, haut, largeurMax + 44, hauteur, 18);
  x.fillStyle = 'rgba(10,9,12,.78)';
  x.fill();
  let compteur = motsAvant;
  bloc.forEach((ligne, i) => {
    let a = L / 2 - x.measureText(ligne).width / 2;
    const b = haut + 11 + taille * 1.02 + i * taille * 1.28;
    for (const mot of ligne.split(' ')) {
      x.fillStyle = compteur === motCourant ? C.orangeClair : C.blanc;
      x.fillText(mot, a, b);
      a += x.measureText(`${mot} `).width;
      compteur += 1;
    }
  });
}
