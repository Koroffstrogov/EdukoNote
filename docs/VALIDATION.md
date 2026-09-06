# Valider EdukoNote

Choisir les contrôles selon les fichiers et comportements modifiés. Ce guide décrit des procédures reproductibles ; les résultats dépendent du build et de l'environnement testés.

## Contrôles du projet

Depuis la racine, après l'installation décrite dans le [README](../README.md) :

| Commande | Ce qu'elle vérifie |
| --- | --- |
| `npm test` | Logique métier, migrations, sessions, composants, cycle audio et contrats PWA. |
| `npm run build` | Types TypeScript et compilation de production avec la cible Safari définie dans [vite.config.ts](../vite.config.ts). |
| `npm run check:design` | Absence de couleurs directes hors des fichiers de thème autorisés. |

Pour une correction ciblée, commencer par le test voisin, par exemple `npm test -- src/domain/quiz.test.ts`. Compléter selon l'impact : rendu sur `/styleguide` pour le thème, scénarios QCM pour les réponses, piano pour le clavier/audio, build de production pour le hors-ligne.

Pour une modification limitée aux docs ou au skill, vérifier les liens, les commandes citées et la cohérence avec le code. Rejouer les procédures seulement si leur modification ou une incertitude le justifie.

## Scénarios navigateur

