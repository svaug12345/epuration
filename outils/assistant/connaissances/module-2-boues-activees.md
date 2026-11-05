# Module 2 : Les boues activées

Le procédé le plus répandu tient en un réglage : la nourriture donnée à chaque kilo de boues.

## Comprendre (leçon pas à pas)

### Le procédé star
Un bassin, de l'air, des bactéries. Ça a l'air simple. Pourtant, certaines stations rejettent une eau limpide, et d'autres non. La différence tient presque à un seul réglage. Dans cette vidéo, vous allez apprendre à le lire.
- Le procédé le plus répandu
- Un seul réglage décide de presque tout

### Le circuit
Voici le circuit. L'eau usée entre dans un bassin où l'on insuffle de l'air. Des flocons de bactéries y consomment la pollution. Direction ensuite le clarificateur, un grand bassin calme : les flocs tombent au fond, l'eau claire s'en va. Et voici l'idée de génie : on renvoie ces boues vers le bassin. C'est le recyclage, qui garde énormément de bactéries au travail. Comme elles se multiplient, on en retire une partie. C'est la purge.
- Un bassin aéré, puis un clarificateur
- Recyclage : les boues reviennent
- Purge : l'excès repart

### Le réglage clé : la charge des boues
Ce réglage, c'est la charge des boues : la quantité de DBO5 offerte chaque jour à chaque kilo de boues. Autour de 0,05, les bactéries sont affamées : elles digèrent presque tout, y compris elles-mêmes. Autour de 0,2, l'épuration est complète. Entre 0,5 et 1, danger : la boue décante mal. Et à 2, elles sont suralimentées : il reste environ 80 milligrammes de DBO5 en sortie.
- Cb : la nourriture par kilo de boues
- Cb = Cv / B

### L'âge des boues
Deuxième notion : l'âge des boues. C'est la masse de boues présente, divisée par la masse évacuée chaque jour. Pourquoi c'est crucial ? Parce qu'un organisme qui pousse moins vite que la purge disparaît ! L'âge décide donc qui survit. Quand la charge monte, l'âge baisse. Trop jeunes, entre 0,4 et 3 jours, les boues floculent mal. Trop vieilles, vers 100 jours, on les dit brûlées.
- θc : masse de boues / masse évacuée par jour
- Il décide qui peut survivre

### Le jour où l'azote s'échappe
Regardez ce qui se passe à la sortie. Quand la charge dépasse 0,35, l'âge des boues devient trop court pour les bactéries nitrifiantes, qui poussent lentement. Résultat : l'ammonium traverse la station ! Dans l'exemple du livre, on passe de 2,5 milligrammes par litre à une charge de 0,15, à 35 milligrammes à une charge de 0,5. Une eau plus propre se paie : plus d'air, mais moins de boues.
- Au-delà de 0,35 : plus de nitrification
- Faible charge : plus d'oxygène, moins de boues

### Le cauchemar : le gonflement
Et voici le cauchemar de l'exploitant : le gonflement. Tout repose sur une chose : la boue doit tomber au fond. Pour le vérifier, on mesure le SVI, le volume occupé par un gramme de boues après trente minutes. Normal : autour de 50. À 200 et plus, la boue reste en suspension et s'échappe avec l'eau ! Environ la moitié des installations y sont confrontées. En cause : souvent des bactéries en longs filaments.
- SVI : normal vers 50, gonflement dès 200
- Une station sur deux concernée

### Les trois réflexes
Pour piloter simplement, trois réflexes. Un : purgez à taux constant, l'âge des boues reste stable sans analyse permanente. Deux : gardez au moins 2 milligrammes d'oxygène par litre. Trois : surveillez le SVI, il vous prévient avant que l'eau ne se dégrade. À vous de jouer : le simulateur vous attend !
- Purger à taux constant
- Au moins 2 mg/l d'oxygène
- Surveiller le SVI

## Approfondir (formules)

### Charges et temps de séjour
Avec Q le débit en m³/j, S0 la DBO5 en mg/l, V le volume en m³ et B les boues en g/l :
Formule : Cv = Q × S0 / 1000 / V    (kg DBO5/m³.j)
Formule : Cb = Cv / B              (kg DBO5/kg B.j)
Formule : θl = V / Q                (temps de séjour)
Source : Edeline 1997, p. 157

