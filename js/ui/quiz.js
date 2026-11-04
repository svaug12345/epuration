// Quiz à correction immédiate. La réponse s'affiche dès qu'on choisit, avec l'explication :
// c'est le moment où l'on retient le mieux.

const el = (balise, texte, classe) => {
  const e = document.createElement(balise);
  if (texte) e.textContent = texte;
  if (classe) e.className = classe;
  return e;
};

// Identifiant de groupe pour les boutons radio, unique même avec plusieurs quiz.
let compteur = 0;

/** @param {{question: string, choix: string[], bonne: number, explication: string, source?: string}[]} questions */
export function creerQuiz(questions) {
  const bloc = document.createElement('div');
  const score = el('p', '', 'discret');
  score.setAttribute('aria-live', 'polite');
  let repondues = 0;
  let justes = 0;

  questions.forEach((q, i) => {
    const groupe = `quiz-${compteur += 1}`;
    const section = el('div', '', 'question');
    const champ = document.createElement('fieldset');
    champ.append(el('legend', `${i + 1}. ${q.question}`));

    q.choix.forEach((choix, j) => {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = groupe;
      radio.addEventListener('change', () => {
        // Une seule tentative par question : on fige les choix après la réponse.
        champ.querySelectorAll('input').forEach((r) => { r.disabled = true; });
        const juste = j === q.bonne;
        repondues += 1;
        if (juste) justes += 1;
        const correction = el('div', '', `alerte correction ${juste ? 'ok' : 'attention'}`);
        const texte = document.createElement('p');
        texte.append(el('strong', juste ? 'Juste. ' : `Pas tout à fait. Réponse : ${q.choix[q.bonne]}. `), q.explication);
        correction.append(texte);
        if (q.source) correction.append(el('small', `Source : ${q.source}`));
        champ.append(correction);
        if (repondues === questions.length) score.textContent = `Score : ${justes} sur ${questions.length}.`;
      });
      label.append(radio, el('span', choix));
      champ.append(label);
    });
    section.append(champ);
    bloc.append(section);
  });
  bloc.append(score);
  return bloc;
}
