// Contrôle la qualité des fichiers de modules : structure, liens, quiz et longueur de voix off.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const SLUGS = ['bases', 'boues-activees', 'lits-bacteriens', 'azote-phosphore', 'methanisation', 'lagunage', 'reglementation-procedes'];
const racine = new URL('../', import.meta.url);
const modules = await Promise.all(SLUGS.map(async (slug) => JSON.parse(await readFile(new URL(`data/modules/${slug}.json`, racine), 'utf8'))));

test('chaque module possède toutes ses parties', () => {
  modules.forEach((m, i) => {
    assert.equal(m.numero, i + 1);
    assert.equal(m.slug, SLUGS[i]);
    assert.ok(m.scenes.length >= 5, `${m.slug} : trop peu de scènes`);
    assert.ok(m.approfondir.length >= 3, `${m.slug} : niveau Approfondir trop court`);
    assert.ok(m.memo.length >= 5, `${m.slug} : fiche mémo trop courte`);
    assert.ok(m.quiz.length >= 5, `${m.slug} : quiz trop court`);
    assert.ok(m.sources.length >= 1, `${m.slug} : sans source`);
    assert.ok(m.cas.enonce && m.cas.solution, `${m.slug} : étude de cas incomplète`);
  });
});

test('chaque question de quiz désigne une bonne réponse existante', () => {
  for (const m of modules) {
    for (const q of m.quiz) {
      assert.ok(q.bonne >= 0 && q.bonne < q.choix.length, q.question);
      assert.ok(q.explication, q.question);
    }
  }
});

test('les schémas et les liens de cas existent', async () => {
  for (const m of modules) {
    for (const scene of m.scenes) {
      if (scene.schema) await access(new URL(`img/schemas/${scene.schema}.svg`, racine));
    }
    if (m.cas.lien) await access(new URL(m.cas.lien, racine));
    await access(new URL(`modules/${m.slug}.html`, racine));
    if (m.suivant) assert.ok(SLUGS.includes(m.suivant.slug));
  }
});

test('la voix off dure au moins 3 minutes (environ 19 caractères par seconde)', () => {
  for (const m of modules) {
    const caracteres = m.scenes.reduce((total, s) => total + s.narration.length, 0);
    assert.ok(caracteres / 19 >= 180, `${m.slug} : ${caracteres} caractères, soit ${Math.round(caracteres / 19)} s`);
  }
});
