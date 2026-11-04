// Liste des modules et des outils, partagée par l'accueil, le parcours et la recherche.
export const MODULES = [
  { slug: 'bases', titre: 'Les bases', sous: 'DBO, DCO, bactéries et loi de Monod', picto: 'goutte', etapes: 7 },
  { slug: 'boues-activees', titre: 'Les boues activées', sous: 'Charge, âge des boues, gonflement', picto: 'bulles', etapes: 7 },
  { slug: 'lits-bacteriens', titre: 'Les lits bactériens', sous: 'Biofilm, flux et force de rinçage', picto: 'couches', etapes: 7 },
  { slug: 'azote-phosphore', titre: "L'azote et le phosphore", sous: 'Nitrifier, dénitrifier, déphosphater', picto: 'atome', etapes: 8 },
  { slug: 'methanisation', titre: 'La méthanisation', sous: "De la pollution à l'énergie", picto: 'flamme', etapes: 7 },
  { slug: 'lagunage', titre: 'Le lagunage', sous: 'Algues, soleil et filières rustiques', picto: 'soleil', etapes: 7 },
  { slug: 'reglementation-procedes', titre: 'Réglementation et innovations', sous: 'DERU 2, membranes, anammox', picto: 'loi', etapes: 6 },
];

export const OUTILS = [
  { chemin: 'outils/boues-activees.html', titre: 'Simulateur boues activées', sous: 'Réglez la station, regardez le bassin réagir', picto: 'bulles', teinte: '' },
  { chemin: 'outils/docteur-step.html', titre: 'Docteur STEP', sous: 'Du symptôme au remède, en quelques questions', picto: 'stetho', teinte: 'mauve' },
  { chemin: 'outils/lit-bacterien.html', titre: 'Lit bactérien', sous: 'Flux sur le biofilm et force de rinçage', picto: 'couches', teinte: 'eau' },
  { chemin: 'outils/azote.html', titre: 'Azote', sous: 'Âge minimal selon la température, oxygène', picto: 'atome', teinte: 'vert' },
  { chemin: 'outils/methanisation.html', titre: 'Méthanisation', sous: "L'âge des boues d'un digesteur", picto: 'flamme', teinte: '' },
  { chemin: 'outils/lagunage.html', titre: 'Lagunage', sous: 'DBO5 de sortie, séjour et surface', picto: 'soleil', teinte: 'eau' },
  { chemin: 'outils/choix-procede.html', titre: 'Choix du procédé', sous: 'Quelle charge pour quelle qualité ?', picto: 'balance', teinte: 'mauve' },
];
