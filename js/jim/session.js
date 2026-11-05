// Jim, le cœur commun : ouvrir et fermer une conversation vocale, lire le contexte de la page.
//
// Deux interfaces s'en servent :
//   - js/ui/jim.js       : le petit bouton dans la barre du haut, présent sur toutes les pages ;
//   - js/ui/assistant.js : la grande page « Assistant vocal » du Labo.
// Elles ne s'occupent que de l'affichage ; tout ce qui parle à ElevenLabs est ici, une seule fois.

// Identifiant public de l'agent (il figure forcément dans la page : il n'a rien de secret).
export const AGENT_ID = 'agent_0501m6n51nz3e7vbx3sesy59mrp9';
// Version figée du kit ElevenLabs : une mise à jour du kit ne peut pas casser le site sans prévenir.
const SDK = 'https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.32.1/+esm';

// Limites de taille du contexte envoyé : assez pour comprendre la page, pas au point de ralentir Jim.
const MAX_TEXTE = 1800;
const MAX_CHAMPS = 25;

// ------------------------------------------------------------------
// 1. Les sigles : Jim les écrit « comme ils se prononcent » pour que la voix française les lise bien
//    (« dé bé o cinq »). À l'écran, on remet l'écriture habituelle.
// ------------------------------------------------------------------
const SIGLES = [
  [/d[ée][\s-]?b[ée][\s-]?o[\s-]?cinq/gi, 'DBO5'],
  [/d[ée][\s-]?c[ée][\s-]?o\b/gi, 'DCO'],
  [/\bM[\s-]E[\s-]S\b/g, 'MES'],
  [/\bS[\s-]V[\s-]I\b/g, 'SVI'],
  [/\bN[\s-]H[\s-]4\b/g, 'NH4'],
  [/\bN[\s-]O[\s-]3\b/g, 'NO3'],
  [/d[ée][\s-]?e[\s-]?r[\s-]?u[\s-]deux/gi, 'DERU 2'],
];
export const pourEcran = (texte) => SIGLES.reduce((t, [motif, sigle]) => t.replace(motif, sigle), texte);

// ------------------------------------------------------------------
// 2. Le contexte : ce que la personne a sous les yeux, pour que Jim comprenne « ça », « ce résultat »…
// ------------------------------------------------------------------
const nettoyer = (t) => t.replace(/\s+/g, ' ').trim();

/** Nom de la page, dit à l'oral par Jim : « le module Les boues activées », « l'outil Lagunage »… */
function nomPage() {
  const h1 = nettoyer(document.querySelector('main h1')?.textContent ?? '');
  const chemin = location.pathname;
  if (/\/modules\/[^/]+\.html$/.test(chemin)) return `le module « ${h1} »`;
  if (/\/outils\/[^/]+\.html$/.test(chemin)) return `l'outil « ${h1} »`;
  if (/\/modules\/(index\.html)?$/.test(chemin)) return 'la page du parcours';
  if (/\/outils\/(index\.html)?$/.test(chemin)) return 'la page du Labo';
  if (chemin.endsWith('revision.html')) return 'la page de révision';
  if (chemin.endsWith('glossaire.html')) return 'le glossaire';
  return h1 ? `la page « ${h1} »` : "l'accueil du site";
}

/** Les champs d'un calculateur, avec leur libellé et la valeur saisie : « Débit (m³/j) : 2000 ». */
function champs(racine) {
  const lignes = [];
  for (const champ of racine.querySelectorAll('input, select')) {
    if (champ.type === 'hidden' || champ.type === 'button' || champ.type === 'submit') continue;
    // Le libellé : <label for="…">, sinon le <label> qui entoure le champ, sinon aria-label.
    const libelle = (champ.id && racine.querySelector(`label[for="${CSS.escape(champ.id)}"]`))
      || champ.closest('label');
    const nom = nettoyer(libelle?.textContent ?? champ.getAttribute('aria-label') ?? champ.name ?? '');
    let valeur = champ.value;
    if (champ.type === 'checkbox' || champ.type === 'radio') {
      if (!champ.checked) continue;
      valeur = 'coché';
    }
    if (nom && valeur !== '') lignes.push(`- ${nom} : ${valeur}`);
    if (lignes.length >= MAX_CHAMPS) break;
  }
  return lignes;
}

