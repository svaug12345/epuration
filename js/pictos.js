// Jeu de pictos maison, dessinés sur une grille de 24 × 24 en traits arrondis.
// Une seule source pour la page (SVG) et pour les animations (canvas) : le style reste cohérent.
export const PICTOS = {
  goutte: 'M12 3c4 5 7 8.5 7 12a7 7 0 0 1-14 0c0-3.500 3-7 7-12z',
  bacterie: 'M8 8a6 6 0 0 1 8.500 0l0 0a6 6 0 0 1 0 8.500a6 6 0 0 1-8.500 0a6 6 0 0 1 0-8.500zM4 4l3 3M20 20l-3-3M3 13h2M19 11h2M10 12h.01M14 13h.01M12 9.500h.01',
  bulles: 'M9 16a4 4 0 1 0 0 .01zM17 9a3 3 0 1 0 0 .01zM8 6a2 2 0 1 0 0 .01zM18 18a1.500 1.500 0 1 0 0 .01',
  jauge: 'M4 16a8 8 0 1 1 16 0M12 16l4-5M3 20h18',
  fiole: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.500 15h9',
  feuille: 'M5 19C5 10 11 5 20 4c0 9-4 15-11 15-1.500 0-3-.5-4 0zM5 19c2-5 5-8 9-10',
  soleil: 'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM12 2v2M12 20v2M4 12H2M22 12h-2M5.500 5.500l1.500 1.500M17 17l1.500 1.500M18.500 5.500L17 7M7 17l-1.500 1.500',
  flamme: 'M12 3c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 2.500-7 1.500 1 2.500 2.500 2.500 4 1-2 1.500-5 1-9z',
  engrenage: 'M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM12 2v3M12 19v3M4.900 4.900L7 7M17 17l2.100 2.100M2 12h3M19 12h3M4.900 19.100L7 17M17 7l2.100-2.100',
  livre: 'M4 5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2zM4 20a2 2 0 0 0 2 1h14v-3M9 8h7',
  courbe: 'M4 4v16h16M7 16c2-7 5-9 7-9s3 1 5-1',
  stetho: 'M6 3v6a4 4 0 0 0 8 0V3M10 13v3a4 4 0 0 0 8 0v-2M18 10a2 2 0 1 0 0 4a2 2 0 0 0 0-4z',
  eclair: 'M13 2L5 14h6l-1 8 9-13h-6z',
  cible: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM12 11.500v1',
  recherche: 'M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14zM21 21l-5-5',
  accueil: 'M3 11l9-8 9 8M5 9.500V21h14V9.500M10 21v-6h4v6',
  route: 'M6 20a2.500 2.500 0 1 0 0-.01M18 9a2.500 2.500 0 1 0 0-.01M8.500 19.500H15a3.500 3.500 0 0 0 0-7H9a3.500 3.500 0 0 1 0-7h6.500',
  cartes: 'M4 8h13a1.500 1.500 0 0 1 1.500 1.500v10A1.500 1.500 0 0 1 17 21H4a1.500 1.500 0 0 1-1.500-1.500v-10A1.500 1.500 0 0 1 4 8zM7 4h13a1.500 1.500 0 0 1 1.500 1.500V16',
  trophee: 'M7 4h10v6a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 15v3M8 21h8M9 18h6v3H9z',
  etoile: 'M12 3l2.800 5.800 6.200.9-4.500 4.400 1.100 6.300L12 17.400 6.400 20.400l1.100-6.300L3 9.700l6.200-.9z',
  horloge: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM12 7v5l3.500 2',
  lecture: 'M7 4l13 8-13 8z',
  telecharger: 'M12 3v12M7 11l5 5 5-5M4 21h16',
  coche: 'M4 13l5 5L20 6',
  croix: 'M6 6l12 12M18 6L6 18',
  fleche: 'M4 12h15M13 6l6 6-6 6',
  retour: 'M20 12H5M11 6l-6 6 6 6',
  couches: 'M12 3l9 5-9 5-9-5zM3 12.500l9 5 9-5M3 17l9 5 9-5',
  atome: 'M12 10.500a1.500 1.500 0 1 0 0 3a1.500 1.500 0 0 0 0-3zM12 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zM5 6c4-1 11 6 13 12M19 6C15 5 8 12 6 18',
  vague: 'M2 9c3-3 5-3 7.500 0s5 3 7.500 0 3.500-2 5-1M2 16c3-3 5-3 7.500 0s5 3 7.500 0 3.500-2 5-1',
  balance: 'M12 3v18M7 21h10M5 7h14M5 7l-3 7a3.500 3.500 0 0 0 6 0zM19 7l-3 7a3.500 3.500 0 0 0 6 0z',
  loi: 'M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h7',
  ampoule: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.500c.7.800 1 1.500 1 2.500h6c0-1 .3-1.700 1-2.500A6 6 0 0 0 12 3z',
  alerte: 'M12 3l10 18H2zM12 10v5M12 18h.01',
  thermo: 'M10 5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0zM12 9v8',
  usine: 'M3 21V10l6 4v-4l6 4V4h6v17zM7 17h2M12 17h2M17 17h2',
  roseau: 'M8 21c0-7-1-10-3-13M8 13c1-3 1-5 0-9M16 21c0-6 1-10 3-13M16 13c-1-3-1-5 0-9M12 21V8M3 21h18',
  boues: 'M3 18c3-3 5-3 9 0s6 3 9 0M6 12a2 2 0 1 0 0-.01M14 9a3 3 0 1 0 0-.01M18 13a1.500 1.500 0 1 0 0-.01',
  cycle: 'M20 11a8 8 0 0 0-14-4L3 10M3 4v6h6M4 13a8 8 0 0 0 14 4l3-3M21 20v-6h-6',
  microscope: 'M9 3h4l1 8h-6zM6 21h13M10 11v3a5 5 0 0 0 5 3M17 21a7 7 0 0 0 0-11',
  membrane: 'M12 3v18M4 7h5M4 12h5M4 17h5M16 7h.01M19 12h.01M16 17h.01',
  feu: 'M12 21a7 7 0 0 0 7-7c0-5-5-6-5-11-3 2-5 5-5 8-1-.5-2-2-2-3-1 1.500-2 3.500-2 6a7 7 0 0 0 7 7z',
  theme: 'M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  // Micro : la capsule, l'arceau du pied et la base (assistant vocal).
  micro: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5.500 11.500a6.500 6.500 0 0 0 13 0M12 18v3M8.500 21h7',
};

const NS = 'http://www.w3.org/2000/svg';

/** Crée un picto SVG pour la page. Il est décoratif : le texte voisin porte le sens. */
export function picto(nom, taille = 24) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', taille);
  svg.setAttribute('height', taille);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'picto');
  const chemin = document.createElementNS(NS, 'path');
  chemin.setAttribute('d', PICTOS[nom] ?? PICTOS.goutte);
  svg.append(chemin);
  return svg;
}
