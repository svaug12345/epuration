// Questions à correction immédiate : la réponse s'affiche dès le choix, avec l'explication.
// C'est le moment où l'on retient le mieux.
import { picto } from '../pictos.js';

const el = (balise, texte, classe) => {
  const e = document.createElement(balise);
  if (texte) e.textContent = texte;
  if (classe) e.className = classe;
  return e;
};

let compteur = 0; // nom de groupe unique pour les boutons radio

/** Crée une question. surReponse(juste) est appelé au premier choix. */
export function creerQuestion(q, numero, { numeroter = true, surReponse } = {}) {
  const groupe = `q-${compteur += 1}`;
  const section = el('div', '', 'question');
  const champ = document.createElement('fieldset');
  champ.append(el('legend', numeroter ? `${numero + 1}. ${q.question}` : q.question));
  const labels = [];
  q.choix.forEach((choix, j) => {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = groupe;
    radio.addEventListener('change', () => {
      // Une seule tentative : on fige les choix, et on montre la bonne réponse.
      champ.querySelectorAll('input').forEach((r) => { r.disabled = true; });
      const juste = j === q.bonne;
      labels[q.bonne].classList.add('juste');
      if (!juste) label.classList.add('faux');
      const correction = el('div', '', `alerte correction ${juste ? 'ok' : 'attention'}`);
      correction.append(picto(juste ? 'coche' : 'ampoule', 20));
      const bloc = document.createElement('div');
      const texte = document.createElement('p');
      texte.append(el('strong', juste ? 'Exact ! ' : 'Pas tout à fait. '), q.explication);
      bloc.append(texte);
      if (q.source) bloc.append(el('small', `Source : ${q.source}`));
      correction.append(bloc);
      correction.style.marginTop = '.5rem';
      champ.append(correction);
      surReponse?.(juste);
    });
    label.append(radio, el('span', choix));
    labels.push(label);
    champ.append(label);
  });
  section.append(champ);
  return section;
}

/** Crée un quiz complet. surFin(score, total) est appelé après la dernière réponse. */
export function creerQuiz(questions, surFin) {
  const bloc = document.createElement('div');
  const score = el('p', '', 'carte');
  score.setAttribute('aria-live', 'polite');
  score.style.cssText = 'display:none;font-family:var(--titre);font-weight:800;font-size:1.2rem;text-align:center';
  let repondues = 0;
  let justes = 0;
  questions.forEach((q, i) => {
    bloc.append(creerQuestion(q, i, {
      surReponse: (juste) => {
        repondues += 1;
        if (juste) justes += 1;
        if (repondues === questions.length) {
          score.style.display = 'block';
          score.textContent = `Votre score : ${justes} sur ${questions.length}`;
          surFin?.(justes, questions.length);
        }
      },
    }));
  });
  bloc.append(score);
  return bloc;
}
