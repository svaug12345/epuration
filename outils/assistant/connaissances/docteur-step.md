# Docteur STEP : arbre de diagnostic (symptôme → cause probable → remède)

## Symptômes de départ
- La boue décante mal : Voile de boue haut au clarificateur, indice de boue élevé. (départ : svi)
- L'eau de sortie est trouble : Flocs fins ou matières en suspension à la sortie. (départ : trouble-age)
- Des boues remontent au clarificateur : Plaques de boue flottante en surface du décanteur. (départ : flottantes-nitrate)
- La nitrification décroche : L'ammonium remonte à la sortie. (départ : nit-oxygene)
- Le lit bactérien se colmate : Mares à la surface du lit, débit mal réparti. (départ : lit-saison)
- Le digesteur fonctionne mal : Production de gaz en baisse, digestion incomplète. (départ : dig-age)
- La lagune pose problème : Odeurs, couleur inhabituelle, eau de sortie chargée. (départ : lag-couleur)

## Étapes du diagnostic
### Étape « svi »
question : Que donne l'indice de boue (SVI) ? Mesurez le volume occupé par 1 g de boues après 30 minutes de décantation dans une éprouvette d'un litre.
aide : Une boue normale tourne autour de 50 ml/g.
- Si « 200 ml/g ou plus » → étape « microscope »
- Si « Entre 50 et 200 ml/g » → étape « svi-intermediaire »
- Si « Autour de 50 ml/g » → étape « svi-normal »

### Étape « microscope »
question : Au microscope, voyez-vous de nombreux filaments qui dépassent des flocs ?
- Si « Oui, des filaments » → étape « oxygene »
- Si « Non, pas de filaments » → étape « zoogleal »

### Étape « oxygene »
question : L'oxygène dissous dans le bassin descend-il sous 2 mg/l ?
- Si « Oui » → étape « cause-oxygene »
- Si « Non » → étape « septique »

### Étape « septique »
question : L'eau arrive-t-elle septique, avec des sulfures et une odeur d'œuf pourri ?
- Si « Oui » → étape « cause-septique »
- Si « Non » → étape « ph »

### Étape « ph »
question : Le pH du bassin est-il trop acide ?
- Si « Oui » → étape « cause-ph »
- Si « Non » → étape « nutriments »

### Étape « nutriments »
question : L'eau est-elle pauvre en azote ou en phosphore, et riche en sucres ? C'est le cas de certains effluents industriels.
- Si « Oui » → étape « cause-nutriments »
- Si « Non » → étape « charge »

### Étape « charge »
question : Où se situe la charge des boues ?
aide : Le calculateur boues activées vous la donne.
- Si « Au-dessus de 0,5 » → étape « cause-forte-charge »
- Si « Très faible » → étape « cause-faible-charge »
- Si « Entre les deux, ou je ne sais pas » → étape « cause-generale »

### Étape « cause-oxygene »
cause : Gonflement filamenteux lié au manque d'oxygène
explication : Quand l'oxygène manque, le centre des flocs s'asphyxie et les filaments prennent l'avantage. On rencontre alors le type 1701, Sphaerotilus natans ou Haliscomenobacter hydrossis.
remedes :
- Tenir au moins 2 mg/l d'oxygène dans le bassin, avec une régulation automatique.
- En urgence, si besoin : voir les remèdes généraux du gonflement (âge des boues, fer ou aluminium, chlore en dernier recours).
sources :
- Edeline 1997, p. 130 et 132

### Étape « cause-septique »
cause : Gonflement filamenteux lié à une eau septique
explication : Les sulfures nourrissent des filaments comme Thiothrix, Beggiatoa alba ou le type 021N.
remedes :
- Oxyder les sulfures avant le traitement biologique : aérer l'eau, ou chlorer à 5 à 10 mg/l sur l'eau brute ou la boue de retour.
- Rechercher l'origine de la septicité sur le réseau ou le prétraitement.
sources :
- Edeline 1997, p. 132 et 133

### Étape « cause-ph »
cause : Développement de champignons lié à un pH acide
explication : Un pH trop bas favorise les formes fongiques filamenteuses.
remedes :
- Identifier l'origine de l'acidité et ramener le pH vers la neutralité.
sources :
- Edeline 1997, p. 132

