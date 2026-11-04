// Tests du calculateur boues activées. Les cas de référence viennent des tableaux du livre.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { indexerRegles } from '../js/regles.js';
import {
  chargeVolumique_kgDBO5_par_m3_j,
  chargeBoues_kgDBO5_par_kgMS_j,
  tempsSejour_h,
  ageBoues_j,
  classeCharge,
  effluentAttendu,
  analyserBouesActivees,
} from '../js/moteur/boues-activees.js';

const R = indexerRegles(JSON.parse(await readFile(new URL('../data/regles.json', import.meta.url), 'utf8')));
const proche = (obtenu, attendu, marge) => assert.ok(Math.abs(obtenu - attendu) <= marge, `${obtenu} ≠ ${attendu}`);

// Station d'exemple : 2 000 m³/j à 250 mg/l, bassin de 1 500 m³ à 4 g/l, 15 °C.
const station = { debit_m3_j: 2000, dbo5Entree_mg_l: 250, volume_m3: 1500, boues_g_l: 4, temperature_C: 15 };

test('charges et temps de séjour', () => {
  proche(chargeVolumique_kgDBO5_par_m3_j(2000, 250, 1500), 0.3333, 0.001); // 500 kg/j sur 1 500 m³
  proche(chargeBoues_kgDBO5_par_kgMS_j(0.3333, 4), 0.0833, 0.001);
  assert.equal(tempsSejour_h(1500, 2000), 18);
});

test('âge des boues : éq. 6.39, p. 160, avec les deux vérifications de la note de travail', () => {
  proche(ageBoues_j(0.2, R), 7.5, 0.05);
  proche(ageBoues_j(0.05, R), 35.6, 0.1);
});

test('classe de charge : chaque ligne du Tab. 6.I, p. 157, est retrouvée', () => {
  for (const [cb, nom] of [[0.05, 'Très faible'], [0.2, 'Faible'], [0.5, 'Moyenne'], [1.0, 'Forte'], [2.0, 'Très forte']]) {
    assert.equal(classeCharge(cb, R).nom, nom);
  }
});

test('effluent : chaque colonne du Tab. 6.III, p. 158, est retrouvée', () => {
  assert.deepEqual(
    { ...effluentAttendu(0.15, R), horsPlage: undefined },
    { dbo5: 5, dco: 20, nh4: 2.5, norg: 0.5, no3: 29, n2: 10, horsPlage: undefined },
  );
  assert.equal(effluentAttendu(0.30, R).nh4, 22);
  assert.equal(effluentAttendu(0.50, R).dbo5, 25);
  assert.equal(effluentAttendu(1.00, R).dco, 120);
});

test('effluent : pas d\'extrapolation hors du tableau', () => {
  const resultat = effluentAttendu(3, R);
  assert.equal(resultat.dbo5, 50);
  assert.equal(resultat.horsPlage, true);
});

test('faible charge à 15 °C : nitrification possible', () => {
  const r = analyserBouesActivees(station, R);
  assert.equal(r.nitrificationPossible, true);
  assert.equal(r.classe.nom, 'Très faible');
});

test('alerte : Cb > 0,35 interdit la nitrification (p. 161)', () => {
  const r = analyserBouesActivees({ ...station, volume_m3: 300 }, R); // Cb ≈ 0,42
  assert.equal(r.nitrificationPossible, false);
  assert.ok(r.alertes.some((a) => a.id === 'pas-nitrification'));
});

test('alerte : charge entre 0,5 et 1 à éviter (p. 160) et risque de gonflement (p. 133)', () => {
  const r = analyserBouesActivees({ ...station, volume_m3: 170 }, R); // Cb ≈ 0,74
  assert.ok(r.alertes.some((a) => a.id === 'zone-eviter'));
  assert.ok(r.alertes.some((a) => a.id === 'gonflement'));
});

test('alerte : âge des boues entre 0,4 et 3 j (p. 160)', () => {
  const r = analyserBouesActivees({ ...station, volume_m3: 100 }, R); // Cb = 1,25, θc ≈ 0,95 j
  assert.ok(r.alertes.some((a) => a.id === 'age-court'));
});

test('alerte : boue très âgée (p. 160)', () => {
  const r = analyserBouesActivees({ ...station, debit_m3_j: 100 }, R); // Cb très faible
  assert.ok(r.ageBoues_j >= 100);
  assert.ok(r.alertes.some((a) => a.id === 'boue-brulee'));
});

test('alerte : l\'âge des boues ne suffit pas aux nitrifiants quand il fait froid', () => {
  // Cb = 0,34 : θc ≈ 4,1 j, sous le minimum d'environ 6,7 j à 5 °C, mais au-dessus à 15 °C.
  const froid = { ...station, volume_m3: 370, temperature_C: 5 };
  const r = analyserBouesActivees(froid, R);
  assert.equal(r.nitrificationPossible, false);
  assert.ok(r.alertes.some((a) => a.id === 'nitrification-froid'));
  assert.equal(analyserBouesActivees({ ...froid, temperature_C: 15 }, R).nitrificationPossible, true);
});

test('oxygène et boues : proportionnels à la DBO5 selon le Tab. 6.I', () => {
  const r = analyserBouesActivees({ ...station, volume_m3: 625 }, R); // Cb = 0,2 : classe faible
  assert.equal(r.classe.nom, 'Faible');
  proche(r.oxygene_kg_j.min, 650, 0.5); // 1,3 × 500 kg DBO5/j
  proche(r.oxygene_kg_j.max, 750, 0.5); // 1,5 × 500 kg DBO5/j
  assert.ok(r.boues_kg_j > 0 && r.boues_kg_j < 0.75 * 500);
});

test('entrée invalide : une erreur explicite plutôt qu\'un résultat faux', () => {
  assert.throws(() => analyserBouesActivees({ ...station, volume_m3: 0 }, R), /volume/i);
  assert.throws(() => analyserBouesActivees({ ...station, debit_m3_j: Number.NaN }, R), /débit/i);
});
