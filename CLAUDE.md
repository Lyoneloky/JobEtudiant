# TerraBio — CLAUDE.md | Web Classique | v1.1 | 2026-04-06

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🎯 IDENTITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Nom        : TerraBio
  Type       : Plateforme web personnalisée
  Description: Plateforme intelligente d'aide à l'utilisation responsable des
               plantes médicinales du Cameroun. Catalogue, recherche par symptôme,
               carte interactive, consultation personnalisée, espace admin.
  LLM        : Claude Sonnet (via Claude Code)
  Backend    : Supabase (PostgreSQL managé + Auth GoTrue + RLS + REST auto)
  Frontend   : Next.js 16.2.6 (App Router, Turbopack) + TypeScript 5 + Tailwind CSS 4
  Déploiement: [non défini — MVP pour soutenance]
  Équipe     : Solo — NOAH MEKONGO Barnabé Lionel (IAI-Cameroun)

  Stack complète :
    Carte       : Leaflet 1.9.4 + react-leaflet 5.0.0
    Icônes      : lucide-react 1.16.0
    Supabase SDK: @supabase/ssr 0.10.3 + @supabase/supabase-js 2.106.0
    Node.js     : v24.14.0

  Charte graphique :
    Vert nature  #22c55e · Vert sombre #166534 · Vert clair #dcfce7
    Beige doux   #F1EFE6 · Bleu info  #2196F3 · Gris texte #616161
    Fond général #F8FAF5 · Blanc #FFFFFF · Bordures #E8EDE4
    Titres : Poppins · Corps : Inter / Arial

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🧠 ROUTING DES MODÈLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modèle par défaut : Sonnet. Démarrer toute tâche avec Sonnet.
Ne pas tenter d'évaluer la complexité avant de commencer.

Haiku si la tâche est clairement triviale :
  Lire/expliquer un fichier · Corriger typo ou import
  Reformater du code · Script < 30 lignes · Question syntaxe

Opus uniquement si :
  Sonnet a échoué 2 fois sur la même tâche
  OU l'utilisateur demande explicitement une conception d'architecture globale

Si Sonnet échoue 2 fois → STOPPER :
  "⬆️ 2 tentatives Sonnet échouées. Tâche nécessite Opus.
   Raison : [précise]. Taper /model opus avant de continuer."

Si modèle actif trop puissant pour une tâche triviale → suggérer UNE FOIS :
  "💡 Tâche triviale détectée. Haiku suffirait (/model haiku)."
  Ne jamais répéter dans la même session.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📋 PLAN DE TRAVAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Obligatoire avant toute tâche modifiant > 1 fichier ou durant > 2 min.

## PLAN — [tâche]
Modèle : [Haiku/Sonnet/Opus] | Fichiers secondaires à charger : [aucun/security/stack/tests/api/auth/checklist/data/headers/ops/rgpd/HISTORY/system-contrat]
Fichiers : [fichier] → [modification]
Étapes : 1. ... 2. ... 3. [test validation]
Risques : [risque → mitigation]
⏸️ EN ATTENTE — "ok" pour lancer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔀 GESTION DE VERSIONS GIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RÈGLE ABSOLUE : Ne jamais committer sans permission explicite de l'utilisateur.