### Étape « cause-nutriments »
cause : Gonflement filamenteux lié à une carence en nutriments
explication : Thiothrix, Sphaerotilus natans et le type 021N profitent des eaux pauvres en azote et riches en sucres.
remedes :
- Corriger le manque d'azote : sel azoté, urée, recyclage de boue digérée ou apport d'eau d'égout urbaine.
- Si des actinomycètes filamenteux apparaissent, cas rare, vérifier le fer et le porter à 2 mg/l ou plus.
sources :
- Edeline 1997, p. 132 et 133

### Étape « cause-forte-charge »
cause : Gonflement lié à une charge élevée
explication : Au-dessus de 0,5 kg DBO5/kg MS.j, toutes les boues activées risquent de gonfler, et les bassins en mélange complet y sont plus vulnérables. La plage de 0,5 à 1 est à éviter pour la décantation.
remedes :
- Réduire la charge des boues : plus de boues dans le bassin, moins de charge reçue, ou plus de volume.
- Séparer les phases de respiration endogène, par exemple avec une cascade de bassins ou un fonctionnement discontinu.
- Tenter quelques jours d'aération sans alimentation, ce qui agit sur le gonflement filamenteux comme zoogléal.
sources :
- Edeline 1997, p. 133 et 160

### Étape « cause-faible-charge »
cause : Gonflement filamenteux lié à une charge trop faible
explication : Microthrix parvicella, Haliscomenobacter hydrossis, Nocardia et plusieurs types (021N, 0041, 0675, 0092, 0581, 0961, 0803) se plaisent dans ces conditions.
remedes :
- Diminuer l'âge des boues, ce qui avantage les formeurs de flocs à croissance rapide.
- Installer un sélecteur en tête : environ 1/20 du volume d'aération, 10 minutes de séjour.
sources :
- Edeline 1997, p. 132 et 133

### Étape « cause-generale »
cause : Gonflement filamenteux sans cause évidente
explication : Environ la moitié des installations connaissent un gonflement, permanent ou par épisodes. L'identification du filament au microscope oriente vers la cause.
remedes :
- À court terme : diminuer l'âge des boues.
- À long terme : compartimenter le bassin, ou créer un gradient de concentration avec un réacteur piston, une cascade ou un fonctionnement par bâchées.
- Sélecteur : environ 1/20 du volume d'aération et 10 minutes de séjour, pour y fixer idéalement 50 à 60 % de la DCO. Il peut rester non aéré.
- Fer ou aluminium à 20-50 mg/l : très favorable, ils floculent la boue.
- Chlore sur la boue de retour, de façon intermittente : environ 2 g Cl/kg de boues par jour, souvent 8 à 10 g. Il tue aussi les bonnes bactéries : au-delà de 5 g, l'eau se dégrade et la nitrification baisse.
sources :
- Edeline 1997, p. 132 et 133

### Étape « zoogleal »
cause : Gonflement zoogléal probable
explication : Sans filaments, le gonflement vient d'un excès d'eau liée, associé à Zoogloea ramigera. En manque d'azote, cette bactérie stocke le carbone dans une pellicule qui retient l'eau.
remedes :
- Rechercher et corriger une carence en azote.
- Tenter quelques jours d'aération sans alimentation.
- Une forte dose de chlore (90 mg/l) fait rendre l'eau liée : l'effet est immédiat, mais temporaire.
sources :
- Edeline 1997, p. 129 et 133

### Étape « svi-intermediaire »
cause : Décantation dégradée, sans gonflement franc
explication : La boue reste à surveiller. Le gonflement net se situe autour de 200 ml/g, mais la tendance compte autant que la valeur.
remedes :
- Suivre le SVI régulièrement et observer la boue au microscope.
- Vérifier l'oxygène, la charge des boues et l'âge des boues avec le calculateur.
sources :
- Edeline 1997, p. 129 et 130

### Étape « svi-normal »
cause : Le SVI ne montre pas de gonflement
explication : La boue décante normalement en éprouvette. Le problème peut venir du clarificateur lui-même, ce que ce livre ne permet pas de trancher ici.
remedes :
- Regarder le symptôme « des boues remontent au clarificateur » si des plaques flottent.
- Consulter le guide d'exploitation des stations à boues activées d'EPNAC pour contrôler l'ouvrage.
sources :
- Edeline 1997, p. 129

