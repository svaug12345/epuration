// Mode révision : les cartes viennent des quiz des modules, sans double saisie.
const SLUGS = ['bases', 'boues-activees', 'lits-bacteriens', 'azote-phosphore', 'methanisation', 'lagunage', 'reglementation-procedes'];
const RACINE = new URL('../../', import.meta.url);

const modules = await Promise.all(SLUGS.map(async (slug) => {
  const reponse = await fetch(new URL(`data/modules/${slug}.json`, RACINE));
  return reponse.json();
}));

const toutes = modules.flatMap((m) => m.quiz.map((q) => ({
  slug: m.slug,
  titre: m.titre,
  question: q.question,
  reponse: q.choix[q.bonne],
  explication: q.explication,
  source: q.source,
})));

const zone = document.querySelector('#carte');
const selecteur = document.querySelector('#module');
for (const m of modules) {
  const option = document.createElement('option');
  option.value = m.slug;
  option.textContent = `${m.numero}. ${m.titre}`;
  selecteur.append(option);
}

const el = (balise, texte, classe) => {
  const e = document.createElement(balise);
  if (texte) e.textContent = texte;
  if (classe) e.className = classe;
  return e;
};

// On mélange le paquet (algorithme de Fisher-Yates), puis on le parcourt :
// ainsi, on ne revoit une carte qu'après avoir vu toutes les autres.
function melanger(liste) {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

let paquet = [];
let position = 0;

function nouveauPaquet() {
  const filtre = selecteur.value;
  paquet = melanger(filtre ? toutes.filter((c) => c.slug === filtre) : toutes);
  position = 0;
  afficher();
}

function afficher() {
  const carte = paquet[position];
  const bloc = el('div', '', 'carte-revision');
  bloc.append(el('p', `${carte.titre} · carte ${position + 1} sur ${paquet.length}`, 'discret'));
  const question = el('p', carte.question);
  question.style.cssText = 'font-size:1.15rem;font-weight:700';
  bloc.append(question);

  const actions = el('div', '', 'boutons');
  const retourner = el('button', 'Voir la réponse', 'bouton');
  retourner.type = 'button';
  retourner.addEventListener('click', () => {
    retourner.remove();
    const reponse = el('p', carte.reponse);
    reponse.style.fontWeight = '700';
    reponse.style.color = 'var(--accent-texte)';
    const detail = el('p', carte.explication);
    question.after(reponse, detail);
    if (carte.source) detail.after(el('p', `Source : ${carte.source}`, 'discret'));
  });
  const suivante = el('button', 'Carte suivante', 'bouton secondaire');
  suivante.type = 'button';
  suivante.addEventListener('click', () => {
    position += 1;
    if (position >= paquet.length) nouveauPaquet();
    else afficher();
  });
  actions.append(retourner, suivante);
  zone.replaceChildren(bloc, actions);
}

selecteur.addEventListener('change', nouveauPaquet);
nouveauPaquet();
