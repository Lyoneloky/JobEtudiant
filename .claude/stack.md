# Stack technique — Guide de décision universel
# Charger ce fichier pour les tâches d'architecture, choix de stack, ou déploiement
# Valable pour tous les projets — adapter selon le contexte spécifique du projet

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## FRONTEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Framework     : Next.js App Router — toujours la version latest stable
TypeScript    : strict mode obligatoire
CSS           : Tailwind CSS uniquement · jamais de CSS-in-JS ni de modules CSS
Composants    : Shadcn/ui comme base · Lucide React pour les icônes
Animations    : Framer Motion (complexe) · Tailwind transitions (simple)
Formulaires   : React Hook Form + Zod (validation unifiée front/back)
Images        : next/image uniquement — jamais de balise <img> brute
Fonts         : next/font uniquement — jamais de Google Fonts en CDN
Dark mode     : next-themes + ThemeProvider dans le layout racine
PDF           : react-pdf + pdfjs-dist (viewer) · pdfplumber côté backend (extraction)
Markdown      : react-markdown + remark-gfm pour le rendu enrichi (tables, gras, etc.)

État global :
  Module variables simples → MVP, appli sans routing complexe entre pages
  Zustand                  → si état partagé entre 3+ composants non-liés, ou actions complexes
  Jamais Redux             — trop verbeux pour nos cas d'usage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BACKEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Logique simple  → Next.js API Routes (TypeScript, même repo)
Logique complexe → FastAPI Python 3.11 async + Pydantic v2 (repo séparé)

Règle absolue : un seul backend par endpoint — jamais les deux simultanément.
LLM           : toujours côté backend uniquement — jamais exposé au frontend.
LLM à utiliser : défini dans CLAUDE.md section Identité de chaque projet.
Changer de LLM = mettre à jour CLAUDE.md Identité + Décisions permanentes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## BASE DE DONNÉES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Supabase      → choix par défaut (PostgreSQL + Auth + RLS + Storage + Realtime)
PlanetScale   → si MySQL imposé par contrainte client ou legacy
MongoDB Atlas → si données non-relationnelles dominantes (rare)
Pas de BDD    → si MVP stateless (localStorage + fichiers uniquement)

Extensions utiles Supabase :
  pgvector    → recherche sémantique, embeddings
  pg_cron     → tâches planifiées sans serveur externe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## DÉPLOIEMENT — MATRICE DE DÉCISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend (toujours) :
  Vercel      → production, preview automatique par PR, analytics intégrés

Backend FastAPI :
  Railway     → production & projets payants (toujours-actif, cold start zéro, meilleure perf)
  Render free → démos externes, partage avec testeurs, MVP gratuit (cold start ~30s)
  Fly.io      → alternative si Railway trop cher, ou si latence EU critique

Règle de choix :
  Tester avec un utilisateur réel → Render free
  Projet avec vrais utilisateurs  → Railway
  Budget serré en production      → Fly.io

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## SERVICES TIERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Paiements     : Stripe + Stripe Elements + Webhooks (jamais traiter les cartes manuellement)
Emails        : Resend + React Email (templates en JSX)
Analytics     : Plausible (RGPD-friendly, pas de consentement requis) · Google Analytics si exigé
Monitoring    : Sentry (erreurs) · Better Uptime (uptime)
Design        : v0.dev (génération composants) · Figma + MCP Figma (maquettes client)

LLM — choix selon contexte :
  Groq (llama-3.3-70b)   → coût zéro, développement, MVP, tests
  OpenAI GPT-4o          → production si qualité critique, budget disponible
  Anthropic Claude       → raisonnement complexe, code, analyse longue
  Règle : toujours commencer par Groq — migrer si les limites sont atteintes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## VARIABLES D'ENVIRONNEMENT — RÉFÉRENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend (.env.local) :
  NEXT_PUBLIC_SUPABASE_URL           → non-sensible, frontend OK
  NEXT_PUBLIC_SUPABASE_ANON_KEY      → non-sensible, frontend OK
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → non-sensible, frontend OK
  NEXT_PUBLIC_APP_URL                → non-sensible, frontend OK
  NEXT_PUBLIC_API_URL                → URL backend, frontend OK

Backend (.env) :
  SUPABASE_SERVICE_ROLE_KEY          → backend uniquement, jamais exposé
  AI_API_KEY / GROQ_API_KEY          → backend uniquement
  STRIPE_SECRET_KEY                  → backend uniquement
  STRIPE_WEBHOOK_SECRET              → backend uniquement
  APP_SECRET                         → min 32 chars, backend uniquement

Règle absolue : toute variable non-préfixée NEXT_PUBLIC_ reste côté backend.
