// Tests de la nitrification et de la dénitrification (chap. 10, p. 243-245, et chap. 8, p. 226-227).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { indexerRegles } from '../js/regles.js';
import {
  tauxCroissance_par_j,
  ageMinimalNitrification_j,
  analyserAzote,
} from '../js/moteur/nitrification.js';

const R = indexerRegles(JSON.parse(await readFile(new URL('../data/regles.json', import.meta.url), 'utf8')));
const proche = (obtenu, attendu, marge) => assert.ok(Math.abs(obtenu - attendu) <= marge, `${obtenu} ≠ ${attendu}`);

test('croissance : µ = 0,47 · 1,103^(T−15), éq. 10.3', () => {
  proche(tauxCroissance_par_j(15, R), 0.47, 1e-9);
  proche(tauxCroissance_par_j(25, R), 1.253, 0.001);
  proche(tauxCroissance_par_j(5, R), 0.176, 0.001);
});

test('âge minimal : inverse du taux de croissance', () => {
  proche(ageMinimalNitrification_j(15, R), 2.13, 0.01);
  proche(ageMinimalNitrification_j(5, R), 5.67, 0.01);
});

test('oxygène : 4,33 g O2/g N, p. 243', () => {
  const r = analyserAzote({ debit_m3_j: 1000, azoteANitrifier_mg_l: 40, azoteADenitrifier_mg_l: 0, temperature_C: 15, oxygene_mg_l: 2, ageBoues_j: 10 }, R);
  proche(r.oxygene_kg_j, 173.2, 0.01); // 40 kg N/j × 4,33
  assert.equal(r.methanol_kg_j, 0);
});

test('méthanol : 2,5 g/g N, p. 227', () => {
  const r = analyserAzote({ debit_m3_j: 1000, azoteANitrifier_mg_l: 0, azoteADenitrifier_mg_l: 20, temperature_C: 15, oxygene_mg_l: 2, ageBoues_j: 10 }, R);
  assert.equal(r.methanol_kg_j, 50);
});

test('alertes : oxygène sous 1 mg/l, âge trop court, chaleur', () => {
  const base = { debit_m3_j: 1000, azoteANitrifier_mg_l: 40, azoteADenitrifier_mg_l: 0, temperature_C: 15, oxygene_mg_l: 2, ageBoues_j: 10 };
  assert.ok(analyserAzote({ ...base, oxygene_mg_l: 0.5 }, R).alertes.some((a) => a.id === 'oxygene-bas'));
  assert.ok(analyserAzote({ ...base, ageBoues_j: 1 }, R).alertes.some((a) => a.id === 'age-court'));
  assert.ok(analyserAzote({ ...base, temperature_C: 33 }, R).alertes.some((a) => a.id === 'chaleur'));
  assert.equal(analyserAzote(base, R).alertes.filter((a) => a.niveau === 'danger').length, 0);
});
