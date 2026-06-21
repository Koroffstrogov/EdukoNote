# Design system EdukoNote

Ce document verrouille le socle graphique du projet avant toute logique de jeu.

## Intention

EdukoNote doit rester ludique, doux, colore, rassurant et musical. L'interface vise une enfant de 7 ans : elle peut etre joyeuse et tactile, mais ne doit pas paraitre bebe.

## Palette obligatoire

| Nom | Hex | Usage |
| --- | --- | --- |
| Rose poudré | `#F7A8C4` | accents doux, actions secondaires, feedback visuel leger |
| Lavande | `#C9B6FF` | surfaces calmes, boutons de reponse |
| Jaune vanille | `#FFE58F` | encouragement, attention positive, note courante |
| Menthe douce | `#BDECCB` | succes, validation, progression acquise |
| Bleu ciel | `#A9D8FF` | zones question, respiration visuelle |
| Prune | `#6C4BAF` | titres, textes importants, portee, ancrages |
| Creme | `#FFF8F1` | fond principal et surfaces neutres |

Les valeurs hexadecimales sont autorisees uniquement dans :

- `src/theme/tokens.ts`
- `src/theme/theme.css`

## Regles graphiques strictes

- Le fond principal est creme.
- Le prune porte les titres, textes importants, notes de musique et elements d'ancrage.
- Les boutons sont grands, tactiles et faciles a viser sur iPhone.
- Les coins sont tres arrondis.
- Les ombres sont douces et jamais agressives.
- L'interface est mobile first et compatible iPhone.
- Les corrections restent positives : `Bravo !` et `Presque !`.
- Aucune couleur n'est codee directement dans les composants.
- Toutes les couleurs, rayons, espacements et ombres passent par des tokens ou variables CSS.
- Aucune police externe n'est chargee.
- Aucune dependance graphique lourde n'est autorisee.
- Aucune API externe n'est appelee.
- Aucun compte, aucune publicite et aucune donnee distante.

## Tokens

Les tokens TypeScript sont dans `src/theme/tokens.ts`.

Les variables CSS et les styles des composants sont dans `src/theme/theme.css`.

Familles verrouillees :

- couleurs : `--color-*`
- espacements : `--space-*`
- rayons : `--radius-*`
- ombres : `--shadow-*`
- tailles tactiles : `--touch-target*`
- portee musicale : `--staff-*`

## Composants du socle

- `AppButton` : bouton tactile, gros, arrondi, decline par ton.
- `AppCard` : surface douce pour question ou contenu.
- `FeedbackCard` : retour positif `Bravo !` ou correction douce `Presque !`.
- `ProgressChip` : indicateur court de progression.
- `HomeActionCard` : carte d'action d'accueil.
- `StaffPreview` : portee simplifiee pour les apercus visuels.

## Page style guide

La route `/styleguide` doit toujours afficher :

- la palette complete avec noms et codes hex ;
- les boutons `Do`, `Ré`, `Mi`, `Fa` ;
- une carte question `Quelle est cette note ?` avec portee simplifiee ;
- le feedback succes `Bravo ! C’est Mi` ;
- le feedback erreur `Presque ! C’était Fa` ;
- les chips `Do ✅`, `Ré ✅`, `Mi 🟡`, `Fa 🔴` ;
- les cartes `Entraînement`, `Défi 10 notes`, `Révision des erreurs` ;
- une mini previsualisation mobile.

## Checklist d'acceptation

- [ ] `npm install` fonctionne.
- [ ] `npm run dev` fonctionne.
- [ ] `npm run build` fonctionne.
- [ ] `npm run check:design` fonctionne.
- [ ] Aucune couleur directe n'existe dans `src/` hors fichiers theme autorises.
- [ ] Les ecrans visibles utilisent les composants UI du design system.
- [ ] Le fond principal est creme.
- [ ] Les titres et elements importants sont prune.
- [ ] Les boutons sont grands et tactiles sur iPhone.
- [ ] Les coins et ombres correspondent a la charte.
- [ ] La page `/styleguide` permet une verification visuelle complete.
