// Page d'un module : un en-tête, puis des sections (Leçon, Vidéo, Fiche, Quiz, Approfondir).
// Le contenu vient de data/modules/<slug>.json : corriger un texte revient à modifier ce fichier.
import { picto } from '../pictos.js';
import { lancerVisuel } from '../anim/lecteur.js';
import { C } from '../anim/moteur.js';
import { charger, sauver, marquerEtape, noterQuiz, nouveauxBadges, avancement, POINTS } from '../progression.js';
import { annoncer, actualiserPoints } from './habillage.js';
import { creerQuestion, creerQuiz } from './quiz.js';
import { element, medaille, confettis } from './composants.js';

const slug = document.body.dataset.module;
const RACINE = new URL('../../', import.meta.url);
const principal = document.querySelector('main');
const m = await (await fetch(new URL(`data/modules/${slug}.json`, RACINE))).json();
const TEINTES = [C.orange, C.mauve, C.eau, C.o2];

function enregistrerGain(etat, gain, message) {
  sauver(etat);
  actualiserPoints();
  if (gain > 0) annoncer(`+${gain} points${message ? ` · ${message}` : ''}`);
  for (const b of nouveauxBadges(etat)) { annoncer(`Badge : ${b.nom}`, 'trophee'); sauver(etat); }
}

// --- Plan de la leçon : les étapes, avec une question de vérification toutes les deux étapes ---
function planLecon() {
  const plan = [];
  let q = 0;
  m.scenes.forEach((scene, i) => {
    plan.push({ type: 'etape', scene, i });
    if ((i + 1) % 2 === 0 && q < m.quiz.length && i < m.scenes.length - 1) plan.push({ type: 'question', question: m.quiz[q++] });
  });
  plan.push({ type: 'fin' });
  return plan;
}

function sectionLecon(depart) {
  const bloc = document.createElement('div');
  const plan = planLecon();
  let position = 0;
  let arreter = null;

  // Départ : à la demande (#etape-3), sinon à la première étape non vue.
  const etat0 = charger();
  const vues = etat0.etapes[slug] ?? [];
  const cible = depart ?? m.scenes.findIndex((_, i) => !vues.includes(i));
  if (cible > 0) position = plan.findIndex((p) => p.type === 'etape' && p.i === cible);
  if (position < 0) position = 0;

  const aller = (p) => { position = p; afficher(); bloc.scrollIntoView({ block: 'start', behavior: 'smooth' }); };

  function afficher() {
    arreter?.();
    arreter = null;
    const courant = plan[position];
    const segments = element('div', 'segments');
    segments.setAttribute('role', 'progressbar');
    segments.setAttribute('aria-valuemin', '0');
    segments.setAttribute('aria-valuemax', String(plan.length));
    segments.setAttribute('aria-valuenow', String(position + 1));
    segments.setAttribute('aria-label', 'Avancement de la leçon');
    plan.forEach((_, i) => { const s = document.createElement('i'); if (i <= position) s.className = 'fait'; segments.append(s); });
    const contenu = element('div', 'lecon');
    contenu.setAttribute('aria-live', 'polite');

    if (courant.type === 'etape') {
      const { scene, i } = courant;
      const toile = element('canvas', 'scene-toile');
      toile.setAttribute('role', 'img');
      toile.setAttribute('aria-label', `Animation : ${scene.titre}`);
      contenu.append(toile);
      contenu.append(element('p', 'surtitre', `Étape ${i + 1} sur ${m.scenes.length}`));
      contenu.lastChild.style.margin = '1rem 0 0';
      contenu.append(element('h2', '', scene.titre));
      contenu.lastChild.style.marginTop = '.1rem';
      contenu.append(element('p', '', scene.narration));
      const retenir = element('ul', 'a-retenir');
      for (const p of scene.points) { const li = document.createElement('li'); li.append(picto('coche', 15), p); retenir.append(li); }
      contenu.append(retenir);
      const etat = charger();
      const gain = marquerEtape(etat, slug, i);
      enregistrerGain(etat, gain);
      bloc.replaceChildren(segments, contenu, navigation());
      arreter = lancerVisuel(toile, scene.visuel, {
        duree: Math.max(9, scene.narration.length / 17),
        teinte: TEINTES[i % TEINTES.length],
      });
      return;
    }
    if (courant.type === 'question') {
      contenu.append(element('p', 'surtitre', 'Vérifions !'));
      contenu.append(creerQuestion(courant.question, 0, { numeroter: false }));
    } else {
      const fin = element('div', 'carte fin-lecon');
      const med = medaille('trophee', '', 42);
      fin.append(med, element('h2', '', 'Leçon terminée !'));
      fin.lastChild.style.marginTop = '0';
      fin.append(element('p', 'sous', 'Il reste à vous tester : le quiz compte pour votre score.'));
      const ligne = element('div', 'boutons');
      ligne.style.justifyContent = 'center';
      const quiz = element('button', 'bouton', 'Passer le quiz');
      quiz.type = 'button';
      quiz.addEventListener('click', () => ouvrirSection('quiz'));
      ligne.append(quiz);
      if (m.suivant) {
        const suite = element('a', 'bouton secondaire', `Suite : ${m.suivant.titre}`);
        suite.href = `${m.suivant.slug}.html`;
        ligne.append(suite);
      }
      fin.append(ligne);
      contenu.append(fin);
      confettis(fin);
      const etat = charger();
      if (avancement(etat, slug, m.scenes.length) >= 1 && !etat.quiz[`fini-${slug}`]) {
        etat.quiz[`fini-${slug}`] = { score: 1, total: 1 };
        etat.xp += POINTS.moduleFini;
        enregistrerGain(etat, POINTS.moduleFini, 'module terminé');
      }
    }
    bloc.replaceChildren(segments, contenu, navigation());
  }

  function navigation() {
    const actions = element('div', 'actions-lecon');
    const avant = element('button', 'bouton secondaire');
    avant.type = 'button';
    avant.setAttribute('aria-label', 'Étape précédente');
    avant.append(picto('retour', 20));
    avant.disabled = position === 0;
    avant.addEventListener('click', () => aller(position - 1));
    actions.append(avant);
    if (position < plan.length - 1) {
      const apres = element('button', 'bouton', plan[position + 1].type === 'fin' ? 'Terminer' : 'Continuer');
      apres.type = 'button';
      apres.append(picto('fleche', 20));
      apres.addEventListener('click', () => aller(position + 1));
      actions.append(apres);
    }
    return actions;
  }

  afficher();
  bloc.arreter = () => arreter?.();
  bloc.reprendre = afficher;
  return bloc;
}

