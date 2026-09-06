---
name: contribuer-edukonote
description: Contribuer au code et à la documentation de la PWA musicale EdukoNote. Utiliser pour les évolutions, corrections et revues de ce dépôt.
---

# Contribuer à EdukoNote

EdukoNote est une PWA React/TypeScript locale. Les chemins de code ci-dessous partent de la racine du dépôt.

## S'orienter

- Pour le périmètre produit, les routes, l'architecture ou les formats stockés, consulter le [README](../../../README.md).
- Pour une modification d'interface, consulter le [design system](../../../docs/DESIGN_SYSTEM.md).
- Choisir les vérifications dans le [guide de validation](../../../docs/VALIDATION.md), selon les comportements touchés.

Garder les calculs métier dans `src/domain`, l'état des sessions et la persistance dans `src/hooks`, et la présentation dans les pages et composants. Les routes sont assemblées dans `src/App.tsx`.

## Points à préserver selon la tâche

**Progression et exercices.** Les progressions Notes, Symboles et Piano pédagogique sont indépendantes. Notes et Piano séparent aussi les clés musicales. Préserver les migrations et normalisations existantes ; un reset reste limité au compartiment demandé. Une bonne réponse peut lever `needsReview` sans effacer l'historique des erreurs. Le jeu libre ne sauvegarde aucune progression.

**Notation.** Réutiliser `src/components/music`, ses glyphes SMuFL et les géométries de portée existantes. Vérifier la clé, les lignes supplémentaires et les altérations concernées. Conserver la provenance et la licence de la police locale avec l'asset.

**Piano et audio.** Une touche peut être tenue par plusieurs sources : son relâchement attend la dernière source active. Préserver les glissements et accords indépendants, l'arrêt sur perte de visibilité, changement de vue ou démontage, et l'annulation d'une demande relâchée pendant une reprise audio asynchrone. Points d'entrée : `PianoKeyboard.tsx`, `FreePianoPage.tsx`, `usePianoAudio.ts` et `src/audio/pianoSynth.ts`.

**PWA.** Le remplacement du cache dans `public/sw.js` doit attendre un shell complet et conserver les données utilisateur. Les ressources nécessaires restent locales. Tester le hors-ligne sur le build de production ; le serveur de développement n'enregistre pas le service worker.

## Vérifier et maintenir

S'appuyer sur les tests proches du code modifié et compléter avec les parcours du guide de validation lorsqu'ils sont concernés. Pour les changements de docs seuls, vérifier les liens et les faits cités. Rapporter les contrôles réellement exécutés et les limites restantes des simulations.

Conserver les procédures dans le guide de validation, les règles visuelles dans le design system et les repères produit dans le README. Actualiser le document concerné sans recopier son contenu ici.