### Étape « trouble-age »
question : Quel est l'âge des boues ?
aide : Le calculateur boues activées l'estime depuis la charge.
- Si « Moins de 3 jours » → étape « cause-age-court »
- Si « De l'ordre de 100 jours » → étape « cause-brulee »
- Si « Entre les deux » → étape « trouble-charge »

### Étape « trouble-charge »
question : La charge des boues se situe-t-elle entre 0,5 et 1 kg DBO5/kg de boues par jour ?
- Si « Oui » → étape « cause-zone-eviter »
- Si « Non » → étape « cause-trouble-autre »

### Étape « cause-age-court »
cause : Boues trop jeunes
explication : Entre 0,4 et 3 jours, les protozoaires n'ont pas le temps de s'installer et la floculation reste insuffisante.
remedes :
- Réduire la purge de boues pour laisser l'âge remonter.
sources :
- Edeline 1997, p. 160

### Étape « cause-brulee »
cause : Boue trop âgée, dite « brûlée »
explication : Une boue très vieille contient beaucoup de cellules mortes et de débris. Elle flocule mal et gêne le clarificateur.
remedes :
- Augmenter la purge pour rajeunir la boue, progressivement.
sources :
- Edeline 1997, p. 160

### Étape « cause-zone-eviter »
cause : Charge dans la plage à éviter
explication : Entre 0,5 et 1, la boue sédimente mal. Cette plage est rarement pratiquée pour cette raison.
remedes :
- Sortir de cette plage, en général en augmentant la masse de boues ou le volume.
sources :
- Edeline 1997, p. 160

### Étape « cause-trouble-autre »
cause : Cause non identifiée par ces questions
explication : Âge et charge ne semblent pas en cause. Vérifiez d'abord si la boue décante mal en éprouvette.
remedes :
- Refaire le diagnostic avec le symptôme « la boue décante mal ».
sources :
- Edeline 1997, p. 160

### Étape « flottantes-nitrate »
question : L'eau de sortie contient-elle du nitrate au-dessus d'environ 16 mg/l ?
- Si « Oui » → étape « cause-denitrification »
- Si « Non » → étape « cause-flottantes-autre »

### Étape « cause-denitrification »
cause : Dénitrification dans le clarificateur
explication : Privées d'oxygène au fond du décanteur, les boues transforment le nitrate en azote gazeux. Les bulles les font remonter : environ 3 heures suffisent à produire assez de gaz pour la flottation.
remedes :
- Réduire le temps de séjour des boues dans le clarificateur, en renforçant leur reprise.
- Faire baisser le nitrate de sortie, avec une vraie étape de dénitrification en amont.
sources :
- Edeline 1997, p. 226

### Étape « cause-flottantes-autre »
cause : Dénitrification peu probable
explication : Sous environ 16 mg/l de nitrate, le phénomène ne se produit pas. Il faut chercher une autre cause, par exemple des mousses biologiques.
remedes :
- Observer la boue flottante au microscope et consulter le guide d'exploitation d'EPNAC.
sources :
- Edeline 1997, p. 226

### Étape « nit-oxygene »
question : L'oxygène dissous descend-il sous 1 mg/l ?
- Si « Oui » → étape « cause-nit-oxygene »
- Si « Non » → étape « nit-charge »

### Étape « nit-charge »
question : La charge des boues dépasse-t-elle 0,35 kg DBO5/kg de boues par jour ?
- Si « Oui » → étape « cause-nit-charge »
- Si « Non » → étape « nit-froid »

### Étape « nit-froid »
question : L'eau s'est-elle refroidie récemment, ou l'âge des boues est-il proche du minimum donné par l'outil Azote ?
- Si « Oui » → étape « cause-nit-froid »
- Si « Non » → étape « nit-toxique »

### Étape « nit-toxique »
question : Un rejet inhabituel est-il possible, ou dosez-vous des sels de fer ou d'aluminium ?
- Si « Oui » → étape « cause-nit-toxique »
- Si « Non » → étape « cause-nit-autre »

