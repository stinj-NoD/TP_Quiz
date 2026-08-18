# Cahier d'architecture et de design — Ludopia

Ce document est un mémo de principes et de design pour l'évolution de Ludopia vers une plateforme de jeux multiples. Il a été retravaillé à partir d'une première version écrite avant que le code réel n'existe : les prescriptions d'implémentation qui ne correspondaient pas au stack effectif (React 19 + TypeScript + Vite + Zustand + Tailwind v4 + Framer Motion) ont été retirées ou adaptées. Ce qui reste est soit du design de jeu indépendant de la technologie, soit des exigences de qualité/plateforme toujours valables. **L'analyse réelle du code prime toujours sur ce document.**

======================================================================

## 1. Contexte produit

Ludopia est destiné à devenir un portail de divertissement comprenant, au-delà du Quiz et de la Géographie déjà en place :

1. Un mode **« Conquête 3x3 »**, jeu tactique de cartes à quatre valeurs (en cours de démarrage).
2. Un mode **« Duel de champions »**, jeu de cartes de combat simplifié.
3. Un mode **« Arène automatique »**, recrutement d'unités puis combat simulé.
4. Un mode **« Forge de deck »**, deck-building avec pioche, défausse, achats et score.
5. Une progression transverse : profil local, expérience, niveau, monnaie, succès, statistiques, collection, quêtes et paramètres.

**Toutes les créations doivent être originales.** Ne pas employer de noms, personnages, logos, illustrations, musiques, textes ou données provenant de Final Fantasy, Triple Triad, Hearthstone, Teamfight Tactics, Dominion, Trivial Pursuit ou d'autres licences. Les mécaniques peuvent appartenir à des genres connus, mais l'expression visuelle, les textes, les noms, les cartes et l'univers doivent être propres au projet. (Note : des assets de licences tierces peuvent servir de gabarits de test strictement locaux et non commités — jamais dans le produit livré.)

Chaque mode a un nom de travail interne qui peut évoluer avant la sortie ; il n'y a pas de nom de code global figé pour le projet — l'application s'appelle **Ludopia**.

======================================================================

## 2. Contraintes non négociables GitHub Pages

