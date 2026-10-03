# Le parcours quotidien de lecture

Accessible depuis l'accueil et `/journey`. Une série courte entretient l'habitude ; un sans-faute et les confirmations de notes récompensent des réussites distinctes. Les anciens modes restent disponibles.

## Ce que fait l'enfant

| Activité ou récompense | Règle |
| --- | --- |
| Ma série du jour | Dix questions sans chronomètre, sept réponses Do–Si. Finir suffit à valider la journée, quel que soit le score. |
| Étoile de lecture | Une série entièrement juste : 10/10, ou 15/15 à la petite scène. |
| Jours d'affilée | Une seule journée ajoutée, même avec plusieurs séries. La journée d'hier garde la série en cours ; une journée manquée remet ce compteur à zéro, sans retirer les badges ni le meilleur total consécutif. |
| Repères du bas / du haut | Toutes les notes de la zone confirmées. Le détail distingue la note, son octave et sa clé : Do4 ne valide pas Do5. |
| Clé confirmée | Les quinze notes naturelles du parcours de la clé confirmées ; en clé de Sol, Do4 à Do6. Ce n'est pas la totalité des hauteurs possibles dans cette clé. |
| La petite scène | Débloquée par « Clé confirmée » : les quinze notes, chacune une fois, sans chronomètre ni correction avant le bilan. 15/15 donne le passeport de lecture de cette clé. Rejouable. |
| Lecture fluide | Dix notes sans compte à rebours ni élimination. Médiane du temps de réponse après la série ; meilleur repère conservé par clé et zone, uniquement sans erreur ni interruption. |

Le Défi Notes de dix questions valide lui aussi la journée. Entraînement, Révision et Vitesse alimentent les repères par note ; leurs sessions ouvertes n'ajoutent pas de journée. Piano, Symboles et Rythmes conservent leurs progressions distinctes.

## Choix pédagogiques à confronter au cours

Une note est confirmée après trois bonnes réponses consécutives réparties sur au moins deux dates locales. Une erreur remet cette note à consolider ; les badges et le passeport déjà obtenus restent acquis. Des réussites supplémentaires le même jour ne retirent pas une confirmation.

Les séries quotidiennes utilisent le déblocage progressif existant. Après la première découverte, elles introduisent au plus deux nouvelles notes parmi celles débloquées. Les erreurs, notes nouvelles et notes non revues depuis sept jours sont prioritaires ; le tirage diversifie les dix questions et évite deux notes identiques de suite. Le choix Bas / Haut / Tout reste mémorisé pour chaque clé.

L'espacement et le rappel actif sont des principes généraux soutenus par le guide [IES/WWC, Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/PracticeGuide/1). Les seuils « trois réponses / deux jours » et le score du passeport sont des choix de produit à ajuster avec le professeur, pas une validation scientifique de maîtrise musicale. Le QCM travaille la reconnaissance ; lecture orale, chant et transfert à l'instrument restent complémentaires. La justesse précède la vitesse, sans classement entre enfants.

## Persistance et interruptions

- Les dates suivent le calendrier local de l'appareil ; une série traversant minuit compte au jour de sa fin. Le compteur est rafraîchi au retour dans l'app et chaque minute.
- Une seule validation par identifiant de session ; les doubles appuis et les rendus React ne doublent pas la récompense. Les onglets reprennent les sauvegardes reçues par événement `storage` ; deux écritures strictement simultanées ne sont pas transactionnelles.
- Les réponses sont conservées au fil de la série. Quitter avant la fin n'ajoute pas de journée. Recharger redémarre la série, sans restaurer une tentative incomplète.
- Perdre le focus, masquer ou quitter la page suspend les nouveaux exercices. Reprise explicite, sans record de vitesse pour cette série. Le temps mesure la réponse à l'affichage, pas une latence audio.
- L'indisponibilité du stockage est signalée dans le parcours et au bilan. Les résultats restent alors en mémoire dans la page ; fermer ou recharger peut les perdre.
- Les anciennes données Notes v1/v2 restent lisibles. Les champs de confirmations, badges et passeports sont facultatifs ; aucun historique espacé n'est déduit des anciens compteurs.
- Aucune donnée envoyée à un serveur, aucun compte ni notification. Les données sont propres au navigateur et à l'appareil ; effacer les données du site les efface aussi.

## Repères de maintenance

Les règles pures sont dans [noteJourney.ts](../src/domain/noteJourney.ts), [noteMastery.ts](../src/domain/noteMastery.ts) et [practiceDays.ts](../src/domain/practiceDays.ts). [useJourneySession.ts](../src/hooks/useJourneySession.ts) pilote les questions et pauses ; [usePracticeDays.ts](../src/hooks/usePracticeDays.ts) gère les journées. [NoteJourneyPage.tsx](../src/pages/NoteJourneyPage.tsx) assemble les composants existants de questions et de bilan.

Les clés de stockage sont centralisées dans le [README](../README.md#données-locales). Les scénarios à rejouer figurent dans le [guide de validation](VALIDATION.md#parcours-quotidien-de-lecture).