async function sectionVideo() {
  const bloc = document.createElement('div');
  const urlVideo = new URL(`medias/${slug}.mp4`, RACINE).href;
  const video = element('video', 'lecteur-video');
  video.controls = true;
  video.preload = 'metadata';
  video.src = urlVideo;
  video.poster = new URL(`medias/${slug}.jpg`, RACINE).href;
  video.setAttribute('aria-label', `Vidéo du module ${m.titre}. Son texte est celui de la leçon.`);
  bloc.append(video);
  bloc.append(element('p', 'discret', 'La vidéo est sous-titrée dans l\'image : elle se suit aussi sans le son. Son texte est celui de la leçon.'));
  const ligne = element('div', 'boutons');
  const diapos = element('a', 'bouton secondaire');
  diapos.href = new URL(`medias/${slug}.pptx`, RACINE).href;
  diapos.download = '';
  diapos.append(picto('telecharger', 18), 'Télécharger la présentation');
  ligne.append(diapos);
  bloc.append(ligne);
  bloc.arreter = () => video.pause();
  return bloc;
}

function sectionFiche() {
  const bloc = document.createElement('div');
  const liste = element('ul', 'memo-liste');
  for (const point of m.memo) { const li = document.createElement('li'); li.append(picto('ampoule', 20), point); liste.append(li); }
  bloc.append(liste);
  bloc.append(element('h2', '', m.cas.titre));
  const cas = element('div', 'carte');
  cas.style.display = 'block';
  cas.append(element('p', '', m.cas.enonce));
  if (m.cas.lien) {
    const a = element('a', 'bouton secondaire');
    a.href = new URL(m.cas.lien, RACINE).href;
    a.append(picto('fiole', 18), m.cas.libelleLien);
    const ligne = element('div', 'boutons');
    ligne.append(a);
    cas.append(ligne);
  }
  const solution = document.createElement('details');
  solution.append(element('summary', '', 'Voir la solution'), element('p', '', m.cas.solution));
  solution.style.margin = '0';
  cas.append(solution);
  bloc.append(cas);
  return bloc;
}

