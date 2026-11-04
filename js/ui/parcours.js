// Page du parcours : le chemin des modules, le bilan et les badges.
import { MODULES } from '../donnees.js';
import { picto } from '../pictos.js';
import { charger, avancement, niveau, serie, BADGES } from '../progression.js';
import { element, medaille } from './composants.js';

const etat = charger();
const total = MODULES.reduce((s, m) => s + m.etapes, 0);
const vues = Object.values(etat.etapes).reduce((s, v) => s + v.length, 0);
const pct = Math.round((100 * vues) / total);
const n = niveau(etat.xp);

const anneau = element('div', 'anneau');
anneau.style.setProperty('--p', pct);
anneau.append(element('b', '', `${pct} %`));
const texte = document.createElement('div');
texte.style.cssText = 'flex:1;min-width:0';
texte.append(element('strong', 'titre-carte', `Niveau ${n.niveau} · ${etat.xp} points`));
const serieJours = serie(etat);
texte.append(element('span', 'sous', `${serieJours} jour${serieJours > 1 ? 's' : ''} d'affilée · encore ${n.seuil - n.reste} points pour le niveau ${n.niveau + 1}`));
document.querySelector('#bilan').append(anneau, texte);

// Le module conseillé est le premier qui n'est pas terminé.
const conseille = MODULES.find((m) => avancement(etat, m.slug, m.etapes) < 1);
document.querySelector('#chemin').append(...MODULES.map((m, i) => {
  const avance = avancement(etat, m.slug, m.etapes);
  const li = document.createElement('li');
  if (avance >= 1) li.className = 'fait';
  const a = element('a', 'carte');
  a.href = `${m.slug}.html`;
  const bloc = element('div', 'texte');
  if (m === conseille) bloc.append(element('p', 'surtitre', avance > 0 ? 'À continuer' : 'À suivre'));
  bloc.lastChild && (bloc.lastChild.style.margin = '0');
  bloc.append(element('strong', 'titre-carte', `${i + 1}. ${m.titre}`), element('span', 'sous', m.sous));
  const barre = element('div', 'barre');
  const remplissage = document.createElement('i');
  remplissage.style.width = `${Math.round(avance * 100)}%`;
  barre.append(remplissage);
  bloc.append(barre);
  a.append(medaille(avance >= 1 ? 'coche' : m.picto, '', 26), bloc, picto('fleche', 20));
  li.append(a);
  return li;
}));

document.querySelector('#badges').append(...BADGES.map((b) => {
  const li = element('li', 'carte');
  const obtenu = etat.badges.includes(b.id);
  li.style.opacity = obtenu ? '1' : '.5';
  const bloc = document.createElement('div');
  bloc.append(element('strong', 'titre-carte', b.nom), element('span', 'sous', obtenu ? 'Obtenu' : 'À gagner'));
  li.append(medaille(b.picto, obtenu ? 'vert' : 'mauve'), bloc);
  return li;
}));
