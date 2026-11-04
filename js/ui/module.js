// Affiche une page de module à partir de son fichier data/modules/<slug>.json.
// La page HTML indique le module avec <body data-module="slug"> : ainsi, corriger
// un texte revient à modifier un seul fichier, y compris depuis GitHub sur téléphone.
import { creerQuiz } from './quiz.js';

const slug = document.body.dataset.module;
const RACINE = new URL('../../', import.meta.url);
const principal = document.querySelector('main');

const reponse = await fetch(new URL(`data/modules/${slug}.json`, RACINE));
const module_ = await reponse.json();

const el = (balise, texte, classe) => {
  const e = document.createElement(balise);
  if (texte) e.textContent = texte;
  if (classe) e.className = classe;
  return e;
};

function figure(nomSchema, legende) {
  const fig = document.createElement('figure');
  const img = el('img', '', 'schema');
  img.src = new URL(`img/schemas/${nomSchema}.svg`, RACINE).href;
  img.alt = legende;
  img.loading = 'lazy';
  fig.append(img, el('figcaption', legende));
  return fig;
}

/** Niveau « Comprendre » : le même texte que la voix off de la vidéo. */
function niveauComprendre() {
  const bloc = document.createElement('div');
  for (const scene of module_.scenes) {
    bloc.append(el('h3', scene.titre));
    if (scene.schema) bloc.append(figure(scene.schema, scene.legende ?? scene.titre));
    bloc.append(el('p', scene.narration));
  }
  return bloc;
}

/** Niveau « Approfondir » : formules et précisions, avec leur source. */
function niveauApprofondir() {
  const bloc = document.createElement('div');
  for (const partie of module_.approfondir) {
    bloc.append(el('h3', partie.titre));
    for (const paragraphe of partie.paragraphes ?? []) bloc.append(el('p', paragraphe));
    if (partie.formules) bloc.append(el('pre', partie.formules.join('\n'), 'formule'));
    if (partie.source) bloc.append(el('p', `Source : ${partie.source}`, 'discret'));
  }
  return bloc;
}

/** Deux onglets accessibles : l'attribut aria-selected indique celui qui est ouvert. */
function onglets() {
  const barre = el('div', '', 'onglets');
  barre.setAttribute('role', 'tablist');
  const zone = document.createElement('div');
  const niveaux = [['Comprendre', niveauComprendre()], ['Approfondir', niveauApprofondir()]];
  const boutons = niveaux.map(([nom], i) => {
    const b = el('button', nom);
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => ouvrir(i));
    return b;
  });
  function ouvrir(i) {
    boutons.forEach((b, j) => b.setAttribute('aria-selected', String(i === j)));
    zone.replaceChildren(niveaux[i][1]);
  }
  barre.append(...boutons);
  ouvrir(0);
  return [barre, zone];
}

/** Vidéo et présentation, seulement si les fichiers existent déjà. */
async function supports() {
  const bloc = document.createElement('div');
  const existe = async (url) => {
    try { return (await fetch(url, { method: 'HEAD' })).ok; } catch { return false; }
  };
  const urlVideo = new URL(`medias/${slug}.mp4`, RACINE).href;
  if (await existe(urlVideo)) {
    const video = document.createElement('video');
    video.controls = true;
    video.preload = 'metadata';
    video.src = urlVideo;
    video.poster = new URL(`medias/${slug}.png`, RACINE).href;
    video.setAttribute('aria-label', `Vidéo du module ${module_.titre}. Son texte est celui du niveau Comprendre.`);
    bloc.append(video);
    video.style.cssText = 'width:100%;border-radius:8px;background:#2c2a29;margin-bottom:.5rem';
  }
  const urlDiapos = new URL(`medias/${slug}.pptx`, RACINE).href;
  if (await existe(urlDiapos)) {
    const lien = el('a', 'Télécharger la présentation', 'bouton secondaire');
    lien.href = urlDiapos;
    lien.download = '';
    const ligne = el('div', '', 'boutons');
    ligne.append(lien);
    bloc.append(ligne);
  }
  return bloc;
}

async function afficher() {
  document.title = `${module_.titre} · Épuration`;
  const contenu = [];
  contenu.push(el('p', `Module ${module_.numero} sur 7`, 'discret'));
  contenu.at(-1).style.margin = '.5rem 0 0';
  contenu.push(el('h1', module_.titre));
  contenu.at(-1).style.marginTop = '0';
  contenu.push(el('p', module_.accroche, 'intro'));
  contenu.push(await supports());
  contenu.push(...onglets());

  const memo = el('section', '', 'carte memo');
  memo.append(el('h2', 'Fiche mémo'));
  const liste = document.createElement('ul');
  for (const point of module_.memo) liste.append(el('li', point));
  liste.style.marginBottom = '0';
  memo.append(liste);
  contenu.push(memo);

  contenu.push(el('h2', module_.cas.titre));
  contenu.push(el('p', module_.cas.enonce));
  if (module_.cas.lien) {
    const lien = el('a', module_.cas.libelleLien, 'bouton secondaire');
    lien.href = new URL(module_.cas.lien, RACINE).href;
    const ligne = el('div', '', 'boutons');
    ligne.append(lien);
    contenu.push(ligne);
  }
  const solution = document.createElement('details');
  solution.append(el('summary', 'Voir la solution'), el('p', module_.cas.solution));
  contenu.push(solution);

  contenu.push(el('h2', 'Quiz'));
  contenu.push(creerQuiz(module_.quiz));

  contenu.push(el('h2', 'Sources'));
  const sources = document.createElement('ul');
  sources.className = 'discret';
  for (const source of module_.sources) sources.append(el('li', source));
  contenu.push(sources);

  // Lien vers le module suivant, pour suivre le parcours sans repasser par le menu.
  if (module_.suivant) {
    const lien = el('a', `Module suivant : ${module_.suivant.titre}`, 'bouton');
    lien.href = new URL(`modules/${module_.suivant.slug}.html`, RACINE).href;
    contenu.push(lien);
  }

  principal.append(...contenu);
}

await afficher();
