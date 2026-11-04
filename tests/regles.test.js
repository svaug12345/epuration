// Tests de cohérence de data/regles.json, à lancer avec : node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { indexerRegles, val, interpoler } from '../js/regles.js';

const donnees = JSON.parse(await readFile(new URL('../data/regles.json', import.meta.url), 'utf8'));

test('chaque règle porte sa traçabilité complète', () => {
  for (const regle of donnees.regles) {
    assert.ok(regle.id && regle.libelle && regle.unite, `champ manquant : ${regle.id}`);
    assert.ok(regle.source?.ouvrage && regle.source?.page && regle.source?.ref, `source incomplète : ${regle.id}`);
    assert.equal(typeof regle.verifie, 'boolean', `statut manquant : ${regle.id}`);
  }
});

test('les identifiants sont uniques', () => {
  const ids = donnees.regles.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('une valeur non vérifiée est refusée', () => {
  const index = indexerRegles({ regles: [{ id: 'essai', valeur: 1, verifie: false }] });
  assert.throws(() => val(index, 'essai'), /non vérifiée/);
});

test('une règle inconnue est refusée', () => {
  assert.throws(() => val(indexerRegles(donnees), 'existe.pas'), /inconnue/);
});

test('interpoler retrouve les points, le milieu et signale le hors-plage', () => {
  assert.deepEqual(interpoler([1, 2], [10, 20], 1), { valeur: 10, horsPlage: false });
  assert.deepEqual(interpoler([1, 2], [10, 20], 1.5), { valeur: 15, horsPlage: false });
  assert.deepEqual(interpoler([1, 2], [10, 20], 3), { valeur: 20, horsPlage: true });
  assert.deepEqual(interpoler([1, 2], [10, 20], 0), { valeur: 10, horsPlage: true });
});
