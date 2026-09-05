# Piano — vérification iPhone et ergonomie

Vérification du 5 septembre 2026. Les tests ci-dessous sont des **simulations navigateur**, pas des essais sur iPhone physiques. Ils couvrent le jeu libre `/piano/play`, le choix `/piano` et les régressions de `/exercise?mode=piano`.

## Matrice d'affichage

Chromium et WebKit : 20 configurations paysage par moteur, soit 40 au total, plus les retours en portrait et l'exercice après réponse. Aucun débordement, libellé hors touche, touche inaccessible ou erreur JavaScript détecté dans cette matrice.

| Profil | Viewport paysage en pixels CSS | Touches noires, deux octaves | Touches noires, grandes touches |
| --- | --- | --- | --- |
| iPhone 7 | 667 × 375 | 32 px | 53,2 px |
| iPhone 13 mini | 812 × 375 | 36,2 px | 60,5 px |
| iPhone 13 mini, variante compacte | 780 × 360 | 34,5 px | 57,8 px |
| iPhone 14 | 844 × 390 | 38,1 px | 63,8 px |
| iPhone 16 Pro | 874 × 402 | 38,1 px | 63,8 px |

Chaque profil est rejoué avec 90 px de hauteur retirés pour stresser l'espace disponible avec les barres du navigateur. Les marges latérales simulées sont respectivement 0, 50, 50, 47 et 62 px ; une marge basse de 21 px est ajoutée aux profils avec encoche. Ce sont des hypothèses de stress, pas des mesures des barres Safari ou des safe areas sur chaque appareil. Les captures utilisent un facteur de pixels de 1 ; elles ne mesurent pas les performances sur écran Retina.

## Arbitrages ergonomiques

- Deux octaves restent visibles par défaut. Un bouton loupe « Grandes touches » affiche une octave, avec choix Do4–Si4 / Do5–Si5. Changer de vue arrête les notes maintenues.
- Les commandes font au moins 44 × 44 px CSS. Apple recommande une zone tactile d'au moins 44 × 44 points dans ses [conseils de conception](https://developer.apple.com/design/tips/).
- Une vue de deux octaves sur iPhone ne permet pas des touches noires de 44 px **et** un espacement crédible sans sacrifier les blanches. Ce compromis est explicite : les noires font 32–38 px en vue complète, mais dépassent 53 px avec les grandes touches. Cette dernière vue est à privilégier pour les mélodies précises sur petit écran.
- Les noires restent groupées par deux et trois. Elles occupent 56 % de la hauteur, laissant le bas des blanches largement dégagé. En vue agrandie, la largeur des blanches est de 88–106 px.
- Pas de hitbox invisible autour des noires : leur surface visible est prioritaire, le blanc visible dessous reste jouable. Le test contrôle trois points par touche et deux points sous chaque noire. L'appui ne déplace plus la géométrie des touches.
- Noms agrandis, deux écritures enharmoniques sur deux lignes. Les raccourcis restent affichés sur ordinateur, mais sont masqués sur interface tactile pour alléger la lecture.
- Une courte mélodie à essayer et les notes jouées apportent un repère ludique. Même un accord de 24 notes ne redimensionne plus le clavier. Aucun score ni progression n'est enregistré en jeu libre.

## Jeu et son

Les contrôles réels de pointeur dans Chromium et WebKit vérifient le glissement blanc/noir, la sortie puis le retour dans le clavier, et le partage d'une note entre souris et clavier. Chromium vérifie également, avec trois contacts tactiles injectés, Do–Mi–Sol, le glissement d'un seul doigt vers Do♯, son relâchement indépendant et l'annulation des autres contacts.

Les tests unitaires couvrent les 24 raccourcis AZERTY, les répétitions, les modificateurs, les champs éditables, les sources multiples, l'annulation et la perte de capture, le changement de vue, le mute, le blur, le masquage de page et le démontage. Une reprise audio asynchrone après relâchement ne doit jamais déclencher une note fantôme.

Le son est une approximation synthétique locale de corde frappée : attaque de 8 ms, harmoniques qui décroissent, relâchement de 120 ms, extinction naturelle d'une note longuement tenue et compression des accords. Ce n'est pas un piano acoustique échantillonné, ni un instrument avec vélocité ou pédale.

Rendu numérique Web Audio dans Chromium : La4 mesuré à 440 Hz, décroissance pendant le maintien, silence après relâchement ; l'accord de stress de 24 notes atteint une amplitude maximale d'environ 0,823, inférieure au seuil d'écrêtage de 1. Ces mesures ne constituent pas une écoute subjective ni une mesure de latence tactile.

**Limite WebKit sous Windows :** le moteur disponible n'expose ni AudioContext ni OfflineAudioContext. Il vérifie le rendu, les interactions et le repli sans audio, mais pas la synthèse sonore de Safari iOS. Comme l'indique la [documentation Playwright](https://playwright.dev/docs/browsers#webkit), ce moteur de test n'est pas le navigateur Safari installé sur un appareil.

## Compatibilité et hors ligne

- Cible JavaScript/CSS Safari 15. Les styles Piano ont un repli sans `color-mix()`, contrôlé en désactivant cette fonction dans la feuille de style servie. L'apparence y est simplifiée, mais le clavier, ses séparations et les appuis restent lisibles. Ce test ne remplace pas Safari 15 sur iPhone 7.
- Le build de production a été rechargé hors ligne : jeu libre, grandes touches Do5–Si5, retour au choix Piano et exercice après réponse fonctionnent.
- Ce contrôle a découvert et corrigé un défaut de cache avec `Vary: Origin` : les requêtes des modules pouvaient manquer les ressources pourtant précachées. La tolérance est limitée aux ressources publiques du shell et aux assets hashés. Les autres URL conservent le comportement `Vary` normal.
- Le cache applicatif passe en v7 ; les progressions locales ne sont pas effacées.

## Rejouer les vérifications

Avec Playwright installé et ses navigateurs Chromium/WebKit disponibles, lancer le serveur sur le port 5173 puis, dans un autre terminal :

```text
node scripts/run-piano-iphone-checks.mjs chromium
node scripts/run-piano-iphone-checks.mjs webkit
```

`PLAYWRIGHT_MODULE` peut désigner le chemin absolu du fichier `index.mjs` d'une installation Playwright existante. Aucun ajout aux dépendances de production n'est nécessaire. Les rapports JSON et captures sont générés dans `.playwright-mcp/`, ignoré par Git. `--playability-only` rejoue uniquement les interactions, l'audio et le repli CSS.

Pour le build hors ligne, lancer `npm run build`, puis `npm run preview -- --port 4173` dans un terminal séparé et exécuter :

```text
node scripts/check-piano-offline.mjs
```

Les validations générales restent `npm test`, `npm run build` et `npm run check:design`.

## À confirmer sur appareils physiques

La [checklist PWA](PWA_CHECKLIST.md#piano-en-jeu-libre-sur-iphone) détaille le dernier passage manuel. Sur chacun des quatre iPhone : Safari et PWA, paysage dans les deux sens, barres affichées/rétractées, accords à trois doigts, répétitions rapides, interruption par le centre de contrôle ou verrouillage, reprise du son, haut-parleurs et casque. La latence, la précision ressentie sous le doigt, le bouton silencieux et les particularités des versions iOS ne sont pas certifiés par les simulations.
