# Checklist PWA EdukoNote

Cette checklist sert a verifier le lot PWA/iPhone/offline sans modifier la charte graphique.

## Manifest

- [ ] `public/manifest.webmanifest` existe.
- [ ] `name` vaut `EdukoNote`.
- [ ] `short_name` vaut `EdukoNote`.
- [ ] `description` vaut `Apprendre les notes de musique pas à pas`.
- [ ] `lang` vaut `fr`.
- [ ] `start_url` vaut `/`.
- [ ] `display` vaut `standalone`.
- [ ] `orientation` vaut `portrait`.
- [ ] `background_color` vaut `#FFF8F1`.
- [ ] `theme_color` vaut `#FFF8F1`.

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
- [ ] `theme-color` vaut `#FFF8F1`.
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

## Test iPhone

1. Tester le rendu mobile via reseau local avec `npm run dev`.
2. Pour l'installation PWA, utiliser une URL HTTPS de production ou un tunnel HTTPS.
3. Ouvrir l'URL dans Safari.
4. Utiliser Partage puis `Sur l'ecran d'accueil`.
5. Ouvrir EdukoNote depuis l'icone.
6. Faire une premiere visite en ligne.
7. Couper le reseau.
8. Relancer l'app et verifier que l'ecran d'accueil se recharge.

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
