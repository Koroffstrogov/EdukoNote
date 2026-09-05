# Checklist PWA EdukoNote

Cette checklist sert a verifier le lot PWA/iPhone/offline avec la charte Aurora Session.

## Manifest

- [ ] `public/manifest.webmanifest` existe.
- [ ] `name` vaut `EdukoNote`.
- [ ] `short_name` vaut `EdukoNote`.
- [ ] `description` décrit les sessions courtes et immersives.
- [ ] `lang` vaut `fr`.
- [ ] `start_url` vaut `/`.
- [ ] `display` vaut `standalone`.
- [ ] `orientation` vaut `any` afin d'autoriser le mode Piano en paysage.
- [ ] `background_color` vaut `#080B1C`.
- [ ] `theme_color` vaut `#080B1C`.

## Icones

- [ ] `public/icons/icon-192.png` existe.
- [ ] `public/icons/icon-512.png` existe.
- [ ] `public/icons/apple-touch-icon.png` existe.
- [ ] Les icones sont locales et coherentes avec la charte EdukoNote.
- [ ] Le manifest reference les icones 192 et 512.
- [ ] `index.html` reference l'apple touch icon.

## Index HTML

- [ ] `viewport` contient `width=device-width, initial-scale=1, viewport-fit=cover`.
- [ ] `mobile-web-app-capable` vaut `yes`.
- [ ] `apple-mobile-web-app-capable` vaut `yes`.
- [ ] `apple-mobile-web-app-title` vaut `EdukoNote`.
- [ ] `theme-color` vaut `#080B1C`.
- [ ] `apple-mobile-web-app-status-bar-style` vaut `black-translucent`.
- [ ] Le manifest est reference.

## Service worker et hors-ligne

- [ ] `public/sw.js` existe.
- [ ] Le service worker precache le shell applicatif.
- [ ] Le service worker met en cache les assets Vite necessaires.
- [ ] Les navigations hors ligne retombent sur le shell SPA.
- [ ] Les anciens caches sont supprimes a l'activation.
- [ ] Aucune donnee distante n'est mise en cache.

## Test PC

1. Lancer `npm run build`.
2. Lancer `npm run preview`.
3. Ouvrir `http://localhost:4173/`.
4. Ouvrir DevTools, onglet Application.
5. Verifier que le manifest est valide.
6. Verifier que `sw.js` est actif.
7. Ouvrir `http://localhost:4173/exercise?mode=training`.
8. Activer le mode Offline dans DevTools.
9. Recharger la page.
10. Verifier que l'application se recharge.

## Test viewport iPhone SE

- [ ] Dans DevTools, utiliser un viewport `375 x 667`.
- [ ] Ouvrir `/exercise?mode=training`.
- [ ] Verifier que les boutons de reponse ne sont pas coupes.
- [ ] Repondre a une question.
- [ ] Verifier que le feedback et `Note suivante` restent accessibles.
- [ ] Ouvrir `/exercise?mode=piano` en portrait et verifier l'invitation a tourner l'appareil.
- [ ] Passer en `568 x 320` paysage et verifier que les douze touches sont visibles et jouables.

## Test iPhone

1. Tester le rendu mobile via reseau local avec `npm run dev`.
2. Pour l'installation PWA, utiliser une URL HTTPS de production ou un tunnel HTTPS.
3. Ouvrir l'URL dans Safari.
4. Utiliser Partage puis `Sur l'ecran d'accueil`.
5. Ouvrir EdukoNote depuis l'icone.
6. Faire une premiere visite en ligne.
7. Couper le reseau.
8. Relancer l'app et verifier que l'ecran d'accueil se recharge.

## Piano en jeu libre sur iPhone

La matrice automatisee et ses limites sont detaillees dans [PIANO_IPHONE_QA.md](PIANO_IPHONE_QA.md).

- [ ] Sur iPhone 7, 13 mini, 14 et 16 Pro physiques : tester Safari puis la PWA installee.
- [ ] En paysage dans les deux sens : aucune touche sous l'encoche, les barres Safari ou l'indicateur d'accueil.
- [ ] En portrait : invite de rotation et retour vers `/piano` fonctionnels.
- [ ] Jouer Do–Do–Sol–Sol–La–La–Sol, puis un accord Do–Mi–Sol avec trois doigts.
- [ ] Glisser un doigt vers une touche noire sans interrompre les deux autres notes.
- [ ] En « Grandes touches », les deux groupes Do4–Si4 / Do5–Si5 sont accessibles.
- [ ] Verrouiller l'ecran, ouvrir le centre de controle, changer d'app puis revenir : aucune note bloquee.
- [ ] Verifier le son apres une interruption et hors ligne, ainsi que sa latence ressentie.
- [ ] Verifier que le jeu libre ne modifie aucune progression.

## Persistance

- [ ] Repondre a au moins une note.
- [ ] Verifier que `localStorage` contient `edukonote.progress.v1`.
- [ ] Rafraichir la page.
- [ ] Verifier que la progression est conservee.
- [ ] Relancer l'app installee.
- [ ] Verifier que la progression est toujours conservee.
- [ ] Mettre a jour l'app.
- [ ] Verifier que la progression n'est pas ecrasee.

## Commandes de validation

```bash
npm run build
npm test
npm run check:design
```
