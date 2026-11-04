// Tests de l'arbre de diagnostic : ils contrôlent aussi la qualité du fichier de données.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { demarrer, repondre, verifierArbre } from '../js/diagnostic/moteur.js';

const arbre = JSON.parse(await readFile(new URL('../data/diagnostic.json', import.meta.url), 'utf8'));

test('l\'arbre est sain : pas de lien mort, de boucle ni de conclusion sans source', () => {
  assert.deepEqual(verifierArbre(arbre), []);
});

test('verifierArbre détecte les défauts', () => {
  const casse = {
    symptomes: [{ id: 's', depart: 'a' }],
    noeuds: {
      a: { question: 'q', reponses: [{ texte: 'x', suivant: 'b' }, { texte: 'y', suivant: 'manquant' }, { texte: 'z', suivant: 'a' }] },
      b: { cause: 'c', explication: 'e', remedes: [] },
      orphelin: { cause: 'c', explication: 'e', remedes: [], sources: ['p'] },
    },
  };
  const problemes = verifierArbre(casse).join(' | ');
  assert.match(problemes, /Lien mort/);
  assert.match(problemes, /Boucle/);
  assert.match(problemes, /sans source/);
  assert.match(problemes, /jamais atteinte/);
});

test('parcours : SVI élevé, filaments et manque d\'oxygène mènent à la bonne cause (p. 130-132)', () => {
  let noeud = demarrer(arbre, 'boue-decante-mal');
  noeud = repondre(arbre, noeud.id, 0); // SVI de 200 ou plus
  noeud = repondre(arbre, noeud.id, 0); // filaments visibles
  noeud = repondre(arbre, noeud.id, 0); // oxygène sous 2 mg/l
  assert.match(noeud.cause, /oxygène/i);
  assert.ok(noeud.sources.some((s) => /130/.test(s)));
});

test('un symptôme inconnu est refusé', () => {
  assert.throws(() => demarrer(arbre, 'inconnu'), /inconnu/);
});
