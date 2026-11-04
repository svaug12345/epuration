// Tests des calculateurs lit bactérien, lagunage, méthanisation et choix du procédé.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { indexerRegles } from '../js/regles.js';
import { analyserLit } from '../js/moteur/lits-bacteriens.js';
import { analyserLagune, constanteK_par_j } from '../js/moteur/lagunage.js';
import { analyserDigesteur } from '../js/moteur/methanisation.js';
import { garantiesPossibles } from '../js/moteur/choix-procede.js';

const R = indexerRegles(JSON.parse(await readFile(new URL('../data/regles.json', import.meta.url), 'utf8')));
const proche = (obtenu, attendu, marge) => assert.ok(Math.abs(obtenu - attendu) <= marge, `${obtenu} ≠ ${attendu}`);
const a = (resultat, id) => resultat.alertes.some((alerte) => alerte.id === id);

// --- Lit bactérien (p. 106-107) ---
// L'exemple de l'ATV : 0,4 kg DBO5/m³.j avec σ = 100 m²/m³ donne 4 g DBO5/m².j.
const lit = { debit_m3_j: 400, dbo5Entree_mg_l: 200, surface_m2: 100, hauteur_m: 2, surfaceSpecifique_m2_m3: 100, bras: 2, tours_par_h: 60, biodisque: 0 };

test('lit : retrouve l\'exemple de l\'ATV, p. 107', () => {
  const r = analyserLit(lit, R);
  proche(r.chargeVolumique_kgDBO5_par_m3_j, 0.4, 1e-9);
  proche(r.flux_gDBO5_par_m2_j, 4, 1e-9);
  assert.ok(a(r, 'pas-nitrification'));
  assert.ok(a(r, 'decanteur'));
});

test('lit : force de rinçage S = Ch / (a·n), Ch en mm/h, p. 106', () => {
  // Ch = 400 m³/j sur 100 m² = 4 m/j = 166,7 mm/h ; 2 bras à 60 t/h : S ≈ 1,39 mm.
  const r = analyserLit(lit, R);
  proche(r.chargeHydraulique_m_h, 0.1667, 0.001);
  proche(r.forceRincage_mm, 1.389, 0.001);
});

test('lit : un biodisque tolère 4 g/m².j pour nitrifier, un lit ordinaire 2 (p. 107)', () => {
  const faible = { ...lit, debit_m3_j: 300 }; // flux = 3 g/m².j
  assert.ok(a(analyserLit(faible, R), 'pas-nitrification'));
  assert.ok(!a(analyserLit({ ...faible, biodisque: 1 }, R), 'pas-nitrification'));
});

test('lit : à 2 g/m².j ou moins, pas d\'alerte de nitrification', () => {
  const r = analyserLit({ ...lit, debit_m3_j: 200 }, R);
  assert.ok(!a(r, 'pas-nitrification'));
  assert.ok(!a(r, 'decanteur'));
});

// --- Lagunage (p. 263-267) ---
test('lagune : k du Tab. 12.I retrouvé, interpolé entre deux températures', () => {
  assert.equal(constanteK_par_j(20, R).valeur, 0.35);
  proche(constanteK_par_j(22.5, R).valeur, 0.44, 1e-9);
  assert.equal(constanteK_par_j(50, R).horsPlage, true);
});

test('lagune : S1 = S0 / (1 + k·θ), p. 263', () => {
  const r = analyserLagune({ dbo5Entree_mg_l: 200, temperature_C: 20, sejour_j: 20, habitants_EH: 1000 }, R);
  proche(r.dbo5Sortie_mg_l, 25, 1e-9); // 200 / (1 + 0,35 × 20)
  proche(r.rendement_pct, 87.5, 1e-9);
  assert.equal(r.surface_m2, 5000); // 5 m²/EH
  assert.equal(r.surfaceAllemande_m2, 10000); // 10 m²/EH
});

test('lagune : prévision à prendre avec prudence au-delà de 90 % de rendement', () => {
  const r = analyserLagune({ dbo5Entree_mg_l: 200, temperature_C: 30, sejour_j: 40, habitants_EH: 1000 }, R);
  assert.ok(a(r, 'rendement-eleve'));
});

// --- Méthanisation (p. 197) ---
test('digesteur : θ = V / Q et lecture des seuils 3, 10 et 30 j', () => {
  const base = { volume_m3: 1000, debitBoues_m3_j: 50 };
  const r = analyserDigesteur(base, R);
  assert.equal(r.age_j, 20);
  assert.equal(r.alertes.filter((x) => x.niveau === 'danger' || x.niveau === 'attention').length, 0);
  assert.ok(a(analyserDigesteur({ ...base, debitBoues_m3_j: 500 }, R), 'lessivage')); // 2 j
  assert.ok(a(analyserDigesteur({ ...base, debitBoues_m3_j: 200 }, R), 'sous-pratique')); // 5 j
  assert.ok(a(analyserDigesteur({ ...base, debitBoues_m3_j: 20 }, R), 'sur-pratique')); // 50 j
});

// --- Choix du procédé (p. 294) ---
test('choix : les lignes de l\'appendice sont retrouvées', () => {
  const pour35 = garantiesPossibles(35, R);
  assert.deepEqual(pour35.find((l) => l.procede === 'Boues activées').cvMax, 1.6);
  assert.deepEqual(pour35.find((l) => l.procede === 'Lit bactérien').cvMax, 0.5);
});

test('choix : on retient la ligne la plus permissive sous la cible, jamais au-dessus', () => {
  const pour28 = garantiesPossibles(28, R); // ni le lit à 30, ni les BA à 35 ne conviennent
  assert.equal(pour28.length, 1);
  assert.equal(pour28[0].procede, 'Boues activées');
  assert.equal(pour28[0].cvMax, 0.8);
  assert.equal(garantiesPossibles(10, R).length, 0);
});