function sectionQuiz() {
  return creerQuiz(m.quiz, (score, total) => {
    const etat = charger();
    const gain = noterQuiz(etat, slug, score, total);
    enregistrerGain(etat, gain, `${score}/${total}`);
  });
}

function sectionApprofondir() {
  const bloc = document.createElement('div');
  for (const partie of m.approfondir) {
    const carte = element('section', 'carte');
    carte.style.cssText = 'display:block;margin-bottom:.8rem';
    carte.append(element('h3', '', partie.titre));
    for (const p of partie.paragraphes ?? []) carte.append(element('p', '', p));
    if (partie.formules) carte.append(element('pre', 'formule', partie.formules.join('\n')));
    if (partie.source) carte.append(element('p', 'discret', `Source : ${partie.source}`));
    bloc.append(carte);
  }
  const schemas = m.scenes.filter((s) => s.schema);
  if (schemas.length) {
    bloc.append(element('h3', '', 'Les schémas à garder'));
    for (const s of schemas) {
      const fig = document.createElement('figure');
      const img = element('img', 'schema');
      img.src = new URL(`img/schemas/${s.schema}.svg`, RACINE).href;
      img.alt = s.legende ?? s.titre;
      img.loading = 'lazy';
      fig.append(img, element('figcaption', '', s.legende ?? s.titre));
      bloc.append(fig);
    }
  }
  bloc.append(element('h3', '', 'Sources'));
  const sources = element('ul', 'discret');
  for (const s of m.sources) sources.append(element('li', '', s));
  bloc.append(sources);
  return bloc;
}

// --- En-tête et sections ---
document.title = `${m.titre} · Épuration`;
const tete = document.createElement('header');
tete.style.cssText = 'display:flex;gap:.9rem;align-items:center;margin-top:.4rem';
const texteTete = document.createElement('div');
texteTete.append(element('p', 'surtitre', `Module ${m.numero} sur 7`));
texteTete.lastChild.style.margin = '0';
texteTete.append(element('h1', '', m.titre));
texteTete.lastChild.style.cssText = 'margin:0;font-size:clamp(1.6rem,6vw,2.6rem)';
tete.append(medaille(m.picto, '', 26), texteTete);
principal.append(tete, element('p', 'intro', m.accroche));
principal.lastChild.style.margin = '.7rem 0 0';

const SECTIONS = [
  { id: 'lecon', nom: 'Leçon', picto: 'lecture' },
  { id: 'video', nom: 'Vidéo', picto: 'horloge' },
  { id: 'fiche', nom: 'Fiche', picto: 'ampoule' },
  { id: 'quiz', nom: 'Quiz', picto: 'cible' },
  { id: 'plus', nom: 'Approfondir', picto: 'livre' },
];
const barre = element('div', 'sections');
barre.setAttribute('role', 'tablist');
const zone = document.createElement('div');
const cache = {};
const boutons = {};
let ouverte = null;

const depart = /^#etape-(\d+)$/.exec(location.hash);

async function ouvrirSection(id) {
  if (ouverte && cache[ouverte]?.arreter) cache[ouverte].arreter();
  ouverte = id;
  for (const [cle, b] of Object.entries(boutons)) b.setAttribute('aria-selected', String(cle === id));
  if (!cache[id]) {
    cache[id] = id === 'lecon' ? sectionLecon(depart ? Number(depart[1]) - 1 : null)
      : id === 'video' ? await sectionVideo()
        : id === 'fiche' ? sectionFiche()
          : id === 'quiz' ? sectionQuiz()
            : sectionApprofondir();
  } else if (id === 'lecon') cache.lecon.reprendre();
  zone.replaceChildren(cache[id]);
}

for (const s of SECTIONS) {
  const b = element('button');
  b.type = 'button';
  b.setAttribute('role', 'tab');
  b.append(picto(s.picto, 17), s.nom);
  b.addEventListener('click', () => ouvrirSection(s.id));
  boutons[s.id] = b;
  barre.append(b);
}
principal.append(barre, zone);
await ouvrirSection('lecon');
