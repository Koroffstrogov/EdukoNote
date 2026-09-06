# Atelier rythmes et pulsation

Hypothèse de travail : deuxième année du premier cycle de formation musicale (1C2). Ce niveau ne définit pas un programme identique dans tous les établissements. Faire relire les propositions ci-dessous avec le cours suivi avant de fixer une progression.

## Vingt formules à confronter au cours

Formules composées pour EdukoNote à partir de figures usuelles, sans reprise d'exercices d'un manuel. Chaque formule contient **deux mesures** ; dans tout ce catalogue, **la noire vaut un temps**. Les partitions sont visibles dans `/rhythms`, sous l'atelier. Les données de référence sont dans [rhythmPatterns.ts](../src/domain/rhythmPatterns.ts).

Notation textuelle : `N` noire, `B` blanche, `R` ronde, `C` croche, `D` double croche, `NP` noire pointée, `S` soupir, `DS` demi-pause. `T T T` représente trois croches de triolet dans **un temps**. `~` lie la note à la suivante, sans nouvelle attaque ; `|` sépare les mesures.

| Notion | ID et titre | Mesure | Formule | Objectif à vérifier avec le professeur |
| --- | --- | --- | --- | --- |
| Valeurs longues | R01 · Deux pas | 2/4 | `N N` · `N N` | Une frappe à chaque pulsation. |
| Valeurs longues | R02 · Un son qui traverse | 3/4 | `B N` · `N B` | Trois temps, y compris sous la blanche. |
| Valeurs longues | R03 · Deux pas, un souffle | 4/4 | `N N B` · `B N N` | Distinguer les départs de notes de la pulsation. |
| Valeurs longues | R04 · Le fil long | 4/4 | `R` · `B B` | Quatre temps sous la ronde, puis deux blanches. |
| Croches | R05 · Petits pas | 2/4 | `C C N` · `N C C` | Deux parts égales dans un temps. |
| Croches | R06 · Le milieu bouge | 3/4 | `N C C N` · `C C N C C` | Conserver les trois pulsations. |
| Croches | R07 · Les fenêtres | 4/4 | `C C N C C N` · `B C C N` | Passer des croches aux valeurs longues. |
| Croches | R08 · Le petit chemin | 4/4 | `N C C C C N` · `C C C C B` | Deux temps de croches sans accélérer. |
| Silences | R09 · Un pas silencieux | 2/4 | `N S` · `S N` | Compter pendant le soupir. |
| Silences | R10 · Le retour | 3/4 | `N S N` · `DS N` | Repartir après un puis deux temps de silence. |
| Silences | R11 · Petits pas et pause | 4/4 | `C C S N N` · `N C C S N` | Respecter le silence après les croches. |
| Silences | R12 · Le souffle caché | 4/4 | `B S N` · `N S B` | Distinguer tenue et silence. |
| Pointés et liaisons¹ | R13 · Long, puis court | 2/4 | `NP C` · `N N` | Placer la croche après la noire pointée. |
| Pointés et liaisons¹ | R14 · Le pas décalé | 3/4 | `NP C N` · `N NP C` | Déplacer la cellule en gardant la pulsation. |
| Pointés et liaisons¹ | R15 · Le pont dans le temps | 4/4 | `N C C~ N N` · `N N B` | Ne pas réattaquer au troisième temps. |
| Pointés et liaisons¹ | R16 · Le pont de mesure | 4/4 | `B N N~` · `N N B` | Tenir à travers la barre de mesure. |
| Subdivisions¹ | R17 · Quatre petits pas | 2/4 | `D D D D N` · `N D D D D` | Quatre parts égales dans un temps. |
| Subdivisions¹ | R18 · Deux tailles de pas | 4/4 | `C D D N C D D N` · `N C D D B` | Une croche et deux doubles sur un temps. |
| Subdivisions¹ | R19 · Trois dans un pas | 2/4 | `T T T N` · `N T T T` | Trois subdivisions sur une pulsation à la noire. |
| Subdivisions¹ | R20 · Le balancement | 3/4 | `N T T T N` · `T T T B` | Alterner triolets et valeurs longues sur trois temps. |

¹ Extensions R13–R20 : à retenir seulement lorsque les notions ont été abordées. Un triolet dans une mesure simple n'est pas une introduction au 6/8 : le travail de pulsation à la noire pointée fera l'objet d'une progression distincte si le cours le demande.

Pour la confrontation au cours, noter pour chaque notion : **déjà vue / à introduire / à reporter**, le vocabulaire employé, le tempo confortable et un exemple expliqué par l'élève. Faire d'abord marcher ou battre la pulsation, puis dire ou jouer la formule. Pour les blanches, rondes, liaisons et silences, utiliser la voix ou un instrument qui tient le son : une frappe seule ne prouve pas que la durée ou le silence sont compris.

## Trois exercices, un moteur

Accès par « Rythmes » depuis l'accueil, route `/rhythms`. Les trois exercices utilisent le même plan musical ([rhythmExercise.ts](../src/domain/rhythmExercise.ts)), la même horloge sonore ([rhythmAudio.ts](../src/audio/rhythmAudio.ts)) et le même cycle de séance ([useRhythmSession.ts](../src/hooks/useRhythmSession.ts)).

| Exercice | Déroulement |
| --- | --- |
| Garde la pulsation | Quatre clics de départ, puis seize pulsations à frapper. Le métronome reste audible. |
| Écho rythmique | Une mesure de décompte, deux mesures de modèle sonore, une nouvelle mesure de décompte, puis deux mesures à reproduire de mémoire. La partition apparaît au bilan. |
| Lis et frappe | Une mesure de décompte, puis deux mesures à lire et frapper, sans modèle sonore. La partition complète est visible avant le départ ; pendant le jeu, une mesure est affichée à la fois. |

