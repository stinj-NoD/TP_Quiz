---
name: generer-questions
description: Génère de nouvelles questions de Trivial Pursuit pour TrivialPoursuit et les ajoute aux banques existantes, en respectant le segment d'âge (enfant/ado/adulte) et la catégorie demandés. Use when asked to add game questions, generate trivia content, or grow a question bank for a given age segment/category.
---

Cette skill orchestre la génération de nouvelles questions pour TrivialPoursuit
en délégant l'écriture éditoriale aux sous-agents dédiés par segment d'âge
(`.claude/agents/contenu-enfant.md`, `contenu-ado.md`, `contenu-adulte.md`),
puis valide et intègre le résultat dans
`src/data/questions/{ageLevel}/{category}.json`.

Toutes les commandes ci-dessous s'exécutent depuis la racine du dépôt.

## Entrée attendue

L'utilisateur précise, explicitement ou implicitement :
- **segment(s)** : `enfant`, `ado`, `adulte`, ou plusieurs/tous
- **catégorie(s)** : une ou plusieurs parmi `geographie`, `divertissement`,
  `histoire`, `art-litterature`, `sciences-nature`, `sport-loisirs`
- **nombre de questions** par couple segment × catégorie (par défaut : 5 si
  non précisé, pour rester un lot de test raisonnable)

Si l'utilisateur ne précise ni segment ni catégorie, demande-lui de préciser
plutôt que de générer pour les 18 combinaisons d'un coup.

## Déroulé

1. **Pour chaque couple (segment, catégorie) demandé** :
   - Invoque le sous-agent correspondant au segment
     (`contenu-enfant` / `contenu-ado` / `contenu-adulte`) via l'outil Agent,
     en lui donnant la catégorie et le nombre de questions à générer.
   - L'agent lit lui-même le fichier JSON existant pour connaître le dernier
     ID utilisé et éviter les doublons de sujet — il renvoie uniquement un
     tableau JSON des nouvelles questions (bloc ```json), sans toucher au
     disque.

2. **Fusionne** les nouvelles questions renvoyées par l'agent dans le fichier
   `src/data/questions/{ageLevel}/{category}.json` correspondant (ajout en
   fin de tableau, sans toucher aux entrées existantes).

3. **Valide** immédiatement après chaque écriture :
   ```bash
   node scripts/validate-questions.mjs
   ```
   Si la validation échoue (ID en collision, doublon détecté, anglais
   résiduel, schéma invalide), corrige l'entrée fautive ou redemande à
   l'agent une reformulation avant de considérer la tâche terminée. Ne laisse
   jamais le dépôt dans un état où `validate-questions.mjs` échoue.

   Vérifie aussi que chaque nouvelle entrée a bien un champ `difficulty`
   rempli (`facile`, `moyen` ou `difficile`) — les sous-agents doivent le
   fournir systématiquement ; si une entrée en est dépourvue, redemande-la
   plutôt que de la fusionner telle quelle.

4. **Résume** à l'utilisateur : combien de questions ont été ajoutées, dans
   quels fichiers, et le résultat de la validation.

## Exemple d'invocation

> "Génère 5 questions de sciences-nature pour les ados"

→ un seul appel à l'agent `contenu-ado` avec `category: sciences-nature`,
`count: 5` ; fusion dans `src/data/questions/ado/sciences-nature.json` ;
validation ; résumé.

> "Ajoute du contenu pour toutes les catégories, segment adulte, 10 questions
> chacune"

→ 6 appels à l'agent `contenu-adulte` (un par catégorie), fusion dans les 6
fichiers `src/data/questions/adulte/*.json`, validation globale, résumé.

## Après génération

Pour rejouer et vérifier que les nouvelles questions apparaissent bien en
jeu, utilise la skill `run-trivialpoursuit` (lancer le serveur de dev, faire
une partie sur la catégorie concernée).
