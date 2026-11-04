// Progression de l'apprenant : étapes vues, points, jours d'affilée, badges et révision espacée.
// La partie logique est pure (elle reçoit un état et renvoie le résultat) : elle se teste sans navigateur.
// Tout reste dans le navigateur de la personne : aucun compte et aucune donnée envoyée.

export const POINTS = { etape: 10, quiz: 5, moduleFini: 50, carte: 2 };

export function etatVide() {
  return { xp: 0, etapes: {}, quiz: {}, jours: [], cartes: {}, dernier: null, badges: [] };
}

/** Date locale au format AAAA-MM-JJ. */
export function jour(date = new Date()) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const j = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${j}`;
}

const plusJours = (texte, n) => {
  const [a, m, j] = texte.split('-').map(Number);
  return jour(new Date(a, m - 1, j + n));
};

/** Note l'activité du jour. */
export function noterJour(etat, aujourdhui = jour()) {
  if (!etat.jours.includes(aujourdhui)) etat.jours = [...etat.jours, aujourdhui].sort().slice(-60);
  return etat;
}

/** Nombre de jours d'affilée, en comptant aujourd'hui ou, à défaut, hier. */
export function serie(etat, aujourdhui = jour()) {
  const jours = new Set(etat.jours);
  let curseur = jours.has(aujourdhui) ? aujourdhui : plusJours(aujourdhui, -1);
  let n = 0;
  while (jours.has(curseur)) { n += 1; curseur = plusJours(curseur, -1); }
  return n;
}

/** Marque une étape comme vue. Elle ne rapporte des points qu'une fois. */
export function marquerEtape(etat, slug, index) {
  const vues = etat.etapes[slug] ?? [];
  etat.dernier = { slug, etape: index };
  if (vues.includes(index)) return 0;
  etat.etapes[slug] = [...vues, index];
  etat.xp += POINTS.etape;
  return POINTS.etape;
}

export function avancement(etat, slug, total) {
  return total ? Math.min(1, (etat.etapes[slug]?.length ?? 0) / total) : 0;
}

/** Garde le meilleur score d'un quiz. Seul le gain par rapport au record rapporte des points. */
export function noterQuiz(etat, slug, score, total) {
  const avant = etat.quiz[slug]?.score ?? 0;
  if (score <= avant && etat.quiz[slug]) return 0;
  etat.quiz[slug] = { score, total };
  const gain = (score - avant) * POINTS.quiz;
  etat.xp += gain;
  return gain;
}

export function niveau(xp) {
  // Chaque niveau demande 100 points de plus que le précédent.
  let n = 1; let seuil = 100; let reste = xp;
  while (reste >= seuil) { reste -= seuil; n += 1; seuil += 100; }
  return { niveau: n, reste, seuil };
}

// --- Révision espacée (méthode de Leitner) ---
// Une carte réussie passe dans la boîte suivante, revue plus tard. Une carte ratée revient en boîte 1.
export const DELAIS_JOURS = [0, 1, 3, 7, 16, 35];

export function noterCarte(etat, id, reussi, aujourdhui = jour()) {
  const carte = etat.cartes[id] ?? { boite: 0 };
  const boite = reussi ? Math.min(DELAIS_JOURS.length - 1, carte.boite + 1) : 1;
  etat.cartes[id] = { boite, prochaine: plusJours(aujourdhui, reussi ? DELAIS_JOURS[boite] : 0) };
  if (reussi) etat.xp += POINTS.carte;
  return etat.cartes[id];
}

/** Les cartes à revoir : les nouvelles et celles dont la date est arrivée. */
export function cartesDues(etat, ids, aujourdhui = jour()) {
  return ids.filter((id) => !etat.cartes[id] || etat.cartes[id].prochaine <= aujourdhui);
}

export function repartitionBoites(etat, ids) {
  const boites = Array(DELAIS_JOURS.length).fill(0);
  for (const id of ids) boites[etat.cartes[id]?.boite ?? 0] += 1;
  return boites;
}

// --- Badges ---
export const BADGES = [
  { id: 'premier-pas', nom: 'Premier pas', picto: 'goutte', test: (e) => Object.values(e.etapes).some((v) => v.length > 0) },
  { id: 'quiz-parfait', nom: 'Sans faute', picto: 'cible', test: (e) => Object.values(e.quiz).some((q) => q.score === q.total) },
  { id: 'trois-jours', nom: '3 jours de suite', picto: 'feu', test: (e, a) => serie(e, a) >= 3 },
  { id: 'cent-points', nom: '100 points', picto: 'etoile', test: (e) => e.xp >= 100 },
  { id: 'reviseur', nom: 'Réviseur', picto: 'cartes', test: (e) => Object.values(e.cartes).some((c) => c.boite >= 3) },
];

/** Renvoie les badges obtenus à l'instant, et les ajoute à l'état. */
export function nouveauxBadges(etat, aujourdhui = jour()) {
  const nouveaux = BADGES.filter((b) => !etat.badges.includes(b.id) && b.test(etat, aujourdhui));
  etat.badges = [...etat.badges, ...nouveaux.map((b) => b.id)];
  return nouveaux;
}

// --- Enregistrement ---
// Le stockage peut être bloqué (navigation privée) : le site reste utilisable, sans mémoire.
const CLE = 'epuration-progression';

export function charger() {
  try {
    return { ...etatVide(), ...JSON.parse(localStorage.getItem(CLE) ?? '{}') };
  } catch {
    return etatVide();
  }
}

export function sauver(etat) {
  try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch { /* sans gravité */ }
}
