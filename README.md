# EdukoNote

PWA React + TypeScript + Vite pour EdukoNote, une application iPhone d'apprentissage des notes de musique.

Le MVP permet de reconnaitre les notes en cle de sol, une note a la fois, avec correction immediate, progression locale et defi 10 notes. La charte graphique reste verrouillee par le design system et par le garde-fou anti-couleurs directes dans `src/`.

## Fonctionnalites

- Entrainement progressif sur deux octaves internes en cle de sol.
- Defi 10 notes avec score final.
- Revision des erreurs en priorite.
- Progression stockee dans `localStorage`.
- PWA installable avec manifest, icones locales et service worker.
- Recharge hors ligne apres une premiere visite en production.
- Aucune API externe, aucun compte, aucune publicite, aucune donnee distante.

## Installation

```bash
npm install
```

## Lancement sur PC

```bash
npm run dev
```

Ouvrir ensuite :

```text
http://localhost:5173/
```

Pages utiles :

```text
http://localhost:5173/styleguide
http://localhost:5173/exercise?mode=training
```

## Build production

```bash
npm run build
```

Tester le build localement :

```bash
npm run preview
```

Par defaut, Vite Preview expose l'application sur :

```text
http://localhost:4173/
```

Le service worker est enregistre uniquement en mode production, donc `npm run preview` est le bon mode pour tester le hors-ligne sur PC.

## Test iPhone via reseau local

1. Connecter l'iPhone et l'ordinateur au meme Wi-Fi.
2. Lancer le serveur de developpement :

```bash
npm run dev
```

3. Trouver l'adresse IPv4 locale de l'ordinateur.
   - Windows PowerShell : `Get-NetIPAddress -AddressFamily IPv4`
   - macOS/Linux : `ipconfig getifaddr en0` ou `ip addr`
4. Depuis Safari sur l'iPhone, ouvrir :

```text
http://ADRESSE_IP_LOCALE:5173/
```

Ce test valide le rendu mobile et l'ergonomie tactile. Le service worker ne tourne pas en mode `dev`.

## Ajouter a l'ecran d'accueil sur iPhone

Pour tester la vraie PWA iOS, utiliser une URL HTTPS de production ou un tunnel HTTPS vers le build `npm run preview`.

1. Ouvrir l'URL HTTPS dans Safari sur l'iPhone.
2. Appuyer sur le bouton de partage.
3. Choisir `Sur l'ecran d'accueil`.
4. Garder le nom `EdukoNote`.
5. Ouvrir EdukoNote depuis l'icone ajoutee.
6. Faire une premiere visite en ligne pour laisser le service worker mettre l'application en cache.
7. Couper le reseau puis relancer l'application depuis l'icone.

## Tester le hors-ligne sur PC

1. Lancer :

```bash
npm run build
npm run preview
```

2. Ouvrir `http://localhost:4173/`.
3. Naviguer au moins une fois vers l'accueil et un exercice.
4. Ouvrir DevTools, onglet Application, Service Workers.
5. Verifier que `sw.js` est actif.
6. Passer en mode Offline dans DevTools.
7. Recharger la page.
8. Verifier que l'application se recharge et que `/exercise?mode=training` reste utilisable.

## Progression locale

La progression est stockee dans `localStorage` sous la cle :

```text
edukonote.progress.v1
```

Les mises a jour du service worker ne suppriment pas cette cle. La progression reste conservee apres rafraichissement, relance de l'app installee et mise a jour applicative normale.

## Limites connues iOS PWA

- iOS exige un contexte securise pour les service workers : HTTPS en production, ou `localhost` sur la machine locale.
- Une URL `http://ADRESSE_IP_LOCALE` est utile pour tester le rendu iPhone, mais ne permet pas de valider completement le service worker hors ligne.
- Safari peut purger le stockage local si l'espace manque ou si les donnees du site sont supprimees.
- Le mode hors ligne doit etre teste apres une premiere visite en ligne.

## Commandes utiles

```bash
npm run dev
npm run build
npm run preview
npm test
npm run check:design
```

## Documentation

- Charte graphique : `docs/DESIGN_SYSTEM.md`
- Checklist PWA : `docs/PWA_CHECKLIST.md`

## Regle de design verrouillee

Les composants et pages ne doivent pas coder de couleurs directement. Les valeurs de couleur autorisees dans `src/` sont limitees a :

- `src/theme/tokens.ts`
- `src/theme/theme.css`

Le script `npm run check:design` echoue si une valeur hexadecimale, `rgb(...)`, `rgba(...)`, `hsl(...)` ou `hsla(...)` est ajoutee ailleurs dans `src/`.