### Âge des boues
Définition, avec Ba, Br et Be les concentrations dans l'aérateur, le recyclage et l'effluent, et Qp le débit de purge. La relation empirique avec la charge suit les âges normalement associés aux charges.
Formule : θc = Ba × V / (Br × Qp + Be × (Q − Qp))
Formule : θc = 1,224 × Cb^(−1,125)    (éq. 6.39)
Source : Edeline 1997, p. 156 et 160

### Le modèle de McCarty
Ces équations relient l'âge des boues, le substrat résiduel, le volume et le besoin en oxygène. U est le taux d'utilisation du substrat, a et b' sont déterminés au mieux par des essais. Les constantes proposées en DCO, sous réserve d'essais, sont a = 0,54, b' = 0,0094 par jour, Y = 0,47 (biomasse en poids) et b = 0,02 par jour.
Formule : 1/θc = Y × U − b
Formule : S1 = Ks × (1 + b × θc) / (θc × (Y × K − b) − 1)
Formule : V = Q × Y × ΔS × θc / ((1 + b × θc) × B)
Formule : ΔO2/Δt = a × ΔS/θl + b' × B
Source : Edeline 1997, p. 156 et 160

### Remèdes au gonflement
À court terme, on diminue θc, ce qui avantage les formeurs de flocs à croissance rapide. À long terme, on compartimente l'aérateur, ou on crée un gradient de concentration. Un sélecteur occupe environ 1/20 du volume d'aération, avec θl ≈ 10 minutes. Le fer ou l'aluminium s'emploient à 20-50 mg/l. Le chlore sur la boue de retour se dose vers 2 g Cl/kg de boues par jour, mais au-delà de 5 g, l'effluent se dégrade et la nitrification diminue.
Source : Edeline 1997, p. 132 et 133

## À retenir
- Cb = nourriture par kilo de boues et par jour. C'est le réglage central.
- θc = masse de boues / masse évacuée par jour. Il décide qui survit.
- θc ≈ 1,224 × Cb^(−1,125) : la charge monte, l'âge baisse.
- Cb > 0,35 : pas de nitrification à attendre.
- Cb de 0,5 à 1 : plage à éviter pour la décantation.
- θc de 0,4 à 3 j : boues de mauvaise qualité. θc vers 100 j : boue brûlée.
- SVI normal vers 50 ml/g ; gonflement à 200 ml/g et plus.
- Garder au moins 2 mg/l d'oxygène dans le bassin.

## Étude de cas : l'été où l'ammonium est revenu
Énoncé : Votre station de 1 500 m³ traite 2 000 m³/j à 250 mg/l de DBO5. Une usine se raccorde et la charge double. Les boues restent à 4 g/l. La nitrification tiendra-t-elle ? Testez avec le calculateur, en mettant 500 en DBO5 d'entrée.
Solution : La charge des boues passe d'environ 0,083 à environ 0,167. Elle reste sous 0,35, et l'âge estimé tombe d'environ 20 à environ 9 jours, ce qui reste suffisant à 15 °C. La nitrification devrait donc tenir, à condition que l'aération suive. Selon le calculateur, le besoin d'oxygène passe d'environ 1 000 à 1 300-1 500 kg/j, ce qui reste un ordre de grandeur. Le point à surveiller est donc l'aération, pas la charge.

## Questions du quiz et leurs réponses
- Question : À quoi sert le recyclage des boues ? Réponse : À garder beaucoup de bactéries dans le bassin. Il maintient une concentration en bactéries bien plus forte que ce que l'eau seule permettrait.
- Question : Au-delà de quelle charge des boues ne faut-il plus attendre de nitrification ? Réponse : 0,35. Valeur donnée pour un système traditionnel en mélange complet.
- Question : Quelle plage de charge est à éviter pour la décantation ? Réponse : 0,5 à 1. Pour des raisons de sédimentabilité, elle est rarement pratiquée.
- Question : Un SVI de 220 ml/g indique : Réponse : Un gonflement. Une boue normale est autour de 50 ml/g, un gonflement à 200 ml/g et plus.
- Question : Quel remède agit à court terme contre le gonflement filamenteux ? Réponse : Diminuer l'âge des boues. Cela avantage les bactéries formant des flocs, qui croissent vite.
- Question : Quelle est la concentration minimale d'oxygène conseillée dans le bassin pour éviter les déficits au cœur des flocs ? Réponse : 2 mg/l. Avec une régulation automatique de préférence.

## Sources du module
- F. Edeline, L'épuration biologique des eaux, 4e éd., Cebedoc, 1997 : chap. 6, p. 128-133 et 156-161.