Confirmé réel : le déploiement se fait sur GitHub Pages (`vite.config.ts` a un `base` conditionné par la variable d'env `GITHUB_PAGES`, `.github/workflows/deploy.yml` build et publie `dist/`).

- HTML, CSS, JavaScript et fichiers de données statiques uniquement en production.
- Aucun serveur applicatif (Node.js, PHP, Python, base de données serveur) requis à l'exécution — Node/npm ne servent qu'au build.
- Aucun secret dans le dépôt, le code, les workflows ou les fichiers JSON publics.
- Les données locales sont conservées en `localStorage` (Zustand `persist`) ; `IndexedDB` reste une option pour de gros volumes futurs (ex. collection de cartes).
- Les chemins doivent rester relatifs au sous-chemin GitHub Pages (déjà géré par le `base` de Vite).
- L'application doit fonctionner après rechargement direct de la page — géré par le routage en hash (`HashRouter`).
- Le service worker (généré par `vite-plugin-pwa`) doit rester versionné et l'application doit fonctionner si son enregistrement échoue.
- Les appels réseau ne peuvent viser que des ressources publiques et autorisées.
- Le projet doit être exécutable localement avec `npm run dev` / `npm run preview`.

======================================================================

## 3. Principes d'architecture

- Séparation stricte entre interface (composants React), logique métier pure (`src/domain/<mode>/`), données (`src/data/<mode>/`) et persistance (stores Zustand).
- Moteurs de jeux déterministes et testables indépendamment de l'UI.
- Aucune logique métier essentielle directement dans les gestionnaires d'événements React — déléguer aux fonctions pures du domaine (convention déjà en place dans `src/domain/quiz/` et `src/domain/geo/`).
- État partagé minimal et contrôlé, via des stores Zustand par fonctionnalité plutôt qu'un store global unique.
- Schémas de données versionnés, avec identifiants stables et uniques.
- Migrations de sauvegarde explicites lorsque la forme des données change.
- Règles de jeu pures et testables sans navigateur.
- Chargement différé des modules de jeux lorsque c'est pertinent pour la taille du bundle.
- Gestion centralisée des erreurs et affichage utilisateur non bloquant.
- Progressive enhancement : le contenu de base ne doit pas dépendre du service worker.

======================================================================

## 4. Organisation du code

L'arborescence réelle du projet (`src/domain/`, `src/store/`, `src/components/`, `src/routes/`, `src/types/`, `src/data/`) fait référence — pas de structure théorique à dupliquer ici. Pour ajouter un mode, suivre le pattern déjà utilisé par `quiz` et `geo` :

- `src/types/<mode>.types.ts` — tous les types du mode, y compris les types spécifiques (convention centralisée, pas de colocation dans `domain/`).
- `src/domain/<mode>/*.ts` — un fichier par concern, fonctions pures uniquement, `*.test.ts` colocalisés.
- `src/store/<mode>Store.ts` — store Zustand fin, délègue toute la logique au domaine.
- `src/components/<mode>/*.tsx` — composants UI spécifiques au mode.
- `src/routes/<Mode><Purpose>Screen.tsx` — écrans (config → session → résultats), câblés dans `src/App.tsx`.
- `src/data/<mode>/*.json` + `index.ts` — données statiques versionnées.

======================================================================

## 5. App-shell, routage et navigation

Exigences (déjà globalement satisfaites par `HashRouter` + `ScreenTransition`/`ScreenHeader`, à vérifier pour chaque nouvel écran) :

- Router en hash, sans dépendance à une réécriture serveur.
- Gestion propre d'une route inconnue.
- Restauration du focus sur le titre principal après navigation.
- Mise à jour de `document.title` par écran.
- Support des boutons précédent/suivant du navigateur.
- Nettoyage des abonnements/écouteurs de l'écran précédent en quittant (`useEffect` cleanup).

L'app-shell contient : en-tête avec identité visuelle, navigation principale, zone de statut profil/niveau/XP/monnaie, zone principale, pile de notifications, pied de page, indicateur facultatif de disponibilité hors ligne.

======================================================================

## 6. Modèle d'état et persistance

L'état n'est pas un blob JSON unique mais réparti en stores Zustand par fonctionnalité (`quizStore`, `geoStore`, `profileStore`, et bientôt `conquestStore`, etc.), chacun avec son propre middleware `persist`. Les règles suivantes s'appliquent à chaque store :

- Toutes les écritures passent par les actions du store (jamais de mutation directe ailleurs).
- Détecter JSON invalide, quota dépassé et stockage indisponible.
- Prévoir un export/import de sauvegarde JSON, avec validation avant remplacement des données actives.
- Ajouter un `schemaVersion` et des migrations séquentielles dès qu'une forme de données change de façon incompatible.
- Ne jamais stocker de mot de passe, jeton, secret ou donnée sensible.
- Pour un état de partie en cours (ex. plateau de Conquête), préférer `partialize` pour ne persister que l'historique/les résultats et non l'état transitoire de la partie — évite qu'un plateau à moitié joué reste bloqué en `localStorage`.

======================================================================

## 7. Système de données

Tous les contenus éditoriaux (questions, cartes, unités, succès, récompenses, niveaux) sont séparés du code, en JSON sous `src/data/<mode>/`. Chaque objet doit posséder :

- `id` stable et unique (convention observée : `{code}-{segment}-{NNN}`).
- Nom et description.
- Tags si pertinent.
- Rareté ou difficulté lorsqu'utile.
- État actif/inactif.
- Référence d'asset relative.
- Valeurs numériques bornées et validées.

Chaque banque de données a un script de validation autonome sous `scripts/` (modèle : `scripts/validate-questions.mjs`, lancé via `npm run validate:questions`) **et** une suite Vitest équivalente colocalisée (modèle : `src/data/questions/questions.test.ts`) — le script sert de garde-fou rapide en CI sans build complet, le test tourne avec `npm test`. Les deux vérifient : JSON syntaxiquement valide, identifiants uniques, format d'ID respecté, champs requis non vides, valeurs dans les bornes, absence de quasi-doublons.

======================================================================

## 8. Principes transverses hérités du Quiz

Le Quiz existant est déjà une implémentation React propre (pas de migration nécessaire), mais ses principes de conception restent la référence pour tout nouveau mode :

- Chaque session de jeu retourne un résultat normalisé (`<Mode>SessionResult` : score, XP gagné, monnaie gagnée, durée, date de fin, stats).
- Un seul point d'autorité (ex. futur `economy-service` ou logique équivalente dans le store) crédite XP et monnaie, pour éviter tout double crédit en cas de rechargement ou double clic.

======================================================================

## 9. Jeu 1 : Conquête 3x3

*(En cours d'implémentation — voir le plan d'implémentation du moteur pur dans l'historique du projet.)*

Concept : chaque joueur possède une main de cartes. Une carte contient quatre valeurs : nord, est, sud, ouest. Les joueurs posent alternativement une carte sur une case libre d'un plateau 3x3. Une carte adverse adjacente est capturée si la valeur tournée vers elle est strictement supérieure à la valeur opposée.

État minimal : plateau de 9 cases, main de chaque joueur, joueur actif, historique des coups, seed/aléatoire du tirage, état de fin.

Opérations pures attendues (noms illustratifs — l'implémentation réelle suit les conventions `src/domain/conquest/*.ts`) : construction de l'état initial, liste des coups légaux, application d'un coup, résolution des captures, évaluation d'un état pour une perspective donnée, détection de fin de partie, calcul du résultat.

IA par paliers :
- **Facile** : coup légal aléatoire avec légère préférence de capture.
- **Moyen** : score heuristique sur capture, exposition des côtés faibles, coins, bords et contrôle.
- **Difficile** : minimax à profondeur limitée avec alpha-bêta.
- **Expert** : recherche plus profonde, table de transposition et budget de nœuds/temps, sans bloquer l'interface (Web Worker si la latence devient perceptible).

Variantes futures, derrière des feature flags, **non activées dans le MVP** : égalité (Same), somme (Plus), combo (réaction en chaîne), éléments, plateau variable.

======================================================================

## 10. Jeu 2 : Duel de champions

Concept : deux adversaires possèdent des points de vie, un deck, une main et une ressource croissante. Les cartes peuvent être des unités, actions ou soutiens. Le MVP doit rester volontairement limité.

Pipeline d'un tour : début de tour → augmentation/recharge de ressource → pioche → actions du joueur actif → résolution des effets dans un ordre déterministe → vérification de fin → fin de tour.

Modèle d'effet déclaratif, sans exécuter du code JavaScript provenant des fichiers JSON :

```json
{ "type": "damage", "target": "enemyHero", "value": 3 }
```

Types MVP suggérés : `damage`, `heal`, `draw`, `gainArmor`, `summon`, `buffAttack`, `buffHealth`.

Le résolveur d'effets doit : valider l'effet, déterminer les cibles légales, appliquer l'effet de façon immuable ou avec mutations strictement contrôlées, produire un journal d'événements, vérifier les conditions de victoire.

IA : Facile (carte jouable aléatoire), Normal (maximise valeur immédiate selon coût/dégâts/soins/présence plateau), Difficile (évalue plusieurs séquences d'actions du tour). Pas de réseau de neurones ni de dépendance cloud.

======================================================================

## 11. Jeu 3 : Arène automatique

Concept : le joueur recrute des unités avec un budget, prépare une formation, puis le combat se déroule automatiquement.

Phases : préparation → boutique → placement → verrouillage de l'équipe → combat → résultat → récompense.

Une unité inclut : id, coût, points de vie, attaque, vitesse, portée, priorité de ciblage, traits, compétence facultative, asset.

Le moteur de combat doit être déterministe : timeline/ticks, initiative fondée sur la vitesse, ciblage explicite, dégâts et élimination, événements de combat, nombre maximal de ticks pour empêcher une boucle infinie, résolution d'égalité documentée. Ne jamais baser la simulation sur des délais CSS ou `setTimeout` — le moteur produit des événements, la vue les rejoue visuellement.

IA de préparation : archétypes agressif, équilibré, défensif, synergie. Le combat suit les règles, pas une triche cachée.

======================================================================

## 12. Jeu 4 : Forge de deck

Concept : le joueur commence avec un deck faible, joue une main, génère des ressources, achète de meilleures cartes, alimente la défausse puis remélange.

Zones : deck, main, défausse, zone jouée, marché, cartes bannies/épuisées si activé.

Cycle : piocher jusqu'à la taille de main → jouer des cartes → calculer ressources et effets → acheter → défausser main et cartes jouées → remélanger quand le deck est vide → vérifier les objectifs.

Effets déclaratifs suggérés : `gainResource`, `gainScore`, `draw`, `discard`, `trash`, `discount`, `comboTag`.

Scénarios : score cible, nombre de tours limité, adversaire virtuel ou boss à contrainte. Le MVP peut fonctionner avec un objectif solo ; une IA pilotant un marché concurrent est une version ultérieure.

======================================================================

## 13. Méta-progression et économie

Composants : XP et niveau, monnaie non achetable, collection, succès, quêtes quotidiennes et permanentes, statistiques, cosmétiques, déblocage progressif des difficultés.

Règles :
- Toutes les récompenses sont calculées par un point d'autorité unique par mode (cf. section 8).
- Utiliser des identifiants de transaction pour éviter le double crédit.
- Limiter les récompenses répétables si nécessaire.
- Aucune microtransaction, aucun mécanisme de hasard payant.
- Aucune date locale ne doit être utilisée naïvement pour sécuriser une récompense quotidienne — l'utilisateur contrôle son navigateur.
- Accepter que, sans backend, un joueur puisse modifier ses données locales ; ne jamais présenter la progression locale comme sécurisée ou compétitive.
- Éviter le pay-to-win interne entre modes.

======================================================================

## 14. Interface, design system et responsive

Utiliser les tokens Tailwind / variables CSS déjà en place plutôt que des valeurs magiques.

Exigences :
- Mobile-first, largeur tactile suffisante.
- Plateau 3x3 (Conquête) utilisable sur petit écran.
- Navigation clavier complète, focus visible, contraste lisible.
- États hover, focus, active, disabled, selected.
- Aucune information transmise uniquement par la couleur.
- Animations compatibles `prefers-reduced-motion`.
- Textes redimensionnables.
- Modales avec piégeage du focus et fermeture Escape.
- Annonces `aria-live` pour les résultats importants.
- Labels accessibles pour cartes, cases et statistiques.

======================================================================

## 15. Audio et assets

- Les sons sont facultatifs et désactivables ; jamais d'audio avant une interaction utilisateur.
- Charger les assets à la demande, prévoir un fallback si l'asset manque.
- Optimiser les images (WebP/AVIF avec fallback si nécessaire), SVG pour icônes/logo simples.
- Documenter l'origine et la licence de chaque asset dans `docs/legal-assets.md`.
- **Ne jamais importer un asset trouvé sur Internet sans licence compatible et attribution requise.** Des visuels de licences tierces peuvent servir de gabarit de test strictement local (non commité, jamais référencé depuis `src/`) pendant la conception d'un mode, mais doivent être remplacés par des créations originales avant toute livraison.

======================================================================

## 16. PWA et hors ligne

Géré via `vite-plugin-pwa` plutôt qu'un service worker écrit à la main — les exigences de comportement restent les mêmes :

- Cache de l'app-shell versionné, suppression des anciens caches à l'activation.
- Ne pas mettre en cache aveuglément des réponses en erreur.
- Prévoir un bouton de rafraîchissement quand du nouveau contenu est disponible.
- Tester installation, mise à jour, fonctionnement hors ligne et récupération après cache corrompu.
- Conserver un numéro de version visible dans les paramètres.

======================================================================

## 17. Sécurité et robustesse

- React échappe déjà le contenu par défaut — ne jamais utiliser `dangerouslySetInnerHTML` avec des données non fiables.
- Valider toutes les données chargées et importées.
- Ne jamais utiliser `eval`, `new Function` ou du code exécutable dans les JSON.
- Limiter la taille des imports, refuser les types de fichiers inattendus, révoquer les `ObjectURL`.
- Éviter les dépendances externes inutiles ; envisager hébergement local + intégrité SRI pour les dépendances CDN.
- Ne pas promettre de protection anti-triche : toutes les données et règles sont accessibles côté client.
- Journaliser proprement les erreurs sans afficher de données internes inutiles.

======================================================================

## 18. Performance

- Chargement différé des modes/écrans volumineux.
- Calcul IA lourd dans un Web Worker lorsque justifié, avec budget de recherche strict.
- Nettoyage des timers, listeners et workers à la sortie d'un écran (`useEffect` cleanup).
- Pas d'animation pilotée par une boucle JavaScript permanente quand CSS/Framer Motion suffit.
- Mesurer avec les outils du navigateur avant d'annoncer un gain de performance.

======================================================================

## 19. Tests et qualité

Les règles de jeu sont testées séparément de l'interface, avec Vitest (`npm test`) — déjà en place.

Priorités par domaine :

**Core** : lecture/écriture sauvegarde, migration, import invalide, idempotence des récompenses.

**Quiz** : validation d'une réponse, mélange conservant la bonne réponse, calcul du score, absence de répétition immédiate.

**Conquête** : coups légaux, capture dans les quatre directions, absence de capture au travers d'un bord, fin de partie, l'IA ne retourne qu'un coup légal.

**Duel** : coût de carte, ordre des effets, cibles, victoire, taille maximale de main.

**Arène** : initiative, ciblage, élimination, limite de ticks, résultat reproductible.

**Forge** : pioche, défausse, remélange, achat, effets, fin de scénario.

======================================================================

## 20. GitHub Actions et déploiement

Déjà en place dans `.github/workflows/deploy.yml` : `lint` → `test` → `validate:questions` → `build` → déploiement GitHub Pages. Étendre ce pipeline avec les scripts de validation propres à chaque nouveau mode (ex. `validate:cards`) au fur et à mesure.

Le README doit documenter : prérequis, lancement local, structure, ajout d'une question/carte/unité, lancement des tests, publication, limites de la sauvegarde locale, politique de droits sur les assets.

======================================================================

## 21. Feuille de route

Les phases suivantes correspondent au plan de migration initial. **Les phases 0 à 3 sont déjà accomplies** par l'implémentation React actuelle (app-shell, routage, Quiz, Géographie, stores par fonctionnalité) :

- ~~Phase 0 — Audit~~
- ~~Phase 1 — Stabilisation~~
- ~~Phase 2 — App shell~~
- ~~Phase 3 — Méta-progression de base~~

Phases actives :

- **Phase 4 — Conquête 3x3** : moteur pur (`src/domain/conquest/`) → interface → 2 puis 4 niveaux d'IA → tests → cartes originales et équilibrage.
- **Phase 5 — Forge de deck** : moteur de zones, marché, effets déclaratifs, scénario solo, tests.
- **Phase 6 — Duel** : moteur de tours, résolveur d'effets, IA, decks JSON, tests.
- **Phase 7 — Arène automatique** : recrutement, formation, moteur déterministe, relecture visuelle des événements, tests.
- **Phase 8 — Finition** : accessibilité, responsive, PWA, optimisation des assets, documentation, validation CI.

Chaque phase doit produire un état déployable et fonctionnel ; pas de réécriture totale en une seule fois.

======================================================================

## 22. Definition of Done globale

Une fonctionnalité est terminée lorsque :

- elle fonctionne sous le sous-chemin GitHub Pages du dépôt ;
- elle n'introduit aucune erreur console dans le parcours nominal ;
- elle possède des états chargement, vide, erreur et succès si pertinents ;
- elle est utilisable au clavier et sur écran mobile ;
- sa logique métier est testée ;
- ses données sont validées ;
- sa sauvegarde résiste à un rechargement ;
- ses listeners, workers et timers sont nettoyés ;
- ses textes sont en français correct ;
- ses assets sont originaux ou correctement licenciés ;
- sa documentation est mise à jour.

======================================================================

## 23. Notes d'adaptation

Ce document décrit l'architecture cible la plus complète compatible avec un hébergement statique GitHub Pages. Il ne garantit pas que le dépôt utilise déjà telle ou telle organisation précise — l'analyse réelle du code prime toujours sur ces principes.

Les fonctions nécessitant une autorité serveur ne peuvent pas être sécurisées avec GitHub Pages seul : comptes partagés, synchronisation multi-appareils, classement mondial anti-fraude, multijoueur temps réel, secrets d'API, modération centralisée et économie compétitive. Elles doivent rester hors périmètre ou être traitées plus tard avec un service externe correctement conçu.