/** Tout le contexte de la page, en texte simple (titre de page + valeurs saisies + texte visible). */
export function contextePage() {
  const main = document.querySelector('main');
  if (!main) return { titre: nomPage(), texte: 'Pas de contexte particulier.' };
  const morceaux = [];
  const saisies = champs(main);
  if (saisies.length) morceaux.push('Valeurs saisies :', ...saisies);
  // innerText ne garde que le texte réellement affiché (les onglets cachés sont ignorés),
  // y compris les résultats des calculateurs et l'étape de leçon en cours.
  let visible = nettoyer(main.innerText ?? '');
  if (visible.length > MAX_TEXTE) visible = `${visible.slice(0, MAX_TEXTE)}…`;
  morceaux.push('Texte affiché :', visible);
  return { titre: nomPage(), texte: morceaux.join('\n') };
}

// ------------------------------------------------------------------
// 3. La conversation elle-même.
// ------------------------------------------------------------------

/**
 * Ouvre une conversation avec Jim.
 * rappels : { surEtat(etat), surMessage(source, texte), surFin(), surErreur(e) }
 *   etat vaut 'parle' (Jim parle) ou 'ecoute' (c'est à vous).
 * options.suivre : envoie à Jim les changements de la page pendant l'appel (étape suivante, valeur modifiée).
 * Renvoie un objet { arreter(), envoyer(texte) }.
 */
export async function ouvrirSession(rappels, { suivre = true } = {}) {
  // 1) Le micro, demandé par nous pour pouvoir afficher un message clair en cas de refus.
  await navigator.mediaDevices.getUserMedia({ audio: true });
  // 2) Le kit ElevenLabs, chargé seulement maintenant : les pages restent légères sans appel.
  const { Conversation } = await import(SDK);

  const depart = contextePage();
  let dernier = depart.texte;
  let observateur = null;
  let minuterie = null;

  // Quand la page change pendant l'appel, on prévient Jim discrètement (sans qu'il réponde à voix haute) :
  // sendContextualUpdate ajoute une information à la conversation, sans déclencher de réponse.
  const surveiller = (conversation) => {
    const main = document.querySelector('main');
    if (!main || !suivre) return;
    const verifier = () => {
      clearTimeout(minuterie);
      // On attend 2 s de calme : inutile d'envoyer chaque mouvement de curseur.
      minuterie = setTimeout(() => {
        const { texte } = contextePage();
        if (texte === dernier) return;
        dernier = texte;
        conversation.sendContextualUpdate?.(`La page de la personne a changé. Elle affiche maintenant :\n${texte}`);
      }, 2000);
    };
    observateur = new MutationObserver(verifier);
    observateur.observe(main, { childList: true, subtree: true, characterData: true });
    main.addEventListener('input', verifier);
    main.addEventListener('change', verifier);
  };
  const nettoyerSuivi = () => {
    observateur?.disconnect();
    clearTimeout(minuterie);
  };

  const conversation = await Conversation.startSession({
    agentId: AGENT_ID,
    // Les « variables dynamiques » remplissent {{page_titre}} et {{page_contexte}} dans les consignes de Jim.
    dynamicVariables: { page_titre: depart.titre, page_contexte: depart.texte },
    onConnect: () => rappels.surEtat?.('parle'), // il commence par son message d'accueil
    onModeChange: ({ mode }) => rappels.surEtat?.(mode === 'speaking' ? 'parle' : 'ecoute'),
    onMessage: ({ source, message }) => { if (message) rappels.surMessage?.(source, message); },
    onDisconnect: () => { nettoyerSuivi(); rappels.surFin?.(); },
    onError: (e) => { nettoyerSuivi(); rappels.surErreur?.(e); },
  });
  surveiller(conversation);

  return {
    arreter: () => conversation.endSession(),
    // Envoyer une phrase écrite, comme si on l'avait dite (cartes d'idées).
    envoyer: (texte) => conversation.sendUserMessage?.(texte),
  };
}

/** Message d'erreur lisible : micro refusé, ou autre souci (réseau, service indisponible). */
export const messageErreur = (e) => (e && e.name === 'NotAllowedError'
  ? 'Le micro est bloqué : autorisez-le dans les réglages du navigateur, puis réessayez.'
  : 'Impossible de joindre Jim pour l\'instant. Vérifiez la connexion et réessayez.');
