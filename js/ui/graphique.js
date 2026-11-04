// Petit graphique en courbes, en SVG pur, sans bibliothèque.
// Les couleurs viennent des variables CSS --serie-1, --serie-2, --serie-3, validées pour
// les daltonismes courants. Chaque courbe est aussi nommée directement : la couleur n'est
// jamais le seul indice. Toucher ou survoler le graphique affiche les valeurs du point.

const NS = 'http://www.w3.org/2000/svg';
const creer = (nom, attributs = {}) => {
  const element = document.createElementNS(NS, nom);
  for (const [cle, valeur] of Object.entries(attributs)) element.setAttribute(cle, valeur);
  return element;
};

/**
 * @param {HTMLElement} conteneur où dessiner
 * @param {object} options
 * @param {{libelle: string, ys: number[]}[]} options.series courbes, au plus 3
 * @param {number[]} options.xs abscisses communes, croissantes
 * @param {string} options.titreX titre de l'axe horizontal
 * @param {string} options.titreY titre de l'axe vertical
 * @param {(x: number) => number[]} options.lireValeurs valeurs de chaque série en un point
 * @returns {(x: number) => void} fonction qui déplace le repère vertical
 */
export function dessinerCourbes(conteneur, { series, xs, titreX, titreY, lireValeurs }) {
  const L = 340; const H = 230;
  const marge = { haut: 12, droite: 62, bas: 42, gauche: 34 };
  const largeur = L - marge.gauche - marge.droite;
  const hauteur = H - marge.haut - marge.bas;

  const xMin = xs[0]; const xMax = xs[xs.length - 1];
  const yMax = Math.ceil(Math.max(...series.flatMap((s) => s.ys)) / 10) * 10;
  const px = (x) => marge.gauche + ((x - xMin) / (xMax - xMin)) * largeur;
  const py = (y) => marge.haut + hauteur - (y / yMax) * hauteur;

  const svg = creer('svg', { viewBox: `0 0 ${L} ${H}`, role: 'img', 'aria-label': `${titreY} en fonction de ${titreX}` });
  const texte = (contenu, attributs) => {
    const t = creer('text', { 'font-size': 11, fill: 'var(--texte-doux)', ...attributs });
    t.textContent = contenu;
    return t;
  };

  // Grille horizontale discrète et graduations.
  for (let y = 0; y <= yMax; y += yMax / 4) {
    svg.append(creer('line', { x1: marge.gauche, x2: marge.gauche + largeur, y1: py(y), y2: py(y), stroke: 'var(--bord)', 'stroke-width': 1 }));
    svg.append(texte(y.toLocaleString('fr-FR'), { x: marge.gauche - 5, y: py(y) + 4, 'text-anchor': 'end' }));
  }
  for (const x of xs) {
    svg.append(texte(x.toLocaleString('fr-FR'), { x: px(x), y: marge.haut + hauteur + 15, 'text-anchor': 'middle' }));
  }
  svg.append(texte(titreX, { x: marge.gauche + largeur / 2, y: H - 8, 'text-anchor': 'middle' }));

  // Une courbe par série, de 2 px, avec son nom au bout de la ligne.
  // Les noms sont décalés au besoin pour ne pas se chevaucher.
  const positions = series
    .map((s, i) => ({ i, y: py(s.ys[s.ys.length - 1]) }))
    .sort((a, b) => a.y - b.y);
  positions.forEach((p, rang) => {
    if (rang > 0) p.y = Math.max(p.y, positions[rang - 1].y + 13);
  });

  series.forEach((serie, i) => {
    const couleur = `var(--serie-${i + 1})`;
    const points = serie.ys.map((y, j) => `${px(xs[j])},${py(y)}`).join(' ');
    svg.append(creer('polyline', { points, fill: 'none', stroke: couleur, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    const position = positions.find((p) => p.i === i);
    svg.append(texte(serie.libelle, { x: marge.gauche + largeur + 5, y: position.y + 4, fill: 'var(--texte)' }));
  });

  // Repère vertical, avec un point sur chaque courbe et les valeurs lues.
  const repere = creer('line', { y1: marge.haut, y2: marge.haut + hauteur, stroke: 'var(--texte-doux)', 'stroke-width': 1, 'stroke-dasharray': '3 3' });
  svg.append(repere);
  const marqueurs = series.map((_, i) => {
    const point = creer('circle', { r: 4, fill: `var(--serie-${i + 1})`, stroke: 'var(--carte)', 'stroke-width': 2 });
    svg.append(point);
    return point;
  });

  const lecture = document.createElement('p');
  lecture.className = 'discret';
  lecture.setAttribute('aria-live', 'polite');
  lecture.style.margin = '.3rem .3rem 0';

  const legende = document.createElement('div');
  legende.className = 'legende';
  series.forEach((serie, i) => {
    const entree = document.createElement('span');
    const trait = document.createElement('i');
    trait.style.background = `var(--serie-${i + 1})`;
    entree.append(trait, serie.libelle);
    legende.append(entree);
  });

  const placer = (x) => {
    const borne = Math.min(xMax, Math.max(xMin, x));
    repere.setAttribute('x1', px(borne));
    repere.setAttribute('x2', px(borne));
    const valeurs = lireValeurs(borne);
    valeurs.forEach((v, i) => {
      marqueurs[i].setAttribute('cx', px(borne));
      marqueurs[i].setAttribute('cy', py(v));
    });
    const details = series
      .map((s, i) => `${s.libelle} ${valeurs[i].toLocaleString('fr-FR', { maximumFractionDigits: 1 })}`)
      .join(' · ');
    lecture.textContent = `Charge ${borne.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} : ${details} ${titreY.includes('mg/l') ? 'mg/l' : ''}`;
  };

  // Le déplacement au doigt ou à la souris utilise les coordonnées du SVG lui-même,
  // ce qui reste juste quelle que soit la taille d'affichage.
  svg.style.touchAction = 'pan-y';
  svg.addEventListener('pointermove', (evenement) => {
    const boite = svg.getBoundingClientRect();
    const xSvg = ((evenement.clientX - boite.left) / boite.width) * L;
    placer(xMin + ((xSvg - marge.gauche) / largeur) * (xMax - xMin));
  });

  conteneur.replaceChildren(legende, svg, lecture);
  return placer;
}
