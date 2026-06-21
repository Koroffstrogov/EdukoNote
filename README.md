# EdukoNote

PWA React + TypeScript + Vite pour EdukoNote, une application iPhone d'apprentissage des notes de musique.

Le MVP permet de reconnaitre les notes en cle de sol, une note a la fois, avec correction immediate, progression locale et defi 10 notes. La charte graphique reste verrouillee par le design system et par le garde-fou anti-couleurs directes dans `src/`.

## Fonctionnalites MVP

- Entrainement progressif : Mi, Sol et Si au depart, puis Fa, La, Do, Re et Do aigu.
- Defi 10 notes avec score final.
- Revision des erreurs en priorite.
- Progression stockee dans `localStorage`.
- Aucune API externe, aucun compte, aucune donnee distante.

## Installation

```bash
npm install
```

## Lancement local

```bash
npm run dev
```

Ouvrir ensuite l'URL affichee par Vite, par defaut :

```text
http://localhost:5173/
```

La page de verification visuelle est disponible ici :

```text
http://localhost:5173/styleguide
```

## Test PC

1. Lancer `npm run dev`.
2. Ouvrir `http://localhost:5173/`.
3. Ouvrir `http://localhost:5173/styleguide`.
4. Verifier que les boutons, cartes, chips, feedbacks et la portee simplifiee respectent la charte.
5. Lancer les controles :

```bash
npm run build
npm test
npm run check:design
```

## Test iPhone sur reseau local

1. Connecter l'iPhone et l'ordinateur au meme Wi-Fi.
2. Lancer le serveur. Le script `dev` expose deja Vite sur le reseau local :

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

5. Pour tester le mode PWA apres un build, lancer `npm run build` puis servir `dist/` avec un serveur statique local. Ajouter ensuite la page a l'ecran d'accueil depuis Safari.

## Commandes utiles

```bash
npm run dev
npm run build
npm test
npm run check:design
```

## Regle de design verrouillee

Les composants et pages ne doivent pas coder de couleurs directement. Les valeurs de couleur autorisees dans `src/` sont limitees a :

- `src/theme/tokens.ts`
- `src/theme/theme.css`

Le script `npm run check:design` echoue si une valeur hexadecimale, `rgb(...)`, `rgba(...)`, `hsl(...)` ou `hsla(...)` est ajoutee ailleurs dans `src/`.
