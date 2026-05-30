# Stratégie de tests — Guide universel par phase
# Charger ce fichier pour les tâches de tests, QA, ou avant déploiement
# Valable pour tous les projets — adapter selon la phase actuelle

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## RÈGLE ABSOLUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ne jamais déployer sans tests verts :
  npm run test && npx playwright test && npm run build

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PHASE MVP (lancement initial)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Unitaires (Vitest) :
  Fonctions utilitaires critiques — transformations, calculs, formatage
  Hooks custom — comportement isolé, états, effets
  Appels externes mockés (fetch, Supabase, Stripe)
  Coverage minimum : 70% sur les fonctions critiques (pas le CSS ou les constantes)

Intégration backend (pytest) :
  Chaque endpoint testé : 200 + cas d'erreur (400, 401, 403, 404, 500)
  Isolation multi-tenant : user A ne voit jamais les données de user B
  Base de données de test séparée (projet Supabase dédié aux tests, jamais la prod)

E2E (Playwright) :
  Flux 1 : inscription → connexion → action principale → déconnexion
  Flux 2 : paiement complet si Stripe (mode test uniquement)
  Flux 3 : fonctionnalité principale du produit (upload, traitement, résultat)
  Navigateurs : Chrome + Firefox minimum

Sécurité (avant chaque déploiement) :
  Endpoints protégés retournent 401 sans JWT valide
  Isolation RLS : user A ne voit pas les données de user B (2 comptes de test)
  Inputs malveillants bloqués : XSS, SQL injection, path traversal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PHASE BETA (premiers vrais utilisateurs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tout ce qui précède +

Performance (Lighthouse CI) :
  Score minimum : Performance > 80 · Accessibility > 90 · SEO > 90
  LCP < 2.5s · FID < 100ms · CLS < 0.1
  Lancer : npx lighthouse-ci autorun

Accessibilité (axe-core intégré Playwright) :
  Contraste couleurs WCAG AA minimum
  Navigation clavier complète (Tab, Enter, Escape)
  Attributs aria présents sur composants interactifs
  Tests lecteur d'écran sur les flows principaux

Charge légère (k6) :
  Simuler 50 utilisateurs simultanés sur l'endpoint principal
  Seuil : P95 < 500ms · taux d'erreur < 1%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PHASE PRODUCTION (SaaS avec revenus)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tout ce qui précède +

Régression visuelle (Chromatic ou Percy) :
  Snapshots des composants clés — détection automatique des régressions UI
  Intégré dans le pipeline CI — bloque le merge si régression détectée

Tests de charge (k6 ou Locust) :
  Simuler pic de trafic réel (500-1000 utilisateurs simultanés)
  Tester les limites de rate limiting et de quota

Mutation testing (Stryker) :
  Valider que les tests détectent vraiment les bugs
  Mutation score > 60% sur le code critique

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## DONNÉES DE TEST — STRATÉGIE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fixtures statiques   : données figées pour les tests unitaires (JSON, fichiers)
Factories            : génération dynamique pour les tests d'intégration (faker.js)
Seeds de base        : jeu de données minimal reproductible pour l'environnement de test
Jamais utiliser      : données de production dans les tests, même anonymisées partiellement

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## COMMANDES DE RÉFÉRENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

npm run test                    → Vitest (unitaires)
npm run test:coverage           → Vitest avec rapport de couverture
npx playwright test             → E2E tous les navigateurs
npx playwright test --ui        → mode interactif (debug)
npx playwright codegen          → enregistrer un nouveau test manuellement
pytest backend/tests/           → intégration Python
npx lighthouse-ci autorun       → audit performance (beta+)
k6 run tests/load/main.js       → test de charge (production)