Quand committer (fin de concept ou ajout d'une fonctionnalité) :
  1. Annoncer : "✅ [Nom du concept ou de la fonctionnalité] terminé. Voulez-vous que je versionne dans Git ?"
  2. Attendre "oui" ou "ok" avant tout git commit
  3. Si refus ou silence → ne pas committer, continuer le travail jusqu'à une nouvelle fonctionnalité implémentée ainsi de suite

Message de commit — format obligatoire :
  feat: [description courte en français]
  
  - [changement 1]
  - [changement 2]
  - [changement 3]

Branches — stratégie simple MVP :
  main       → version stable (après validation utilisateur)
  Pas de branches feature pour le MVP solo

Commandes de référence :
  git init && git add . && git commit -m "feat: ..."   ← premier commit
  git add -A && git commit -m "feat: ..."              ← commit suivant
  git log --oneline                                    ← historique
  git checkout [hash]                                  ← revenir à une version
  git diff HEAD                                        ← voir les changements

Ce qui déclenche une demande de commit :
  ✓ Feature complète (ex : Bibliothèque, Dark mode, Animations, fonctionnalité)
  ✓ Correction de bug critique
  ✓ Refactor majeur d'architecture
  ✗ PAS pour : corrections de typos, ajustements CSS mineurs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ⚡ COMMANDES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

npm run dev                                             ← démarrer le serveur (racine du projet)
.\node_modules\.bin\tsc --noEmit                       ← vérifier TypeScript
npm run build                                          ← build de production
npm audit --audit-level=high                           ← audit sécurité

# Vérifier .env.local avant tout
Test-Path .env.local                                   ← PowerShell — doit retourner True

# Supabase — étapes connexion
# 1. Créer projet sur supabase.com
# 2. Settings → API → copier URL + anon key dans .env.local
# 3. SQL Editor → coller supabase/schema.sql → Run

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📊 CONTEXTE ET FICHIERS SECONDAIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Seuils contexte :
  70% → signaler à l'utilisateur (il tapera /compact)
  90% → signaler à l'utilisateur (il tapera /clear)
  Après /clear : "claude" puis "reprends où tu t'es arrêté"

Fichiers secondaires — charger selon la tâche :
  Auth, JWT, sessions, MFA, OAuth, rôles, mots de passe → lire .claude/security/auth.md
  Endpoints, CORS, validation, rate limiting, API keys  → lire .claude/security/api.md
  Chiffrement, uploads, RLS, stockage, données sensibles → lire .claude/security/data.md
  Headers HTTP, CSP, cookies, next.config.js            → lire .claude/security/headers.md
  RGPD, cookies consentement, droits utilisateurs       → lire .claude/security/rgpd.md
  Déploiement, CI/CD, monitoring, incidents, logs       → lire .claude/security/ops.md
  Avant commit majeur ou déploiement                    → lire .claude/security/checklist.md
  Stack ou architecture                                 → lire .claude/stack.md
  Tests                                                 → lire .claude/tests.md
  UI/UX (nouveau composant, interface, design, page)    → lire .claude/skills.md
  Configuration environnement (MCP, skills, hooks)      → lire .claude/skills.md
  Base de données (schéma, RLS, migration, Supabase)    → lire .claude/skills.md
  Tâche courante (feature, debug)                       → ne rien charger de plus

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🚫 INTERDIT (résumé rapide)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Clé API exposée côté frontend · dangerouslySetInnerHTML
  Endpoint sans JWT · Déploiement sans tests verts
  LLM substitué sans mise à jour de ce fichier
  Détails complets → .claude/security

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🔄 MISE À JOUR DE L'ÉTAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTION : Après chaque tâche terminée, mettre à jour
la section ÉTAT ci-dessous silencieusement.
Juste "✓ état mis à jour" en fin de réponse.

LIMITE : maximum 3 entrées d'état. Quand une 4ème est ajoutée :
  1. Copier l'entrée la plus ancienne dans .claude/HISTORY.md
  2. La supprimer ici
  3. Ajouter la nouvelle entrée en haut

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📍 ÉTAT — 3 ENTRÉES MAX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ENTRÉE 1 — 2026-06-26] ← SESSION LA PLUS RÉCENTE
✅ Dashboard herboriste + gestion des demandes d'inscription :
• dashboard/page.tsx : HerboristeDashboard = même layout que AdminDashboard (sidebar, stats, consultations récentes, quick actions, catalogue) SANS "Utilisateurs"
• dashboard/page.tsx : Sidebar refactorisée — prop role ('admin'|'herboriste'|'user') au lieu de isAdmin booléen → badge correct par rôle
• dashboard/page.tsx : fetch herboriste = stats (pendingCons/totalCons filtrés par herboriste_id, plants, glossary) + recentCons + plants
• admin/utilisateurs/page.tsx : section "Demandes en attente" (herboriste_applications status=en_attente) avec boutons Approuver/Rejeter
• admin/utilisateurs/HerboristeApplicationRow.tsx : client component approve/reject avec feedback inline
• actions.ts : approveHerboristeApplication force role='herboriste' + display_name + approved=true (trigger live ne lit pas user_metadata)
• actions.ts : submitConsultation sauvegarde herboriste_id
• consultation/page.tsx : 2 étapes — sélection herboriste → formulaire
• DB live : herboriste_applications créée + 4 policies RLS ; consultations_herboriste SELECT+UPDATE policies ; profiles.approved ajoutée ; consultations.herboriste_id ajoutée
• Fix live : profil herbo@terrabio.cm corrigé (role=herboriste, display_name=herbo1)

[ENTRÉE 2 — 2026-06-26]
✅ Consultation personnalisée — sélection herboriste + redirections rôle :
• DB : profiles.approved, consultations.herboriste_id, policy profiles_read_herboristes
• login/callback/register/proxy : redirect selon role (user→/plantes, admin/herboriste→/dashboard)
• Navbar : onglet actif coloré (pill verte)
• Page d'accueil bloquée aux utilisateurs authentifiés

[ENTRÉE 3 — RESTE À FAIRE]
1. PRIORITÉ MOYENNE — Upload images plantes :
   image_url = NULL pour toutes les 18 plantes → configurer Supabase Storage bucket "plants"
   + champ upload dans /admin/plantes/PlantForm.tsx
2. PRIORITÉ BASSE — Tests : 0% couverture (Vitest/Playwright non configurés)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🏛️ DÉCISIONS PERMANENTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(Architecture et choix irréversibles — jamais supprimé, mis à jour si nécessaire)

- Supabase remplace Node.js+Express (même schéma PostgreSQL, Auth + RLS intégrés, moins de code)
- Inline styles préférés aux classes Tailwind pour précision pixel-perfect (valeurs exactes du rapport)
- Server Actions Next.js au lieu d'API Routes (type-safe, pas d'endpoint HTTP à maintenir)
- proxy.ts au lieu de middleware.ts (breaking change Next.js 16 — export nommé "proxy")
- Fallback statique sur toutes les pages DB (app fonctionnelle sans Supabase pour la démo)
- Next.js 16 breaking changes : searchParams et params sont des Promise<{}> à await ; cookies() est async
- Carte Leaflet : import dynamique uniquement (ssr:false) + CSS via CDN CloudFlare dans globals.css
- Données démo : 10 plantes camerounaises authentiques pour contexte soutenance
- /admin/utilisateurs : données mock (service_role key jamais exposée côté client)
