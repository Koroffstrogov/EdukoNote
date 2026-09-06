# Design system EdukoNote

## Intention visuelle

Aurora Session évoque un studio musical contemporain pour les 7–12 ans : fond indigo, halos discrets, titres ivoire et accents corail, cyan ou menthe. Les corrections restent encourageantes : « Bravo ! » et « Presque ! ».

La notation reste sombre sur une surface claire, avec un contraste fort et sans lueur sur les glyphes. Les coins sont souples et les ombres diffuses ; la décoration doit préserver la lisibilité musicale.

## Sources de référence

- [tokens.ts](../src/theme/tokens.ts) définit les palettes, leurs noms et leur association aux clés.
- [theme.css](../src/theme/theme.css) contient les variables et les styles. Utiliser les tokens existants pour les couleurs, espacements, rayons, ombres et tailles tactiles.
- [StyleGuidePage.tsx](../src/pages/StyleGuidePage.tsx), accessible sur `/styleguide`, présente les palettes, composants et symboles. Actualiser cette page lorsqu'un élément du socle change.
- [components/ui](../src/components/ui) fournit les boutons, cartes, retours et indicateurs réutilisables.

Les couleurs directes dans `src/` sont réservées aux deux fichiers de thème. Le contrôle automatique détecte les valeurs hexadécimales et les fonctions RGB/HSL ailleurs dans ce dossier ; sa commande figure dans le [guide de validation](VALIDATION.md).

Conserver un rendu léger en CSS/SVG, avec la police musicale locale et sans dépendance graphique lourde.

## Notation musicale

Réutiliser les composants de [components/music](../src/components/music), leurs glyphes SMuFL et leur géométrie : proportions, placement des clés, lignes supplémentaires et altérations doivent rester cohérents. Une modification de taille doit conserver l'alignement sur la portée.

La [provenance de la police](../public/fonts/README.md) et sa [licence](../public/fonts/OFL.txt) accompagnent l'asset distribué.

## Interactions

- Prévoir des commandes faciles à viser sur iPhone et garder la question, le retour et l'action suivante accessibles sur petit écran.
- Réserver le survol des réponses QCM à `(hover: hover) and (pointer: fine)`. Conserver le retour d'appui et le focus visible au clavier.
- Garder les libellés accessibles cohérents avec l'exercice ; les réglages d'affichage des réponses doivent être respectés.
- Sur le piano, préserver les marges d'encoche et d'indicateur d'accueil, ainsi que l'invitation à tourner l'appareil en portrait mobile.
- Les commandes du piano visent au moins 44 × 44 px CSS. La vue complète de deux octaves accepte des touches noires plus étroites ; « Grandes touches » donne accès à une octave avec des cibles plus larges.
- La surface visible détermine la touche jouée : le blanc sous une noire reste jouable. Les appuis et les accords ne déplacent pas le clavier.
- En jeu libre, bloquer la sélection de texte et les menus d'appui long sur l'ensemble de l'écran. Limiter ce blocage global à ce mode.
- En Rythmes, réserver le blocage des gestes à la zone de frappe. Pendant une séance, garder Réglages, la zone de frappe et Arrêter visibles ; sur un écran court, regrouper les repères de pulsation sur une ligne et afficher une mesure de lecture à la fois. Le catalogue et les résultats peuvent défiler.

Les contrôles visuels, tactiles et iPhone sont regroupés dans le [guide de validation](VALIDATION.md).