### Étape « cause-nit-oxygene »
cause : Manque d'oxygène pour les nitrifiants
explication : La flore nitrifiante demande au moins 1 mg/l d'oxygène. Elle en consomme beaucoup : environ 4,33 g par gramme d'azote. Vers 0,5 mg/l, Nitrobacter est presque totalement inhibé et du nitrite peut s'accumuler.
remedes :
- Augmenter l'aération et vérifier qu'elle couvre aussi le besoin de la nitrification.
sources :
- Edeline 1997, p. 243 et 245

### Étape « cause-nit-charge »
cause : Charge trop élevée pour nitrifier
explication : Au-delà de 0,35, l'âge des boues devient trop court pour ces bactéries lentes, qui sont évacuées avant de s'installer.
remedes :
- Réduire la charge des boues : plus de boues dans le bassin, ou plus de volume.
sources :
- Edeline 1997, p. 161 et 245

### Étape « cause-nit-froid »
cause : Croissance ralentie par le froid
explication : La croissance des nitrifiants dépend fortement de la température : elle est divisée par plus de 2,6 quand on passe de 15 à 5 °C. L'âge des boues peut devenir insuffisant.
remedes :
- Réduire la purge pour augmenter l'âge des boues avant l'hiver, et garder une marge sur le minimum calculé.
sources :
- Edeline 1997, p. 245

### Étape « cause-nit-toxique »
cause : Inhibition probable par un toxique
explication : Cette flore est très sensible, y compris à certains métaux (cuivre et nickel dès 0,1 mg/l environ), aux cyanures, aux phénols, aux sels de fer et d'aluminium et au surnageant des digesteurs.
remedes :
- Rechercher l'origine du rejet et analyser l'entrée de la station.
- Vérifier le retour du surnageant de digestion en tête de station.
- Revoir le dosage des sels de fer ou d'aluminium.
sources :
- Edeline 1997, p. 244

### Étape « cause-nit-autre »
cause : Cause non identifiée par ces questions
explication : Reste à vérifier le pH et l'alcalinité, car la nitrification acidifie le milieu. Dans les petites stations, l'alcalinité de l'eau peut être insuffisante.
remedes :
- Mesurer le pH et l'alcalinité dans le bassin.
sources :
- Edeline 1997, p. 107 et 245

### Étape « lit-saison »
question : Est-ce un ébouage massif au printemps ?
aide : En hiver le biofilm s'accumule, faute de prédateurs. Ils reviennent au printemps.
- Si « Oui » → étape « cause-lit-printemps »
- Si « Non, le colmatage s'installe » → étape « lit-rincage »

### Étape « lit-rincage »
question : La force de rinçage calculée est-elle nettement sous 2 mm ?
aide : L'outil Lit bactérien la calcule.
- Si « Oui » → étape « cause-lit-rincage »
- Si « Non, ou je ne sais pas » → étape « cause-lit-exces »

### Étape « cause-lit-printemps »
cause : Phénomène saisonnier normal
explication : Le retour des prédateurs décroche le biofilm accumulé pendant l'hiver.
remedes :
- Vérifier que le décanteur secondaire absorbe ce surplus de boues.
sources :
- Edeline 1997, p. 107

### Étape « cause-lit-rincage »
cause : Rinçage insuffisant
explication : Avec une force de rinçage trop faible, le film s'épaissit et des mares se forment. Le rinçage dépend du débit, du nombre de bras et de leur vitesse.
remedes :
- Revoir la vitesse de rotation ou le nombre de bras, ou augmenter la charge hydraulique par recyclage, pour viser environ 2 mm.
sources :
- Edeline 1997, p. 106

### Étape « cause-lit-exces »
cause : Excès de boue dans les couches supérieures
explication : Le lit se colmate quand la production de boue est trop forte, surtout en surface.
remedes :
- Méthode au salpêtre : arrêter le lit, répandre 0,5 kg/m² de salpêtre sec, humidifier un peu, puis reprendre l'irrigation après 2 à 3 heures. Le lit se purge en quelques jours. Dans les cas graves, recommencer 1 à 2 semaines plus tard.
- La lance à haute pression décolle le film, mais reporte le colmatage plus bas.
- Le chlore est très efficace, mais il tue toute la biomasse : le rendement baisse longtemps.
sources :
- Edeline 1997, p. 107

