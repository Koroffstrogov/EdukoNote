# Design system EdukoNote

Ce document décrit le socle graphique Aurora Session.

## Intention

EdukoNote doit évoquer une application de création musicale contemporaine : immersive, claire et attirante pour les 7-12 ans, sans reprendre les codes de l'école ni tomber dans un univers enfantin. Aurora Session associe une nuit indigo calme, des lueurs corail et cyan, et des surfaces de notation très lisibles.

## Palette obligatoire

| Nom | Hex | Usage |
| --- | --- | --- |
| Corail aurore | `#FF8A70` | action principale, réponse active, énergie |
| Bleu crépuscule | `#708AC7` | orbites, sélections secondaires, profondeur |
| Abricot doux | `#F2B08F` | lumière chaude, micro-accents |
| Menthe signal | `#66D1B5` | succès, validation, progression acquise |
| Nuit claire | `#171C35` | panneaux et cartes |
| Indigo profond | `#0E1329` | surfaces sombres et ancrages |
| Ivoire lunaire | `#F8EEE4` | texte principal et surfaces claires |

Les valeurs hexadecimales sont autorisees uniquement dans :

- `src/theme/tokens.ts`
- `src/theme/theme.css`

## Regles graphiques strictes

- Le fond principal est une nuit indigo enrichie de halos statiques et discrets.
- Les titres sont ivoire ; le corail est réservé aux actions ou états importants.
- Les fenêtres de notation restent claires, presque opaques et sans lueur sur les glyphes.
- Les portées et symboles utilisent la géométrie SMuFL existante et conservent un fort contraste.
- Les boutons sont grands, tactiles et faciles a viser sur iPhone.
- Les réponses des QCM ne gardent aucun effet de survol sur écran tactile : leur survol est réservé à `(hover: hover) and (pointer: fine)`. Le retour d'appui et le focus visible au clavier restent disponibles.
- Les coins sont souples mais architecturaux, sans effet jouet.
- Les ombres sont diffuses ; aucun effet lumineux ne doit gêner la lecture musicale.
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
- [ ] Le fond principal et le chrome PWA utilisent la nuit Aurora.
- [ ] Les titres sont ivoire et les actions principales corail.
- [ ] La notation reste sombre sur une surface claire et sans déformation.
- [ ] Les boutons sont grands et tactiles sur iPhone.
- [ ] Les coins et ombres correspondent a la charte.
- [ ] La page `/styleguide` permet une verification visuelle complete.
