// Tests de la logique de progression : points, jours d'affilée, révision espacée et badges.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  etatVide, noterJour, serie, marquerEtape, avancement, noterQuiz, niveau,
  noterCarte, cartesDues, repartitionBoites, nouveauxBadges, POINTS,
} from '../js/progression.js';

test('une étape ne rapporte des points qu\'une fois', () => {
  const e = etatVide();
  assert.equal(marquerEtape(e, 'bases', 0), POINTS.etape);
  assert.equal(marquerEtape(e, 'bases', 0), 0);
  assert.equal(e.xp, POINTS.etape);
  assert.deepEqual(e.dernier, { slug: 'bases', etape: 0 });
  assert.equal(avancement(e, 'bases', 4), 0.25);
});

test('le quiz garde le meilleur score et ne paie que le progrès', () => {
  const e = etatVide();
  assert.equal(noterQuiz(e, 'bases', 3, 5), 3 * POINTS.quiz);
  assert.equal(noterQuiz(e, 'bases', 2, 5), 0);
  assert.equal(e.quiz.bases.score, 3);
  assert.equal(noterQuiz(e, 'bases', 5, 5), 2 * POINTS.quiz);
});

test('les jours d\'affilée, y compris à cheval sur un changement de mois', () => {
  const e = etatVide();
  for (const j of ['2026-10-30', '2026-10-31', '2026-11-01']) noterJour(e, j);
  assert.equal(serie(e, '2026-11-01'), 3);
  assert.equal(serie(e, '2026-11-02'), 3, 'la série tient encore le lendemain');
  assert.equal(serie(e, '2026-11-03'), 0, 'un jour manqué la casse');
});

test('les niveaux demandent de plus en plus de points', () => {
  assert.deepEqual(niveau(0), { niveau: 1, reste: 0, seuil: 100 });
  assert.deepEqual(niveau(100), { niveau: 2, reste: 0, seuil: 200 });
  assert.deepEqual(niveau(350), { niveau: 3, reste: 50, seuil: 300 });
});

test('révision : une réussite espace la carte, un échec la ramène', () => {
  const e = etatVide();
  noterCarte(e, 'a', true, '2026-11-04');
  assert.deepEqual(e.cartes.a, { boite: 1, prochaine: '2026-11-05' });
  noterCarte(e, 'a', true, '2026-11-05');
  assert.deepEqual(e.cartes.a, { boite: 2, prochaine: '2026-11-08' });
  noterCarte(e, 'a', false, '2026-11-08');
  assert.deepEqual(e.cartes.a, { boite: 1, prochaine: '2026-11-08' });
});

test('révision : seules les cartes nouvelles ou arrivées à échéance sont dues', () => {
  const e = etatVide();
  noterCarte(e, 'a', true, '2026-11-04');
  assert.deepEqual(cartesDues(e, ['a', 'b'], '2026-11-04'), ['b']);
  assert.deepEqual(cartesDues(e, ['a', 'b'], '2026-11-05'), ['a', 'b']);
  assert.deepEqual(repartitionBoites(e, ['a', 'b']).slice(0, 2), [1, 1]);
});

test('les badges ne sont décernés qu\'une fois', () => {
  const e = etatVide();
  marquerEtape(e, 'bases', 0);
  assert.deepEqual(nouveauxBadges(e, '2026-11-04').map((b) => b.id), ['premier-pas']);
  assert.deepEqual(nouveauxBadges(e, '2026-11-04'), []);
});
