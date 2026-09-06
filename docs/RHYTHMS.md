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

## Prototype « Garde la pulsation »

- Accès par « Rythmes » depuis l'accueil, route `/rhythms`.
- Tempos 60, 72 et 90 bpm ; repères visuels facultatifs. Quatre clics d'écoute, puis seize pulsations à frapper avec un doigt, Espace ou Entrée. Le métronome reste audible pendant toute la tentative.
- Aucun son supplémentaire n'est déclenché par la frappe. Le compteur donne le retour immédiat ; une frappe prolongée ne répète pas l'entrée au clavier.
- Le bilan distingue pulsations retrouvées, absences et frappes supplémentaires, puis donne un conseil de régularité. Il n'est pas sauvegardé et n'affecte pas les autres exercices.
- Il affiche aussi l'écart moyen et médian entre son et réponse, en millisecondes entières : positif après le son, négatif avant. Ces estimations portent uniquement sur les frappes associées (une par pulsation), sans les absences ni les frappes supplémentaires. Sans frappe associée, les deux valeurs sont indisponibles.
- Une perte de visibilité, un changement d'app, une interruption audio ou un arrêt volontaire annule la tentative. Le retour demande « Recommencer » ; aucun redémarrage automatique.

Le catalogue prépare les activités suivantes ; il n'est pas encore joué ni évalué par cet atelier. Après validation pédagogique et matérielle, essayer R01, R05 et R09 dans une activité d'écho, puis ajouter les autres notions progressivement.

## Horloge et limites du bilan

Les vingt clics de cette séance courte à tempo fixe sont programmés sur l'horloge Web Audio. Les voix futures restent annulables. L'affichage suit l'horloge de sortie ; il ne cadence pas le son. Les frappes utilisent l'horodatage de l'événement, rapproché de `getOutputTimestamp()` quand disponible, sinon des latences exposées par le navigateur.

Pour chaque frappe retenue, l'écart vaut `(instant de frappe − instant de la pulsation sonore associée) × 1000`. La moyenne conserve les signes : des avances et des retards peuvent se compenser. La médiane utilise la valeur centrale après tri, ou la moyenne des deux valeurs centrales si l'effectif est pair. Les calculs gardent leur précision ; seul l'affichage est arrondi à la milliseconde. Ce sont des estimations issues de l'horloge audio, pas une mesure acoustique du son réellement émis par le haut-parleur.

Seuils **provisoires**, sans valeur d'évaluation scolaire : une frappe peut être associée à une pulsation dans une fenêtre de ±45 % du temps ; une seule est retenue par pulsation. La régularité compare les intervalles entre frappes associées (écart moyen de 12 % maximum), avec au moins quatre frappes. Un décalage constant dans cette fenêtre ne dégrade pas la régularité. La dérive est signalée à partir de huit frappes lorsque l'écart cumulé dépasse un quart de temps.

Ces seuils restent à ajuster après les essais matériels. Un retard important, notamment Bluetooth, peut encore fausser l'association des frappes. Les tests simulés ne mesurent ni le délai tactile réel ni le son entendu. Le prototype ne mesure pas la durée tenue, ne reconnaît pas le microphone et n'étalonne pas automatiquement l'appareil.

Références techniques : [programmation audio sur une horloge dédiée](https://web.dev/articles/audio-scheduling) et [horodatage de sortie Web Audio](https://webaudio.github.io/web-audio-api/#dom-audiocontext-getoutputtimestamp). Procédure et relevé sur appareil dans le [guide de validation](VALIDATION.md#atelier-garde-la-pulsation-sur-iphone-réel).
