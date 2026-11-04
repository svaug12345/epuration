// Bibliothèque de scènes animées. Chaque scène reçoit le contexte, le temps local t (en s),
// sa durée d et ses paramètres. Les fichiers data/modules/*.json choisissent la scène et ses
// paramètres : on écrit le contenu sans toucher au dessin.
import {
  L, H, C, borne, prog, sortie, doux, rebond, mix, hasard, carte, ecrire, dessinerPicto, medaillon, entree,
  titreScene, bacterie, bulle, floc, surTrace, tuyau, rectArrondi,
} from './moteur.js';

const SCENES = {
  /** Grand titre : médaillon, surtitre et titre. */
  titre(x, t, d, { surtitre, titre, picto = 'goutte', sous }) {
    const cy = 262;
    for (let i = 0; i < 3; i += 1) {
      const p = ((t * 0.35 + i / 3) % 1);
      x.beginPath();
      x.arc(L / 2, cy, 70 + p * 300, 0, 7);
      x.strokeStyle = `rgba(235,105,11,${0.32 * (1 - p)})`;
      x.lineWidth = 2;
      x.stroke();
    }
    medaillon(x, picto, L / 2, cy, 82, prog(t, 0, 0.6));
    if (surtitre) entree(x, t, 0.35, () => ecrire(x, surtitre, L / 2, 398, { taille: 32, poids: 700, couleur: C.orangeClair, align: 'center' }));
    entree(x, t, 0.5, () => ecrire(x, titre, L / 2, 480, { taille: 68, poids: 800, align: 'center', largeur: 1120 }));
    if (sous) entree(x, t, 0.8, () => ecrire(x, sous, L / 2, 590, { taille: 32, poids: 500, couleur: C.doux, align: 'center', largeur: 980 }));
  },

  /** Un chiffre géant qui défile jusqu'à sa valeur. */
  chiffre(x, t, d, { titre, valeur, decimales = 0, unite = '', legende, picto = 'jauge', couleur = C.orange }) {
    titreScene(x, titre, t);
    const p = doux(prog(t, 0.5, Math.min(2.6, d * 0.4)));
    const texte = (valeur * p).toLocaleString('fr-FR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
    medaillon(x, picto, 190, 360, 74, prog(t, 0.3, 0.9), couleur);
    x.save();
    x.shadowColor = couleur;
    x.shadowBlur = 50;
    ecrire(x, texte, 310, 415, { taille: 170, poids: 800, largeur: 900 });
    x.restore();
    x.font = '800 170px "Plus Jakarta Sans Variable", Arial';
    const fin = 310 + x.measureText(texte).width + 26;
    entree(x, t, 1.2, () => ecrire(x, unite, fin, 410, { taille: 52, poids: 700, couleur: C.orangeClair, largeur: 1240 - fin }));
    entree(x, t, Math.min(2.2, d * 0.35), () => ecrire(x, legende, 80, 530, { taille: 38, poids: 500, couleur: C.doux, largeur: 1110 }));
  },

  /** Une liste de pictos qui arrivent au rythme de la voix. */
  liste(x, t, d, { titre, items }) {
    titreScene(x, titre, t);
    const n = items.length;
    const h = Math.min(120, 440 / n);
    items.forEach((item, i) => {
      const debut = 0.6 + (i / n) * d * 0.72;
      const b = 150 + i * (h + 8);
      const p = prog(t, debut, debut + 0.55);
      if (p <= 0) return;
      x.save();
      x.globalAlpha *= sortie(p);
      x.translate(-50 * (1 - sortie(p)), 0);
      carte(x, 70, b, 1140, h, { lueur: i === Math.min(n - 1, Math.floor(prog(t, 0.6, d) * n)) ? 'rgba(235,105,11,.55)' : null });
      medaillon(x, item.picto, 70 + h * 0.56, b + h / 2, h * 0.33, 1, item.couleur ?? C.orange);
      const decal = item.sous ? -7 : 13;
      ecrire(x, item.texte, 70 + h * 1.08, b + h / 2 + decal, { taille: 36, poids: 700, largeur: 1000 });
      if (item.sous) ecrire(x, item.sous, 70 + h * 1.08, b + h / 2 + 31, { taille: 27, poids: 500, couleur: C.doux, largeur: 1000 });
      x.restore();
    });
  },

  /** Cartes face à face. */
  comparaison(x, t, d, { titre, cartes }) {
    titreScene(x, titre, t);
    const n = cartes.length;
    const marge = 26;
    const l = (1140 - marge * (n - 1)) / n;
    cartes.forEach((c, i) => {
      const a = 70 + i * (l + marge);
      const debut = 0.5 + (i / n) * d * 0.55;
      const p = prog(t, debut, debut + 0.6);
      if (p <= 0) return;
      x.save();
      x.globalAlpha *= sortie(p);
      x.translate(a + l / 2, 370);
      x.scale(mix(0.86, 1, rebond(p)), mix(0.86, 1, rebond(p)));
      x.translate(-(a + l / 2), -370);
      const teinte = c.couleur ?? [C.orange, C.mauve, C.eau][i % 3];
      carte(x, a, 140, l, 440, { lueur: `${teinte}88` });
      medaillon(x, c.picto, a + l / 2, 218, 52, 1, teinte);
      ecrire(x, c.titre, a + l / 2, 320, { taille: 34, poids: 800, align: 'center', largeur: l - 40 });
      if (c.valeur) ecrire(x, c.valeur, a + l / 2, 415, { taille: n > 2 ? 54 : 70, poids: 800, couleur: C.orangeClair, align: 'center', largeur: l - 24 });
      if (c.texte) ecrire(x, c.texte, a + l / 2, c.valeur ? 480 : 390, { taille: 27, poids: 500, couleur: C.doux, align: 'center', largeur: l - 44 });
      x.restore();
    });
  },

  /** Chaîne d'étapes parcourue par un flux de particules. lent : le maillon qui bloque. */
  chaine(x, t, d, { titre, noeuds, lent = null, legende, couleur = C.eau }) {
    titreScene(x, titre, t);
    const n = noeuds.length;
    const l = 1140 / n;
    const cy = legende ? 310 : 350;
    const centres = noeuds.map((_, i) => 70 + l * (i + 0.5));
    const revele = prog(t, 0.5, d * 0.72);
    tuyau(x, [[0, cy], [L, cy]], t, { couleur, nb: 22, vitesse: lent !== null ? 0.05 : 0.09, epaisseur: 14, apparition: mix(0.05, 1, revele) });
    noeuds.forEach((noeud, i) => {
      const debut = 0.5 + (i / n) * d * 0.72;
      const p = prog(t, debut, debut + 0.55);
      if (p <= 0) return;
      const estLent = i === lent;
      const couleurNoeud = estLent ? C.rouge : (noeud.couleur ?? C.orange);
      if (estLent) {
        for (let k = 0; k < 14; k += 1) {
          const q = hasard(k) ;
          x.beginPath();
          x.arc(centres[i] - 96 - q * 70, cy + (hasard(k + 9) - 0.5) * 66 + Math.sin(t * 2 + k) * 4, 6, 0, 7);
          x.fillStyle = `rgba(255,107,94,${0.5 * sortie(p)})`;
          x.fill();
        }
      }
      medaillon(x, noeud.picto, centres[i], cy, 66, p, couleurNoeud);
      x.save();
      x.globalAlpha *= sortie(p);
      ecrire(x, noeud.nom, centres[i], cy + 112, { taille: 29, poids: 700, align: 'center', largeur: l - 12 });
      x.restore();
    });
    if (legende) entree(x, t, d * 0.7, () => ecrire(x, legende, L / 2, 545, { taille: 36, poids: 700, couleur: C.orangeClair, align: 'center', largeur: 1100 }));
  },

  /** Bassin vivant : bulles, bactéries et pollution qui disparaît. */
  bassin(x, t, d, { titre, etiquette, pollution = true, nbBacteries = 11, oxygene = true, couleur = C.orange }) {
    if (titre) titreScene(x, titre, t);
    const haut = 150;
    const bas = 630;
    const propre = doux(prog(t, 1, d * 0.85));
    const g = x.createLinearGradient(0, haut, 0, bas);
    g.addColorStop(0, `rgba(55,182,232,${mix(0.16, 0.34, propre)})`);
    g.addColorStop(1, `rgba(${Math.round(mix(120, 18, propre))},${Math.round(mix(80, 90, propre))},${Math.round(mix(40, 140, propre))},.55)`);
    rectArrondi(x, 70, haut, 1140, bas - haut, 30);
    x.fillStyle = g;
    x.fill();
    x.strokeStyle = C.bord;
    x.lineWidth = 3;
    x.stroke();
    x.save();
    rectArrondi(x, 70, haut, 1140, bas - haut, 30);
    x.clip();
    x.strokeStyle = 'rgba(255,255,255,.3)';
    x.lineWidth = 3;
    x.beginPath();
    for (let a = 70; a <= 1210; a += 12) {
      const b = haut + 10 + Math.sin(a * 0.02 + t * 1.6) * 5;
      if (a === 70) x.moveTo(a, b); else x.lineTo(a, b);
    }
    x.stroke();
    if (pollution) {
      for (let i = 0; i < 60; i += 1) {
        const seuil = hasard(i + 300);
        if (propre > seuil) continue;
        const a = 90 + hasard(i) * 1100 + Math.sin(t * 0.7 + i) * 14;
        const b = haut + 25 + hasard(i + 20) * 430 + Math.cos(t * 0.6 + i * 2) * 10;
        x.beginPath();
        x.arc(a, b, 4 + hasard(i + 5) * 5, 0, 7);
        x.fillStyle = 'rgba(190,150,90,.85)';
        x.fill();
      }
    }
    for (let i = 0; i < nbBacteries; i += 1) {
      const a = 120 + ((hasard(i + 40) * 1040 + t * (14 + hasard(i) * 26) * (i % 2 ? 1 : -1)) % 1040 + 1040) % 1040;
      const b = haut + 60 + hasard(i + 70) * 370 + Math.sin(t * 0.9 + i) * 24;
      bacterie(x, a, b, 19 + hasard(i + 2) * 12, Math.sin(t * 0.8 + i) * 0.6 + (i % 2 ? 0 : Math.PI), t + i, i % 3 === 2 ? C.mauve : couleur);
    }
    if (oxygene) {
      for (let i = 0; i < 46; i += 1) {
        const v = 0.11 + hasard(i + 11) * 0.11;
        const p = (t * v + hasard(i + 60)) % 1;
        const a = 100 + hasard(i + 80) * 1080 + Math.sin(t * 2 + i) * 9;
        const b = mix(bas - 26, haut + 12, p);
        bulle(x, a, b, 4 + hasard(i + 17) * 9, Math.min(1, (1 - p) * 3));
      }
      x.fillStyle = 'rgba(255,255,255,.25)';
      for (let a = 120; a < 1180; a += 180) { rectArrondi(x, a, bas - 20, 120, 8, 4); x.fill(); }
    }
    x.restore();
    if (etiquette) {
      entree(x, t, 0.8, () => {
        x.font = '700 32px "Plus Jakarta Sans Variable", Arial';
        const l = x.measureText(etiquette).width + 48;
        carte(x, L / 2 - l / 2, 562, l, 60, { r: 30, fond: 'rgba(15,14,18,.8)' });
        ecrire(x, etiquette, L / 2, 603, { taille: 32, poids: 700, align: 'center', largeur: 1200 });
      });
    }
  },

  /** Le circuit complet des boues activées. */
  circuit(x, t, d, { titre }) {
    titreScene(x, titre, t);
    const etape = (f) => prog(t, d * f, d * f + 0.7);
    tuyau(x, [[20, 300], [190, 300]], t, { apparition: etape(0.03), couleur: '#C79A58', nb: 4, vitesse: 0.5 });
    // Bassin
    const pB = sortie(etape(0.06));
    x.save();
    x.globalAlpha *= pB;
    rectArrondi(x, 190, 190, 410, 240, 22);
    x.fillStyle = 'rgba(55,182,232,.22)';
    x.fill();
    x.strokeStyle = C.orange;
    x.lineWidth = 4;
    x.stroke();
    x.save();
    rectArrondi(x, 190, 190, 410, 240, 22);
    x.clip();
    for (let i = 0; i < 20; i += 1) {
      const p = (t * (0.18 + hasard(i) * 0.14) + hasard(i + 3)) % 1;
      bulle(x, 205 + hasard(i + 8) * 380, mix(425, 195, p), 3 + hasard(i + 4) * 6);
    }
    for (let i = 0; i < 7; i += 1) floc(x, 230 + i * 52 + Math.sin(t + i) * 12, 260 + hasard(i) * 120 + Math.cos(t * 0.8 + i) * 12, 19, t, i);
    x.restore();
    ecrire(x, "Bassin d'aération", 395, 172, { taille: 30, poids: 800, align: 'center', largeur: 420 });
    x.restore();
    tuyau(x, [[600, 300], [760, 300]], t, { apparition: etape(0.2), couleur: '#C79A58', nb: 5, vitesse: 0.4 });
    // Clarificateur
    const pC = sortie(etape(0.26));
    x.save();
    x.globalAlpha *= pC;
    x.beginPath();
    x.moveTo(760, 200); x.lineTo(1060, 200); x.lineTo(1060, 320); x.lineTo(925, 440); x.lineTo(895, 440); x.lineTo(760, 320);
    x.closePath();
    x.fillStyle = 'rgba(55,182,232,.13)';
    x.fill();
    x.strokeStyle = C.mauve;
    x.lineWidth = 4;
    x.stroke();
    for (let i = 0; i < 12; i += 1) {
      const p = (t * (0.11 + hasard(i) * 0.08) + hasard(i + 5)) % 1;
      const a = mix(790 + hasard(i + 9) * 240, 910, p * p);
      floc(x, a, mix(235, 425, p), 10, t, i);
    }
    ecrire(x, 'Clarificateur', 910, 172, { taille: 30, poids: 800, align: 'center', largeur: 340 });
    x.restore();
    tuyau(x, [[1060, 225], [1262, 225]], t, { apparition: etape(0.42), couleur: C.eau, nb: 5, vitesse: 0.45 });
    entree(x, t, d * 0.42, () => ecrire(x, 'Eau épurée', 1165, 280, { taille: 28, poids: 700, couleur: C.eau, align: 'center', largeur: 200 }));
    // Recyclage
    tuyau(x, [[910, 440], [910, 490], [395, 490], [395, 432]], t, { apparition: etape(0.55), couleur: C.orangeClair, nb: 11, vitesse: 0.22, epaisseur: 13 });
    entree(x, t, d * 0.58, () => ecrire(x, 'Recyclage des boues', 640, 540, { taille: 32, poids: 800, couleur: C.orangeClair, align: 'center', largeur: 500 }));
    // Purge
    tuyau(x, [[910, 490], [1130, 490], [1130, 540]], t, { apparition: etape(0.78), couleur: C.rouge, nb: 5, vitesse: 0.3, epaisseur: 13 });
    entree(x, t, d * 0.8, () => ecrire(x, 'Purge', 1130, 586, { taille: 32, poids: 800, couleur: C.rouge, align: 'center', largeur: 240 }));
  },

  /** Échelle à zones, avec une aiguille qui se déplace. */
  jauge(x, t, d, { titre, min, max, log = false, zones, valeurs, unite = '', messages = [] }) {
    titreScene(x, titre, t);
    const a0 = 90; const l = 1100; const b0 = 300; const h = 64;
    const px = (v) => a0 + l * (log ? Math.log(v / min) / Math.log(max / min) : (v - min) / (max - min));
    const p0 = sortie(prog(t, 0.3, 1.2));
    zones.forEach((z, i) => {
      const a = px(z.de);
      const f = px(z.a);
      x.save();
      x.globalAlpha *= p0;
      x.beginPath();
      x.roundRect(a + 2, b0, Math.max(0, (f - a - 4) * p0), h, i === 0 || i === zones.length - 1 ? 16 : 4);
      x.fillStyle = z.couleur;
      x.fill();
      if (z.nom) ecrire(x, z.nom, (a + f) / 2, b0 + 44, { taille: 27, poids: 800, couleur: '#16141A', align: 'center', largeur: f - a });
      x.restore();
    });
    const marques = [...new Set(zones.flatMap((z) => [z.de, z.a]))];
    for (const v of marques) {
      entree(x, t, 0.9, () => ecrire(x, v.toLocaleString('fr-FR'), px(v), b0 + h + 44, { taille: 28, poids: 700, couleur: C.doux, align: 'center', largeur: 200 }));
    }
    // L'aiguille passe de valeur en valeur, à intervalles réguliers.
    const n = valeurs.length;
    const brut = prog(t, 1.2, d - 0.6) * (n - 1);
    const i = Math.min(n - 2, Math.floor(brut));
    const courante = n > 1 ? (log
      ? Math.exp(mix(Math.log(valeurs[i]), Math.log(valeurs[i + 1]), doux(borne((brut - i) * 2.2))))
      : mix(valeurs[i], valeurs[i + 1], doux(borne((brut - i) * 2.2)))) : valeurs[0];
    const a = px(courante);
    const pA = sortie(prog(t, 1, 1.5));
    x.save();
    x.globalAlpha *= pA;
    x.fillStyle = C.blanc;
    x.shadowColor = C.blanc;
    x.shadowBlur = 18;
    x.beginPath();
    x.moveTo(a, b0 - 4); x.lineTo(a - 15, b0 - 30); x.lineTo(a + 15, b0 - 30);
    x.closePath();
    x.fill();
    x.shadowBlur = 0;
    const etiquette = `${courante.toLocaleString('fr-FR', { maximumSignificantDigits: 2 })}${unite ? ` ${unite}` : ''}`;
    x.font = '800 42px "Plus Jakarta Sans Variable", Arial';
    const le = x.measureText(etiquette).width + 40;
    const ae = borne(a - le / 2, 40, L - le - 40);
    carte(x, ae, b0 - 104, le, 66, { r: 18, fond: C.orange, bord: C.orange });
    ecrire(x, etiquette, ae + le / 2, b0 - 56, { taille: 42, poids: 800, align: 'center', largeur: le + 20 });
    x.restore();
    // Le message suit l'aiguille : il change dès qu'elle a presque atteint la valeur suivante.
    const idx = Math.min(n - 1, Math.floor(brut + 0.55));
    if (messages[idx]) {
      const debutMessage = 1.2 + (Math.max(0, idx - 0.55) / Math.max(1, n - 1)) * (d - 1.8);
      entree(x, t, debutMessage, () => ecrire(x, messages[idx], L / 2, 500, { taille: 40, poids: 700, couleur: C.blanc, align: 'center', largeur: 1120 }));
    }
  },

  /** Courbe qui se trace, avec un point qui la parcourt. */
  courbe(x, t, d, { titre, xs, series, axeX, axeY, annotations = [], maxY }) {
    titreScene(x, titre, t);
    const a0 = 150; const b0 = 530; const l = 900; const h = 360;
    const yMax = maxY ?? Math.max(...series.flatMap((s) => s.ys)) * 1.1;
    const px = (v) => a0 + ((v - xs[0]) / (xs[xs.length - 1] - xs[0])) * l;
    const py = (v) => b0 - (v / yMax) * h;
    const pAxes = sortie(prog(t, 0.2, 0.9));
    x.save();
    x.globalAlpha *= pAxes;
    x.strokeStyle = 'rgba(255,255,255,.14)';
    x.lineWidth = 1.5;
    for (let k = 1; k <= 4; k += 1) { x.beginPath(); x.moveTo(a0, b0 - (k * h) / 4); x.lineTo(a0 + l, b0 - (k * h) / 4); x.stroke(); }
    x.strokeStyle = C.doux;
    x.lineWidth = 3;
    x.beginPath(); x.moveTo(a0, b0 - h - 10); x.lineTo(a0, b0); x.lineTo(a0 + l + 16, b0); x.stroke();
    ecrire(x, axeX, a0 + l / 2, b0 + 44, { taille: 28, poids: 600, couleur: C.doux, align: 'center', largeur: 900 });
    x.save();
    x.translate(92, b0 - h / 2);
    x.rotate(-Math.PI / 2);
    ecrire(x, axeY, 0, 0, { taille: 28, poids: 600, couleur: C.doux, align: 'center', largeur: 480 });
    x.restore();
    x.restore();
    const p = doux(prog(t, 0.8, d * 0.8));
    const couleurs = [C.orange, C.o2, C.mauve];
    series.forEach((s, i) => {
      const couleur = s.couleur ?? couleurs[i % 3];
      const pts = s.ys.map((y, k) => [px(xs[k]), py(y)]);
      const finSerie = surTrace(pts, p);
      x.save();
      x.shadowColor = couleur;
      x.shadowBlur = 16;
      x.strokeStyle = couleur;
      x.lineWidth = 6;
      x.lineJoin = 'round';
      x.lineCap = 'round';
      x.beginPath();
      x.moveTo(...pts[0]);
      for (const q of pts) { if (q[0] <= finSerie[0]) x.lineTo(...q); }
      x.lineTo(...finSerie);
      x.stroke();
      x.beginPath();
      x.arc(finSerie[0], finSerie[1], 11, 0, 7);
      x.fillStyle = C.blanc;
      x.fill();
      x.restore();
      if (s.nom) ecrire(x, s.nom, finSerie[0] + 20, finSerie[1] + 10, { taille: 30, poids: 800, couleur, largeur: 240 });
    });
    annotations.forEach((n, i) => {
      const debut = d * (n.quand ?? 0.5 + i * 0.15);
      entree(x, t, debut, () => {
        x.setLineDash([8, 8]);
        x.strokeStyle = C.doux;
        x.lineWidth = 2;
        x.beginPath(); x.moveTo(px(n.x), b0); x.lineTo(px(n.x), py(n.y ?? yMax * 0.9)); x.stroke();
        x.setLineDash([]);
        ecrire(x, n.texte, px(n.x) + (n.droite === false ? -14 : 14), py(n.y ?? yMax * 0.9) + 4, { taille: 30, poids: 700, couleur: C.jaune, align: n.droite === false ? 'right' : 'left', largeur: 560 });
      });
    });
  },

  /** Coupe d'un biofilm : l'oxygène n'entre que sur une très faible épaisseur. */
  biofilm(x, t, d, { titre, etiquetteO2 = '0,2 mm avec oxygène', etiquetteFond = 'Fond du film : sans oxygène' }) {
    titreScene(x, titre, t);
    const haut = 140; const bas = 585;
    // Support
    const pS = sortie(prog(t, 0.2, 0.8));
    x.save();
    x.globalAlpha *= pS;
    rectArrondi(x, 70, haut, 190, bas - haut, 18);
    x.fillStyle = '#6E6263';
    x.fill();
    ecrire(x, 'Support', 165, (haut + bas) / 2 + 12, { taille: 32, poids: 800, align: 'center', largeur: 180 });
    x.restore();
    // Le film s'épaissit au fil de la scène.
    const epaisseur = mix(40, 370, sortie(prog(t, 0.6, d * 0.4)));
    const face = 260 + epaisseur;
    const zoneO2 = 90;
    x.save();
    const g = x.createLinearGradient(260, 0, face, 0);
    g.addColorStop(0, '#5B3B58');
    g.addColorStop(Math.max(0, 1 - zoneO2 / epaisseur), '#7F5230');
    g.addColorStop(1, C.orange);
    x.fillStyle = g;
    x.fillRect(260, haut, epaisseur, bas - haut);
    for (let i = 0; i < 26; i += 1) {
      const a = 262 + hasard(i) * Math.max(0, epaisseur - 26);
      const proche = a > face - zoneO2 - 10;
      bacterie(x, a + 10, haut + 20 + hasard(i + 40) * 400, 11, hasard(i + 3) * 6 + Math.sin(t + i) * 0.2, t + i, proche ? '#FFE0C4' : 'rgba(180,150,190,.8)');
    }
    x.restore();
    // Eau et oxygène qui entre puis s'épuise.
    x.fillStyle = 'rgba(55,182,232,.22)';
    x.fillRect(face, haut, 1210 - face, bas - haut);
    for (let i = 0; i < 26; i += 1) {
      const p = (t * (0.13 + hasard(i) * 0.1) + hasard(i + 13)) % 1;
      const a = mix(1200, face - zoneO2, p);
      const b = haut + 16 + hasard(i + 33) * 405 + Math.sin(t + i) * 6;
      x.beginPath();
      x.arc(a, b, 7, 0, 7);
      x.fillStyle = C.o2;
      x.globalAlpha = a < face ? borne((a - (face - zoneO2)) / zoneO2) : 0.95;
      x.fill();
      x.globalAlpha = 1;
    }
    entree(x, t, d * 0.45, () => {
      x.strokeStyle = C.blanc;
      x.lineWidth = 3;
      x.setLineDash([9, 8]);
      x.beginPath(); x.moveTo(face - zoneO2, haut); x.lineTo(face - zoneO2, bas); x.stroke();
      x.setLineDash([]);
      carte(x, face + 22, 200, 420, 72, { r: 18, fond: 'rgba(15,14,18,.86)', bord: C.o2 });
      ecrire(x, etiquetteO2, face + 232, 248, { taille: 32, poids: 800, couleur: C.o2, align: 'center', largeur: 410 });
    });
    entree(x, t, d * 0.62, () => {
      carte(x, face + 22, 470, 420, 72, { r: 18, fond: 'rgba(15,14,18,.86)' });
      ecrire(x, etiquetteFond, face + 232, 516, { taille: 25, poids: 700, align: 'center', largeur: 410 });
    });
  },

  /** Lit bactérien : un bras arrose un empilement de supports. */
  arrosage(x, t, d, { titre }) {
    titreScene(x, titre, t);
    const a0 = 260; const l = 760; const haut = 215; const bas = 585;
    rectArrondi(x, a0, haut, l, bas - haut, 20);
    x.fillStyle = 'rgba(255,255,255,.04)';
    x.fill();
    x.strokeStyle = C.bord;
    x.lineWidth = 3;
    x.stroke();
    for (let r = 0; r < 4; r += 1) {
      for (let k = 0; k < 8; k += 1) {
        const a = a0 + 60 + k * 92 + (r % 2 ? 40 : 0);
        if (a > a0 + l - 40) continue;
        const b = haut + 58 + r * 84;
        x.beginPath();
        x.arc(a, b, 38, 0, 7);
        x.fillStyle = '#6E6263';
        x.fill();
        x.strokeStyle = C.orange;
        x.lineWidth = 5 + 2 * Math.sin(t + k + r);
        x.stroke();
      }
    }
    const balaye = a0 + 160 + (l - 320) * (0.5 + 0.5 * Math.sin(t * 0.9));
    x.fillStyle = C.orange;
    rectArrondi(x, balaye - 150, 170, 300, 18, 9);
    x.fill();
    for (let i = 0; i < 44; i += 1) {
      const p = (t * (0.45 + hasard(i) * 0.3) + hasard(i + 9)) % 1;
      const a = balaye - 140 + hasard(i + 4) * 280 + Math.sin(p * 9 + i) * 12;
      x.beginPath();
      x.ellipse(a, mix(190, bas - 6, p), 4, 8, 0, 0, 7);
      x.fillStyle = `rgba(55,182,232,${0.9 - p * 0.5})`;
      x.fill();
    }
    for (let i = 0; i < 10; i += 1) {
      const p = (t * 0.12 + i / 10) % 1;
      const a = mix(a0 - 90, a0 + l + 90, (hasard(i) + p * 0.1) % 1);
      if (a > a0 && a < a0 + l) continue;
      x.beginPath();
      x.arc(a, mix(bas, haut, p), 6, 0, 7);
      x.fillStyle = 'rgba(47,214,196,.55)';
      x.fill();
    }
    entree(x, t, d * 0.3, () => ecrire(x, 'Air', 140, 400, { taille: 36, poids: 800, couleur: C.o2, align: 'center', largeur: 200 }));
    entree(x, t, d * 0.15, () => ecrire(x, 'Eau', 1140, 195, { taille: 36, poids: 800, couleur: C.eau, align: 'center', largeur: 200 }));
    entree(x, t, d * 0.45, () => ecrire(x, 'Biofilm', 1140, 400, { taille: 36, poids: 800, couleur: C.orangeClair, align: 'center', largeur: 220 }));
  },

  /** Lagune : le soleil, les algues et les bactéries échangent oxygène et gaz carbonique. */
  lagune(x, t, d, { titre }) {
    titreScene(x, titre, t);
    const surface = 225; const fondB = 590;
    // Soleil
    x.save();
    x.translate(1110, 120);
    x.rotate(t * 0.15);
    x.shadowColor = C.jaune;
    x.shadowBlur = 50;
    x.fillStyle = C.jaune;
    x.beginPath(); x.arc(0, 0, 46, 0, 7); x.fill();
    x.strokeStyle = C.jaune;
    x.lineWidth = 5;
    x.lineCap = 'round';
    for (let i = 0; i < 12; i += 1) {
      const r = 64 + 6 * Math.sin(t * 2 + i);
      x.beginPath(); x.moveTo(Math.cos(i * 0.5236) * r, Math.sin(i * 0.5236) * r); x.lineTo(Math.cos(i * 0.5236) * (r + 18), Math.sin(i * 0.5236) * (r + 18)); x.stroke();
    }
    x.restore();
    // Eau et rayons
    const g = x.createLinearGradient(0, surface, 0, fondB);
    g.addColorStop(0, 'rgba(70,200,170,.45)');
    g.addColorStop(1, 'rgba(25,60,90,.7)');
    x.beginPath();
    x.moveTo(40, surface);
    for (let a = 40; a <= 1240; a += 15) x.lineTo(a, surface + Math.sin(a * 0.018 + t * 1.2) * 6);
    x.lineTo(1160, fondB); x.lineTo(120, fondB);
    x.closePath();
    x.fillStyle = g;
    x.fill();
    x.fillStyle = 'rgba(110,90,70,.85)';
    x.beginPath();
    x.moveTo(135, 535); x.quadraticCurveTo(640, 505, 1145, 535); x.lineTo(1160, fondB); x.lineTo(120, fondB);
    x.closePath();
    x.fill();
    entree(x, t, d * 0.75, () => ecrire(x, 'Boues au fond', 640, 572, { taille: 28, poids: 700, align: 'center' }));
    // Algues à gauche, bactéries à droite
    for (let i = 0; i < 16; i += 1) {
      x.beginPath();
      x.arc(150 + hasard(i) * 320 + Math.sin(t + i) * 8, surface + 26 + hasard(i + 7) * 100 + Math.cos(t * 0.8 + i) * 6, 9 + hasard(i + 3) * 8, 0, 7);
      x.fillStyle = C.vert;
      x.shadowColor = C.vert;
      x.shadowBlur = 14;
      x.fill();
      x.shadowBlur = 0;
    }
    for (let i = 0; i < 8; i += 1) {
      bacterie(x, 790 + hasard(i) * 310 + Math.sin(t * 0.7 + i) * 18, surface + 150 + hasard(i + 4) * 130, 18, Math.sin(t + i), t + i);
    }
    entree(x, t, d * 0.1, () => ecrire(x, 'Algues', 300, surface - 26, { taille: 36, poids: 800, couleur: C.vert, align: 'center' }));
    entree(x, t, d * 0.25, () => ecrire(x, 'Bactéries', 940, surface - 26, { taille: 36, poids: 800, couleur: C.orangeClair, align: 'center' }));
    // Échanges
    const echanges = prog(t, d * 0.3, d * 0.4);
    if (echanges > 0) {
      for (let i = 0; i < 9; i += 1) {
        const p = (t * 0.17 + i / 9) % 1;
        const [a, b] = [mix(460, 800, p), surface + 110 + Math.sin(p * 6) * 22];
        x.globalAlpha = echanges;
        x.beginPath(); x.arc(a, b, 9, 0, 7); x.fillStyle = C.o2; x.fill();
        const q = (t * 0.14 + i / 9) % 1;
        x.beginPath(); x.arc(mix(800, 460, q), surface + 190 + Math.sin(q * 6) * 20, 8, 0, 7); x.fillStyle = C.taupe; x.fill();
        x.globalAlpha = 1;
      }
      ecrire(x, 'oxygène', 630, surface + 80, { taille: 30, poids: 800, couleur: C.o2, align: 'center' });
      ecrire(x, 'gaz carbonique', 630, surface + 245, { taille: 30, poids: 800, couleur: C.doux, align: 'center', largeur: 360 });
    }
  },

  /** Déphosphatation : deux phases qui alternent. */
  alternance(x, t, d, { titre }) {
    titreScene(x, titre, t);
    const cycle = t / d;
    const phase2 = cycle > 0.5;
    const zones = [
      { a: 70, nom: 'Sans oxygène', couleur: C.mauve, actif: !phase2 },
      { a: 660, nom: 'Avec oxygène', couleur: C.orange, actif: phase2 },
    ];
    for (const z of zones) {
      carte(x, z.a, 140, 550, 395, { lueur: z.actif ? `${z.couleur}AA` : null, fond: z.actif ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.03)' });
      ecrire(x, z.nom, z.a + 275, 205, { taille: 36, poids: 800, align: 'center', couleur: z.actif ? C.blanc : C.doux });
    }
    // Bactérie qui change de zone, avec sa réserve de phosphore
    const passage = doux(prog(cycle, 0.45, 0.55));
    const a = mix(345, 935, passage);
    const reserve = phase2 ? mix(0.15, 1, doux(prog(cycle, 0.55, 0.95))) : mix(0.6, 0.15, doux(prog(cycle, 0.08, 0.42)));
    const nb = Math.round(reserve * 22);
    bacterie(x, a, 365, 84, 0, t, C.orange);
    for (let i = 0; i < nb; i += 1) {
      const an = i * 2.4;
      const r = 8 + i * 2.5;
      x.beginPath();
      x.arc(a + Math.cos(an) * r * 1.5, 365 + Math.sin(an) * Math.min(r, 30), 6, 0, 7);
      x.fillStyle = C.jaune;
      x.fill();
    }
    // Phosphate dans l'eau
    for (let i = 0; i < 16; i += 1) {
      const baseA = hasard(i + 3);
      const flux = (t * 0.4 + hasard(i)) % 1;
      if (!phase2) {
        const r = 60 + flux * 200;
        const an = baseA * 6.28;
        x.globalAlpha = (1 - flux) * 0.95;
        x.beginPath(); x.arc(345 + Math.cos(an) * r * 1.2, 365 + Math.sin(an) * r * 0.6, 7, 0, 7); x.fillStyle = C.jaune; x.fill();
      } else {
        const r = 260 - flux * 200;
        const an = baseA * 6.28;
        x.globalAlpha = (1 - flux) * 0.95;
        x.beginPath(); x.arc(935 + Math.cos(an) * r * 1.2, 365 + Math.sin(an) * r * 0.6, 7, 0, 7); x.fillStyle = C.jaune; x.fill();
      }
      x.globalAlpha = 1;
    }
    ecrire(x, phase2 ? 'Elle reprend plus de phosphate' : 'Elle relâche du phosphate', zones[phase2 ? 1 : 0].a + 275, 500, { taille: 31, poids: 800, couleur: C.jaune, align: 'center', largeur: 510 });
    entree(x, t, d * 0.8, () => ecrire(x, 'La purge retire les boues riches en phosphore', L / 2, 585, { taille: 34, poids: 800, couleur: C.vert, align: 'center', largeur: 1150 }));
  },

  /** Frise chronologique. */
  frise(x, t, d, { titre, jalons }) {
    titreScene(x, titre, t);
    const n = jalons.length;
    const b0 = 300;
    const p = prog(t, 0.4, d * 0.82);
    x.strokeStyle = 'rgba(255,255,255,.2)';
    x.lineWidth = 8;
    x.lineCap = 'round';
    x.beginPath(); x.moveTo(90, b0); x.lineTo(1190, b0); x.stroke();
    x.strokeStyle = C.orange;
    x.beginPath(); x.moveTo(90, b0); x.lineTo(mix(90, 1190, p), b0); x.stroke();
    jalons.forEach((j, i) => {
      const f = n > 1 ? i / (n - 1) : 0.5;
      const a = mix(170, 1110, f);
      const debut = 0.4 + ((a - 90) / 1100) * (d * 0.82 - 0.4);
      const q = prog(t, debut, debut + 0.55);
      if (q <= 0) return;
      medaillon(x, j.picto ?? 'horloge', a, b0, 38, q, j.couleur ?? C.orange);
      x.save();
      x.globalAlpha *= sortie(q);
      ecrire(x, j.annee, a, b0 - 70, { taille: 42, poids: 800, align: 'center', largeur: 280 });
      ecrire(x, j.texte, a, b0 + 92, { taille: 29, poids: 600, couleur: C.doux, align: 'center', largeur: 1040 / n });
      x.restore();
    });
  },

  /**
   * Simulateur en direct : le bassin réagit aux réglages de la page.
   * etat : boues (g/l), cb, age, dbo5, nh4, nitrification (booléen), gonflement (booléen).
   */
  simulation(x, t, d, { etat }) {
    const haut = 40; const bas = 680; const droite = 880;
    const g = x.createLinearGradient(0, haut, 0, bas);
    const trouble = borne(etat.dbo5 / 60);
    g.addColorStop(0, `rgba(55,182,232,${mix(0.32, 0.16, trouble)})`);
    g.addColorStop(1, `rgba(${Math.round(mix(18, 120, trouble))},${Math.round(mix(90, 85, trouble))},${Math.round(mix(140, 45, trouble))},.6)`);
    rectArrondi(x, 40, haut, droite - 40, bas - haut, 30);
    x.fillStyle = g;
    x.fill();
    x.strokeStyle = C.bord;
    x.lineWidth = 3;
    x.stroke();
    x.save();
    rectArrondi(x, 40, haut, droite - 40, bas - haut, 30);
    x.clip();
    const nbPollution = Math.round(borne(etat.cb / 1.2) * 70);
    for (let i = 0; i < nbPollution; i += 1) {
      x.beginPath();
      x.arc(60 + hasard(i) * 800 + Math.sin(t * 0.7 + i) * 12, haut + 20 + hasard(i + 20) * 600 + Math.cos(t * 0.6 + i * 2) * 9, 4 + hasard(i + 5) * 5, 0, 7);
      x.fillStyle = 'rgba(200,155,90,.85)';
      x.fill();
    }
    for (let i = 0; i < 34; i += 1) {
      const p = (t * (0.11 + hasard(i + 11) * 0.11) + hasard(i + 60)) % 1;
      bulle(x, 60 + hasard(i + 80) * 800 + Math.sin(t * 2 + i) * 8, mix(bas - 15, haut + 8, p), 4 + hasard(i + 17) * 8, Math.min(1, (1 - p) * 3));
    }
    const nbBact = Math.round(borne(etat.boues / 8) * 26) + 3;
    for (let i = 0; i < nbBact; i += 1) {
      const a = 70 + ((hasard(i + 40) * 780 + t * (14 + hasard(i) * 26) * (i % 2 ? 1 : -1)) % 780 + 780) % 780;
      bacterie(x, a, haut + 50 + hasard(i + 70) * 540 + Math.sin(t * 0.9 + i) * 22, 16 + hasard(i + 2) * 8, Math.sin(t * 0.8 + i) * 0.6 + (i % 2 ? 0 : Math.PI), t + i, C.orange);
    }
    if (etat.nitrification) {
      for (let i = 0; i < 9; i += 1) {
        bacterie(x, 80 + hasard(i + 140) * 760 + Math.sin(t * 0.3 + i) * 34, haut + 60 + hasard(i + 170) * 520, 13, Math.sin(t * 0.4 + i), t + i, C.o2);
      }
    }
    if (etat.gonflement) {
      x.strokeStyle = C.rouge;
      x.lineWidth = 3;
      x.lineCap = 'round';
      for (let i = 0; i < 16; i += 1) {
        const a = 70 + hasard(i + 200) * 760;
        const b = haut + 60 + hasard(i + 220) * 500;
        x.beginPath();
        x.moveTo(a, b);
        for (let k = 1; k <= 12; k += 1) x.lineTo(a + k * 12, b + Math.sin(k * 0.8 + t * 1.4 + i) * 12);
        x.stroke();
      }
    }
    x.restore();
    // Colonne de lecture, à droite
    const lignes = [
      ['DBO5 en sortie', `${Math.round(etat.dbo5)} mg/l`, etat.dbo5 <= 25 ? C.vert : C.jaune],
      ['Ammonium en sortie', `${Math.round(etat.nh4)} mg/l`, etat.nh4 <= 5 ? C.vert : C.rouge],
      ['Âge des boues', `${etat.age.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} j`, C.orangeClair],
    ];
    lignes.forEach(([nom, valeur, couleur], i) => {
      const b = 40 + i * 214;
      carte(x, 905, b, 340, 198);
      ecrire(x, nom, 925, b + 62, { taille: 28, poids: 600, couleur: C.doux, largeur: 300 });
      ecrire(x, valeur, 925, b + 150, { taille: 58, poids: 800, couleur, largeur: 310 });
    });
  },

  /** Ambiance sans texte, pour la page d'accueil. */
  ambiance(x, t) {
    for (let i = 0; i < 30; i += 1) {
      const p = (t * (0.05 + hasard(i) * 0.06) + hasard(i + 3)) % 1;
      bulle(x, 40 + hasard(i + 8) * 1200 + Math.sin(t + i) * 12, mix(740, -20, p), 4 + hasard(i + 4) * 13, 0.7);
    }
    for (let i = 0; i < 12; i += 1) {
      const a = ((hasard(i + 40) * 1400 + t * (16 + hasard(i) * 24) * (i % 2 ? 1 : -1)) % 1400 + 1400) % 1400 - 60;
      bacterie(x, a, 60 + hasard(i + 70) * 600 + Math.sin(t * 0.7 + i) * 26, 16 + hasard(i + 2) * 16, Math.sin(t * 0.6 + i) * 0.5 + (i % 2 ? 0 : Math.PI), t + i, i % 3 === 2 ? C.mauve : C.orange);
    }
  },
};

/** Dessine la scène décrite par `visuel` à l'instant t de sa durée d. */
export function dessinerVisuel(x, visuel, t, d) {
  const scene = SCENES[visuel.type];
  if (!scene) throw new Error(`Scène inconnue : ${visuel.type}`);
  scene(x, t, d, visuel);
}

export const TYPES_SCENES = Object.keys(SCENES);
