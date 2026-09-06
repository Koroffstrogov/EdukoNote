# EdukoNote

PWA d'apprentissage musical en français, conçue pour l'iPhone et utilisable sur ordinateur. React, TypeScript et Vite ; ressources et synthèse sonore locales, sans compte, publicité ni API externe.

## Fonctionnalités

- Lecture en clés de Sol, Fa et Ut 4, avec choix de la zone par clé et accès rapide en entraînement ou révision.
- Notes : entraînement progressif, défi de 10 questions, révision des erreurs et mode Vitesse.
- Symboles : entraînement, défi de 10 questions et révision.
- Piano : lecture sur clavier et jeu libre polyphonique Do4–Si5, avec glissement, accords et vue « Grandes touches » sur une octave.
- Rythmes : « Garde la pulsation », « Écho rythmique » et « Lis et frappe » sur un moteur commun, réglages rapides et progression locale ; [vingt formules à confronter au cours](docs/RHYTHMS.md).
- Progression locale et installation PWA ; utilisation hors ligne après une première visite du build de production mis en cache.

## Démarrer

Avec Node.js et npm installés, depuis la racine du dépôt :

```sh
npm ci
npm run dev
```

Ouvrir `http://localhost:5173/`. Pour consulter le build de production :

```sh
npm run build
npm run preview
```

Ouvrir `http://localhost:4173/`. Le service worker est activé uniquement en production ; les procédures iPhone et hors ligne figurent dans le [guide de validation](docs/VALIDATION.md).

## Se repérer dans le code

| Emplacement | Rôle |
| --- | --- |
| [src/App.tsx](src/App.tsx), [src/pages](src/pages) | Routes choisies par le chemin de l'URL et assemblage des écrans. |
| [src/domain](src/domain) | Notes, symboles, questions, progression et normalisation des données. |
| [src/hooks](src/hooks) | Sessions React, persistance, synchronisation entre onglets et cycle de vie audio. |
| [src/components](src/components) | Composants d'interface, exercices et rendu de la notation musicale. |
| [src/theme](src/theme), [src/audio](src/audio) | Thème graphique, synthèse du piano et horloge sonore commune aux exercices de rythmes. |
| [public/sw.js](public/sw.js), [public](public) | Cache hors ligne, manifest, icônes et police musicale locale. |
| [scripts](scripts) | Contrôles du design et scénarios navigateur. Les tests unitaires et de composants sont placés près du code dans `src/`. |

Routes utiles : `/exercise?mode=training`, `/symbols`, `/piano`, `/piano/play`, `/rhythms`, `/settings` et `/styleguide`. Les modes des exercices sont définis dans les pages correspondantes.

## Données locales

Les clés `localStorage` et leurs formats sont définis dans les modules suivants :

| Données | Clé | Source |
| --- | --- | --- |
| Notes, par clé musicale | `edukonote.progress.v2` | [progress.ts](src/domain/progress.ts) |
| Piano pédagogique, par clé et écriture musicale | `edukonote.pianoProgress.v1` | [pianoProgress.ts](src/domain/pianoProgress.ts) |
| Symboles | `edukonote.symbolProgress.v1` | [symbolProgress.ts](src/domain/symbolProgress.ts) |
| Zones de lecture | `edukonote.settings.v1` | [settings.ts](src/domain/settings.ts) |
| Rythmes, par exercice, formule, tempo et aides | `edukonote.rhythmProgress.v1` | [rhythmProgress.ts](src/domain/rhythmProgress.ts) |
| Derniers réglages de rythmes | `edukonote.rhythmSettings.v1` | [rhythmExercise.ts](src/domain/rhythmExercise.ts) |

L'ancienne progression `edukonote.progress.v1` est migrée vers la clé de Sol du format actuel. Le jeu libre ne sauvegarde aucune progression. Rythmes enregistre uniquement les séances terminées ; son bouton de remise à zéro ne touche pas les autres exercices. Une mise à jour du cache applicatif conserve ces données ; leur suppression par l'utilisateur ou leur purge par le navigateur les efface.

## Contribuer

- [Design system](docs/DESIGN_SYSTEM.md) : intentions visuelles et règles d'interface.
- [Validation](docs/VALIDATION.md) : choix des contrôles, commandes et limites des simulations.
- [Skill contribuer-edukonote](.agents/skills/contribuer-edukonote/SKILL.md) : repères et précautions propres au projet pour les agents.
- [Police musicale](public/fonts/README.md) : provenance du sous-ensemble SMuFL et licence.