Dans les formules, le décompte respecte la mesure choisie : deux, trois ou quatre temps. Les silences n'ont pas d'attaque ; une note liée prolonge la précédente, y compris à travers la barre de mesure. Le modèle sonore de l'écho respecte ces durées. L'évaluation des frappes porte uniquement sur les **débuts de notes**, pas sur leur durée tenue.

Une frappe se fait avec un doigt, Espace ou Entrée. Aucun son supplémentaire n'est déclenché par la frappe. Le compteur donne le retour immédiat ; tenir la touche ne répète pas l'entrée. L'écoute du modèle et les décomptes sont exclus du bilan, à l'exception de la petite anticipation admise juste avant la réponse.

### Réglages rapides

Le bouton « Réglages » reste disponible pendant le jeu. Il propose les tempos 60, 72 et 90 bpm et les repères visuels facultatifs. Pour l'écho et la lecture : choix d'une notion, puis d'une des quatre formules correspondantes ; métronome facultatif pendant la formule. Les extensions R13–R20 portent un rappel de confrontation au cours.

Les choix sont mémorisés localement. Ouvrir les réglages arrête une tentative en cours ; la fermeture rend le focus au bouton et le redémarrage reste explicite. « Formule suivante » parcourt la notion choisie ; chaque entrée du catalogue peut aussi être lancée en écho ou en lecture.

### Bilan et progression locale

Une séance est enregistrée uniquement après la fin des deux mesures de réponse, ou des seize temps de pulsation. Arrêt volontaire, perte de visibilité, changement d'app, interruption audio ou blocage prolongé de l'affichage : tentative annulée, sans résultat enregistré ni reprise automatique. Une demande de démarrage audio annulée ne peut pas repartir plus tard.

Le bilan distingue attaques retrouvées, absences et frappes supplémentaires ; il affiche les écarts moyen et médian en millisecondes entières. « Ma progression » conserve le nombre de séances, les repères atteints, les erreurs historiques, les réglages à reprendre et les derniers écarts. Chaque entrée permet de reprendre l'exercice avec ses réglages. Les résultats sont séparés par exercice, formule, tempo, repères visuels et métronome ; pour la pulsation, la formule ne compte pas et le métronome est toujours actif.

Un repère est atteint lorsque toutes les attaques sont retrouvées sans frappe supplémentaire, sans irrégularité ni dérive détectée. Il ne constitue pas une validation scolaire : avec moins de quatre attaques, la régularité ne peut pas être conclue. Une réussite lève le besoin de reprise sans effacer les erreurs passées. Les notions restent librement accessibles : aucun déblocage automatique ne remplace l'avis du professeur.

Les deux clés de stockage sont listées dans le [README](../README.md#données-locales). Une remise à zéro confirmée dans l'interface efface seulement la progression Rythmes, en conservant ses réglages et les autres exercices. Les données invalides sont normalisées au chargement. Si l'écriture locale échoue, un message l'indique et les résultats restent en mémoire dans la page ; ils peuvent être perdus à sa fermeture.

## Horloge et limites du bilan

Tous les sons d'une séance courte à tempo fixe sont programmés sur l'horloge Web Audio. Les voix futures restent annulables. L'affichage suit l'horloge de sortie ; il ne cadence pas le son. Les frappes utilisent l'horodatage de l'événement, rapproché de `getOutputTimestamp()` quand disponible, sinon des latences exposées par le navigateur.

Pour chaque frappe retenue, l'écart vaut `(instant de frappe − instant de l'attaque attendue) × 1000`. En pulsation, cette cible correspond au clic sonore ; en écho et lecture, elle correspond au début de note attendu pendant la réponse, même sans son à cet instant. Un signe positif indique un retard, un signe négatif une avance. Une seule frappe, la plus proche, est retenue par cible ; absences et frappes supplémentaires n'entrent pas dans les écarts. Sans association, les deux valeurs sont indisponibles.

La moyenne conserve les signes : des avances et des retards peuvent se compenser. La médiane utilise la valeur centrale après tri, ou la moyenne des deux valeurs centrales si l'effectif est pair. Seul l'affichage est arrondi à la milliseconde. Ce sont des estimations issues de l'horloge audio, pas une mesure acoustique du son réellement émis par le haut-parleur.

Seuils **provisoires**, sans valeur d'évaluation scolaire : la fenêtre d'association est de ±45 % du plus petit intervalle entre la cible et ses voisines, plafonné à un temps. Elle se resserre donc pour les croches, doubles croches et triolets. La régularité compare les intervalles réellement frappés aux intervalles attendus entre les attaques associées (écart relatif moyen de 12 % maximum), avec au moins quatre frappes. Un décalage constant dans la fenêtre admise ne dégrade pas la régularité. La dérive est signalée à partir de huit frappes lorsque l'écart cumulé dépasse un quart de temps.

Ces seuils restent à ajuster après les essais matériels. Un retard important, notamment Bluetooth, peut encore fausser l'association des frappes. Les tests simulés ne mesurent ni le délai tactile réel ni le son entendu. L'atelier ne reconnaît pas le microphone et n'étalonne pas automatiquement l'appareil.

Références techniques : [programmation audio sur une horloge dédiée](https://web.dev/articles/audio-scheduling) et [horodatage de sortie Web Audio](https://webaudio.github.io/web-audio-api/#dom-audiocontext-getoutputtimestamp). Procédure et relevé sur appareil dans le [guide de validation](VALIDATION.md#atelier-rythmes-sur-iphone-réel).