### Étape « dig-age »
question : Quel est l'âge des boues du digesteur ?
aide : Sans recyclage, c'est le volume divisé par le débit de boues.
- Si « Moins de 3 jours » → étape « cause-dig-lessivage »
- Si « De 3 à 10 jours » → étape « cause-dig-court »
- Si « Plus de 10 jours » → étape « cause-dig-autre »

### Étape « cause-dig-lessivage »
cause : Méthanogènes évacués
explication : Sous 3 jours, le minimum théorique n'est pas atteint. Ces organismes croissent trop lentement pour se maintenir.
remedes :
- Réduire le débit de boues ou augmenter le volume utile, pour viser 10 à 30 jours.
sources :
- Edeline 1997, p. 197

### Étape « cause-dig-court »
cause : Âge inférieur à la pratique courante
explication : Entre 3 et 10 jours, la digestion est possible en théorie, mais la pratique retient 10 à 30 jours, car le contact entre substrat et biomasse n'est pas parfait.
remedes :
- Revenir vers 10 à 30 jours et vérifier le brassage.
sources :
- Edeline 1997, p. 197

### Étape « cause-dig-autre »
cause : L'âge des boues n'est pas en cause
explication : Il faut alors regarder les AGV, l'alcalinité, la température et les toxiques. Cette partie du diagnostic reste à construire sur ce site.
remedes :
- Suivre les AGV et l'alcalinité, et comparer avec un guide d'exploitation récent.
sources :
- Edeline 1997, p. 197

### Étape « lag-couleur »
question : Que constatez-vous ?
- Si « Bassin vert le matin, gris le soir » → étape « cause-lag-mobiles »
- Si « pH très élevé en journée, en été » → étape « cause-lag-ph »
- Si « Écume d'algues qui s'effondre par forte chaleur » → étape « cause-lag-floculation »
- Si « Odeurs persistantes » → étape « lag-charge »

### Étape « lag-charge »
question : La charge dépasse-t-elle le haut de la plage courante, soit 350 kg DBO5/ha.j ?
- Si « Oui » → étape « cause-lag-surcharge »
- Si « Non » → étape « cause-lag-depots »

### Étape « cause-lag-mobiles »
cause : Phénomène normal : les algues se déplacent
explication : Des algues mobiles fuient les zones trop éclairées et trop chaudes. Les euglènes indiquent plutôt un bassin en bonne santé.
remedes :
- Aucune action n'est nécessaire.
sources :
- Edeline 1997, p. 262

### Étape « cause-lag-ph »
cause : Cycle normal de la photosynthèse
explication : En consommant le gaz carbonique, les algues font monter le pH, jusqu'à 9,8 de jour en été. Ce pH élevé peut accentuer les odeurs d'ammoniac.
remedes :
- Éviter de mélanger le bassin dans ce cas : les bactéries restent à l'abri au fond.
sources :
- Edeline 1997, p. 262

### Étape « cause-lag-floculation »
cause : Algues bleu-vert qui s'auto-floculent
explication : En eau chaude et stagnante, les algues concentrées précipitent. Leur mort prive les bactéries d'oxygène et ajoute de la matière organique.
remedes :
- Casser la stratification en mélangeant, ce qui éloigne les algues de la surface.
sources :
- Edeline 1997, p. 262 et 263

### Étape « cause-lag-surcharge »
cause : Lagune surchargée
explication : La charge sort de la plage citée, dont la valeur courante est d'environ 100 kg DBO5/ha.j.
remedes :
- Réduire la charge reçue, ou ajouter de la surface ou de l'aération.
sources :
- Edeline 1997, p. 267

### Étape « cause-lag-depots »
cause : Dépôts de boues actifs
explication : Par temps chaud, les dépôts relâchent des gaz et des produits dégradables, ce qui peut créer une zone sans oxygène malgré la photosynthèse.
remedes :
- Mesurer la hauteur de boues et prévoir un curage si besoin.
sources :
- Edeline 1997, p. 262

## Pas encore couvert par l'outil
- Mousses en surface du bassin d'aération
- Digesteur qui s'acidifie : suivi des AGV et de l'alcalinité