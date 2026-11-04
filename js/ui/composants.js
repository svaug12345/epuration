// Petits éléments d'interface réutilisés dans plusieurs pages.
import { picto } from '../pictos.js';

/** Crée un élément avec sa classe et son texte. */
export function element(balise, classe = '', texte = '') {
  const e = document.createElement(balise);
  if (classe) e.className = classe;
  if (texte) e.textContent = texte;
  return e;
}

export function medaille(nom, teinte = '', taille = 24) {
  const m = element('span', `medaille ${teinte}`.trim());
  m.append(picto(nom, taille));
  return m;
}

/** Carte d'un module, avec sa progression. prefixe : chemin vers la racine du site. */
export function carteModule(m, index, avance, prefixe) {
  const a = element('a', 'carte');
  a.href = `${prefixe}modules/${m.slug}.html`;
  const texte = document.createElement('div');
  texte.style.cssText = 'flex:1;min-width:0';
  texte.append(element('strong', 'titre-carte', `${index + 1}. ${m.titre}`), element('span', 'sous', m.sous));
  if (avance > 0) {
    const barre = element('div', 'barre');
    barre.style.marginTop = '.5rem';
    const i = document.createElement('i');
    i.style.width = `${Math.round(avance * 100)}%`;
    barre.append(i);
    texte.append(barre);
  }
  a.append(medaille(avance >= 1 ? 'coche' : m.picto, avance >= 1 ? 'vert' : ''), texte);
  return a;
}

export function carteOutil(o, prefixe) {
  const a = element('a', 'carte');
  a.href = `${prefixe}${o.chemin}`;
  const texte = document.createElement('div');
  texte.append(element('strong', 'titre-carte', o.titre), element('span', 'sous', o.sous));
  a.append(medaille(o.picto, o.teinte), texte);
  return a;
}

/** Pluie de confettis, pour marquer une réussite. */
export function confettis(conteneur) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const couleurs = ['#eb690b', '#f7a25f', '#6f6dc9', '#2fd6c4', '#ffc94d'];
  for (let i = 0; i < 36; i += 1) {
    const c = element('i', 'confetti');
    c.style.left = `${Math.random() * 100}%`;
    c.style.background = couleurs[i % couleurs.length];
    c.style.animationDelay = `${Math.random() * 0.6}s`;
    c.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
    conteneur.append(c);
  }
}