Playwright et ses navigateurs Chromium/WebKit sont nécessaires. Ils ne sont pas déclarés dans les dépendances du dépôt. Pour une installation locale de test :

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium webkit
```

Une installation existante peut aussi être utilisée : définir `PLAYWRIGHT_MODULE` avec le chemin absolu de son fichier `index.mjs`. En PowerShell, par exemple : `$env:PLAYWRIGHT_MODULE = 'C:\chemin\vers\playwright\index.mjs'`.

Les scénarios QCM et piano attendent le port **5173**. Lancer dans un terminal :

```sh
npm run dev -- --port 5173 --strictPort
```

Puis exécuter les scénarios concernés dans un autre terminal :

```sh
node scripts/check-qcm-interactions.mjs chromium
node scripts/check-qcm-interactions.mjs webkit
node scripts/run-piano-iphone-checks.mjs chromium
node scripts/run-piano-iphone-checks.mjs webkit
```

- QCM : Notes, dont Vitesse, et Symboles ; retour à des réponses neutres après chaque question, survol à la souris et activation au clavier.
- Piano : disposition sur les profils définis dans [check-piano-iphones.js](../scripts/check-piano-iphones.js), portrait, grandes touches, navigation et exercice après réponse. [check-piano-playability.js](../scripts/check-piano-playability.js) couvre les glissements, sources simultanées, accords tactiles dans Chromium, rendu audio numérique et repli sans `color-mix()`.
- Ajouter `--playability-only` à la commande piano pour cibler les interactions, l'audio et le repli CSS.

Les contextes de test isolent leur progression de celle de l'utilisateur. Les rapports JSON et captures QCM/piano sont écrits dans `.playwright-mcp/`, ignoré par Git.

Pour les réglages de lecture, vérifier à `375 × 667` que Bas / Haut / Tout restent visibles dans les paramètres et le panneau rapide. En Entraînement ou Révision, changer de zone avant une réponse doit renouveler la question sans enregistrer d'essai ; après une réponse, la correction reste visible jusqu'à « Note suivante ». Vérifier aussi l'accès depuis une révision vide, le retour du focus après fermeture et la mémorisation par clé au rechargement.

Les marges d'encoche et les barres de navigateur sont simulées ; les captures à facteur de pixels 1 ne mesurent pas les performances Retina. Chromium et WebKit ne remplacent pas Safari sur iPhone. Si le rapport signale une API audio indisponible, le comportement sans cette API est couvert, mais la synthèse correspondante reste à tester sur appareil. Les mesures numériques ne valident ni la latence tactile ni la qualité sonore perçue.

## Hors ligne et persistance

Le service worker est enregistré uniquement en production. Lancer :

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

Dans un second terminal, avec Playwright disponible :

```sh
node scripts/check-piano-offline.mjs
```

Ce scénario Chromium recharge le jeu libre hors ligne, joue dans l'octave haute agrandie puis rejoint l'exercice Piano. Son résultat est affiché dans le terminal.

Pour couvrir les autres parcours ou une modification du cache :

1. Ouvrir `http://localhost:4173/` dans un profil de test et vérifier dans DevTools que le service worker contrôle la page.
2. Répondre à des questions Notes et Symboles, régler une zone de lecture et noter les progressions ; les clés de stockage sont listées dans le [README](../README.md#données-locales).
3. Passer hors ligne dans DevTools, recharger puis parcourir les écrans concernés, y compris les liens directs. Vérifier le rendu de la notation, les icônes et la conservation des données.
4. Si le cache évolue, tester aussi la mise à jour depuis le build précédent : une installation incomplète doit conserver l'ancien shell, une installation complète doit permettre la reprise hors ligne, et la progression doit rester intacte.
5. Si la persistance évolue, vérifier la migration, le rechargement et la remise à zéro du seul compartiment visé dans un profil de test.

Après un changement du manifest ou du shell, contrôler l'installation, les icônes locales et la cohérence du chrome avec le thème. Conserver `orientation: any` dans le [manifest](../public/manifest.webmanifest) pour le piano en paysage, et les métadonnées iOS/viewport dans [index.html](../index.html).

## Passage sur iPhone

Pour le rendu tactile via le réseau local, connecter l'iPhone au même Wi-Fi que l'ordinateur exécutant le serveur de développement, puis ouvrir `http://ADRESSE_IP_LOCALE:5173/`. Cette adresse HTTP sert au rendu ; l'installation et le hors-ligne demandent une URL **HTTPS** vers le build de production.

Dans Safari : ouvrir l'URL HTTPS, utiliser Partage → Sur l'écran d'accueil, lancer l'app installée et attendre sa mise en cache en ligne. Couper ensuite le réseau et relancer l'app. Une première mise en cache complète est nécessaire ; le stockage reste exposé à une suppression des données du site ou à une purge par iOS.

Pour les écrans modifiés, vérifier Safari et la PWA installée :

- Questions Notes/Symboles : réponses et action suivante accessibles sur petit écran ; la simulation `375 × 667` sert de premier contrôle.
- Piano pédagogique : invitation à tourner en portrait, douze touches et retour après réponse accessibles en paysage, y compris au format compact `568 × 320`.
- Jeu libre : paysage dans les deux sens, barres affichées/rétractées, aucune touche sous l'encoche ou l'indicateur d'accueil ; vérifier les deux octaves et les deux vues agrandies.
- Jouer Do–Do–Sol–Sol–La–La–Sol, puis Do–Mi–Sol à trois doigts. Glisser un doigt vers Do♯ et le relâcher sans interrompre les deux autres notes.
- Verrouiller, ouvrir le centre de contrôle, changer d'app puis revenir : aucune note bloquée, reprise du son correcte. Évaluer répétitions rapides, latence, haut-parleur, casque et bouton silencieux.
- Vérifier que le jeu libre ne modifie aucune progression.

Le script Piano couvre les profils iPhone 7, 13 mini, 14 et 16 Pro. Le parc cible de l'atelier Rythmes ci-dessous inclut également l'iPhone 15. Pour annoncer une compatibilité sur un appareil, consigner le modèle, la version iOS, le build testé et les observations physiques ; distinguer les simulations des essais matériels.

### Atelier Garde la pulsation sur iPhone réel

Ouvrir `/rhythms` dans Safari, d'abord au haut-parleur, volume modéré. Une URL HTTP sur le réseau local suffit à ce premier essai audio/tactile ; tester séparément la PWA depuis une URL HTTPS de production. Le [catalogue et les limites du bilan](RHYTHMS.md) précisent le périmètre du prototype.

Parc cible retenu : iPhone 7, 13 mini, 14, 15 et 16 Pro. Le modèle 15 désigne ici l'iPhone 15 standard. Renseigner la version d'iOS réellement installée sur chaque appareil, puis appliquer le même protocole dans Safari et dans la PWA.

| Modèle | Format complet en portrait (px CSS) | Hauteur réduite (px CSS) | iOS installé | Safari réel / PWA réelle |
| --- | --- | --- | --- | --- |
| iPhone 7 | 375 × 667 | 375 × 547¹ | À relever | À faire / À faire |
| iPhone 13 mini | 375 × 812 | 375 × 629 | À relever | À faire / À faire |
| iPhone 14 | 390 × 844 | 390 × 664 | À relever | À faire / À faire |
| iPhone 15 | 393 × 852 | 393 × 659 | À relever | À faire / À faire |
| iPhone 16 Pro | 402 × 874 | 402 × 681 | À relever | À faire / À faire |

Les dimensions viennent des [profils Playwright](https://raw.githubusercontent.com/microsoft/playwright/main/packages/isomorphic/deviceDescriptorsSource.json), consultés le 6 septembre 2026. Elles servent de repères de mise en page ; la surface réelle varie avec les barres de Safari, le zoom d'affichage et les marges d'écran. ¹ Pour l'iPhone 7, 547 px est un cas de contrôle volontairement réduit de 120 px, pas une mesure sur appareil.

Contrôle du 6 septembre 2026 sur le build local `index-IYjQm-mf.js` / `index-DKXowcSP.css` : les dix formats ont été vérifiés dans le navigateur Chromium intégré. Bouton de démarrage visible dans les cinq hauteurs réduites ; zone de frappe et bouton « Arrêter » visibles dans les dix formats ; aucun débordement horizontal ni erreur navigateur relevée. Ce contrôle modifie uniquement la taille de la fenêtre : il ne reproduit pas le moteur Safari, les encoches, le tactile ou la latence de ces iPhone.

| Essai | Résultat attendu |
| --- | --- |
| Démarrer à 72 bpm, puis à 60 et 90 | Quatre clics d'écoute, puis seize pulsations ; sons distincts et réguliers, premier temps accentué tous les quatre temps. |
| Frapper une fois par clic, puis volontairement deux fois | Le compteur augmente d'une unité par contact ; les doubles frappes apparaissent dans « Frappes en plus ». Aucun clic tactile supplémentaire. |
| Garder le doigt posé, le relâcher, retaper | Un contact tenu compte une fois ; le suivant compte à nouveau. Pas de sélection de texte, zoom ou défilement sur la zone de frappe. |
| Omettre une pulsation, finir la séance | Le bilan signale l'absence ; il reste compréhensible sans pourcentage de précision. |
| Désactiver les repères visuels | Son et frappe restent utilisables ; aucun repère de temps ne s'allume. |
| Arrêter pendant le décompte et pendant le jeu | Silence immédiat, aucune évaluation ; « Recommencer » lance une nouvelle séance complète. |
| Verrouiller ; changer d'app ; ouvrir le centre de contrôle ; recevoir un appel si possible | Le son cesse et ne repart pas seul. Au retour, tentative annulée, redémarrage explicite sans doublons. |
| Interrompre aussitôt après « Commencer » | Une reprise audio retardée ne déclenche aucun clic après l'arrêt. |
| Tester casque filaire/Bluetooth et changer de sortie pendant une séance | Relever le décalage perçu. Une interruption audio annule la tentative ; un changement de sortie non signalé peut nécessiter un arrêt manuel. Ne pas valider les seuils sur le seul Bluetooth. |
| Refaire dans la PWA installée, puis hors ligne après mise en cache | Même cycle de jeu, notation locale et arrêt ; aucune progression Notes/Symboles/Piano modifiée. |

Relevé à compléter : date, modèle, iOS, Safari/PWA, URL et identifiant de build, sortie audio, état du mode silencieux, clics entendus, réactions aux frappes, interruptions, problèmes reproductibles et décision sur les seuils. **Validation matérielle à effectuer : aucun essai physique iPhone n'est attesté par les tests automatisés du dépôt.**
