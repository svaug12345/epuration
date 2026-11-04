// Recherche instantanée dans les modules, les outils et le glossaire.
import { MODULES, OUTILS } from '../donnees.js';
import { picto } from '../pictos.js';

const RACINE = new URL('../../', import.meta.url);
const simplifier = (t) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

let index = null;
let dialogue = null;

async function construireIndex() {
  const elements = [
    ...OUTILS.map((o) => ({ titre: o.titre, sous: o.sous, picto: o.picto, url: new URL(o.chemin, RACINE).href, poids: 3 })),
    ...MODULES.map((m) => ({ titre: m.titre, sous: m.sous, picto: m.picto, url: new URL(`modules/${m.slug}.html`, RACINE).href, poids: 3 })),
  ];
  // Les titres de leçons et le glossaire rendent la recherche vraiment utile.
  const chargements = MODULES.map(async (m) => {
    const d = await (await fetch(new URL(`data/modules/${m.slug}.json`, RACINE))).json();
    d.scenes.forEach((s, i) => elements.push({
      titre: s.titre, sous: `${m.titre} · étape ${i + 1}`, picto: m.picto, plein: s.narration, poids: 2,
      url: new URL(`modules/${m.slug}.html#etape-${i + 1}`, RACINE).href,
    }));
  });
  const glossaire = fetch(new URL('data/glossaire.json', RACINE)).then((r) => r.json()).then(({ termes }) => {
    for (const t of termes) {
      elements.push({ titre: t.nom ? `${t.terme} : ${t.nom}` : t.terme, sous: t.definition, picto: 'livre', poids: 2, url: new URL(`glossaire.html#${encodeURIComponent(t.terme)}`, RACINE).href });
    }
  });
  await Promise.all([...chargements, glossaire]);
  return elements.map((e) => ({ ...e, cle: simplifier(e.titre), corps: simplifier(`${e.sous} ${e.plein ?? ''}`) }));
}

function chercher(requete) {
  const q = simplifier(requete.trim());
  if (!q) return index.filter((e) => e.poids === 3).slice(0, 8);
  return index
    .map((e) => ({ e, s: (e.cle.startsWith(q) ? 6 : e.cle.includes(q) ? 4 : e.corps.includes(q) ? 1 : 0) * e.poids }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 12)
    .map((r) => r.e);
}

export async function ouvrir() {
  if (!dialogue) {
    dialogue = document.createElement('dialog');
    dialogue.className = 'palette';
    dialogue.setAttribute('aria-label', 'Recherche');
    const tete = document.createElement('div');
    tete.className = 'palette-tete';
    const champ = document.createElement('input');
    champ.type = 'search';
    champ.placeholder = 'Rechercher : charge, gonflement, azote…';
    champ.setAttribute('aria-label', 'Rechercher');
    const fermer = document.createElement('button');
    fermer.className = 'bouton-icone';
    fermer.type = 'button';
    fermer.setAttribute('aria-label', 'Fermer');
    fermer.append(picto('croix', 20));
    fermer.addEventListener('click', () => dialogue.close());
    tete.append(picto('recherche', 22), champ, fermer);
    const liste = document.createElement('ul');
    dialogue.append(tete, liste);
    document.body.append(dialogue);

    let selection = 0;
    const afficher = () => {
      const resultats = chercher(champ.value);
      selection = Math.min(selection, Math.max(0, resultats.length - 1));
      liste.replaceChildren(...resultats.map((r, i) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = r.url;
        if (i === selection) a.setAttribute('aria-selected', 'true');
        const texte = document.createElement('span');
        texte.textContent = r.titre;
        const sous = document.createElement('small');
        sous.textContent = r.sous.length > 90 ? `${r.sous.slice(0, 90)}…` : r.sous;
        texte.append(sous);
        a.append(picto(r.picto, 22), texte);
        li.append(a);
        return li;
      }));
      if (!resultats.length) {
        const vide = document.createElement('li');
        vide.className = 'discret';
        vide.style.padding = '.8rem';
        vide.textContent = 'Aucun résultat.';
        liste.append(vide);
      }
    };
    champ.addEventListener('input', () => { selection = 0; afficher(); });
    champ.addEventListener('keydown', (e) => {
      const nb = liste.querySelectorAll('a').length;
      if (e.key === 'ArrowDown') { e.preventDefault(); selection = (selection + 1) % Math.max(1, nb); afficher(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); selection = (selection - 1 + nb) % Math.max(1, nb); afficher(); }
      if (e.key === 'Enter') { liste.querySelector('a[aria-selected]')?.click(); }
    });
    dialogue.addEventListener('click', (e) => { if (e.target === dialogue) dialogue.close(); });
    dialogue.afficher = afficher;
    dialogue.champ = champ;
  }
  dialogue.showModal();
  dialogue.champ.value = '';
  dialogue.champ.focus();
  index ??= await construireIndex();
  dialogue.afficher();
}
