# Skills & MCP — Directives d'utilisation
# Charger ce fichier pour les tâches d'architecture, configuration, UI/UX, ou base de données.
# Mis à jour : 2026-04-07

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔌 MCP SERVERS ACTIFS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tous ces serveurs sont installés globalement (--scope user) — disponibles dans tous les projets.

### shadcn/ui MCP
Quand l'utiliser : Dès qu'on ajoute ou cherche un composant shadcn/ui.
Directive       : Toujours vérifier via ce MCP qu'un composant existe et récupérer
                  la bonne commande d'installation avant de coder quoi que ce soit.
Ne pas         : Supposer qu'un composant shadcn existe de mémoire — toujours vérifier.

### Context7 MCP
Quand l'utiliser : Toujours. Pour toute utilisation d'une API Next.js, React,
                   Tailwind, Framer Motion, FastAPI ou n'importe quelle librairie.
Directive       : Consulter Context7 avant d'utiliser une API récente ou peu connue.
                  Priorité sur ma mémoire d'entraînement — la doc officielle prime.
Ne pas         : Utiliser une API de mémoire sans vérifier qu'elle existe
                  dans la version installée dans le projet.

### Magic MCP (21st.dev)
Quand l'utiliser : Création d'un nouveau composant UI from scratch —
                   landing page, hero, card élaborée, modal animée, dashboard,
                   composant visuel complexe, interface, design d'une nouvelle page.
Directive       : Proposer Magic en priorité quand l'utilisateur demande un nouveau
                  composant visuel — plus rapide que partir de zéro.
Ne pas         : Utiliser pour modifier un composant existant — uniquement pour
                  la création initiale.

### Playwright MCP
Quand l'utiliser : Tests end-to-end, validation visuelle d'une feature, debug
                   d'un comportement difficile à reproduire manuellement.
Directive       : Utiliser pour tester upload de fichier, flows d'analyse,
                  navigation entre pages, états d'erreur, formulaires complexes.
Ne pas         : Lancer en développement continu — uniquement pour valider
                  une feature terminée.

### Vercel MCP
Quand l'utiliser : Déploiement, debug d'un build qui échoue, consultation
                   des logs de production, vérification des variables d'env.
Directive       : Consulter les logs Vercel directement avant de demander
                  à l'utilisateur de les copier-coller.
Ne pas         : Utiliser en développement local — uniquement pour la production.

### Supabase MCP
Quand l'utiliser : Toute tâche impliquant la base de données — schéma, migrations,
                   RLS policies, requêtes SQL, Storage, Auth configuration,
                   debug d'une query lente, vérification des données en production.
Directive       : Utiliser pour inspecter directement les tables et policies avant
                  de proposer du code — évite les erreurs de schéma.
                  Préférer les migrations SQL via ce MCP plutôt que l'UI Supabase.
Ne pas         : Modifier des données de production sans confirmation explicite.
                  Jamais DROP TABLE ou DELETE sans WHERE précis et confirmation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ⚡ SKILLS CLAUDE CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### /simplify
Quand l'utiliser : Après chaque feature qui modifie >1 fichier frontend.
Directive       : Lancer AVANT de proposer un commit. Obligatoire.
Ne pas         : Sauter cette étape même si le code semble propre.

### /update-config
Quand l'utiliser : Quand l'utilisateur veut automatiser un comportement répétitif
                   (hooks, permissions, variables d'env, MCP servers).
Directive       : Proposer proactivement si un comportement revient souvent
                  dans la session (ex : vérifier les types TS après chaque modif).

### /loop
Quand l'utiliser : Surveillance pendant un déploiement ou un test long.
Directive       : Utiliser uniquement sur demande explicite.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📋 DÉCISION — QUEL MCP POUR QUELLE TÂCHE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Ajoute un bouton"              → shadcn/ui MCP (vérifier si Button existe)
"Crée une nouvelle page"        → Magic MCP (UI from scratch)
"Comment utilise-t-on X ?"     → Context7 MCP (doc officielle)
"Déploie / regarde les logs"    → Vercel MCP
"Bug en prod / variables manq." → Vercel MCP
"Schéma BDD / RLS / migration"  → Supabase MCP
"Tester le flow d'upload"       → Playwright MCP
"Automatiser un comportement"   → /update-config skill
