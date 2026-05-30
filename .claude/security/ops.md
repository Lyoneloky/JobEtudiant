# Sécurité — Infrastructure, CI/CD, Monitoring & Incidents
# Charger si : déploiement, CI/CD, monitoring, infra, alertes, incident, logs

## Secrets Management
  Jamais dans le code   : aucun secret dans le source ni les commentaires
  Jamais dans git       : .env dans .gitignore · scanner avec gitleaks avant push
  Outils recommandés    : Doppler · HashiCorp Vault · AWS Secrets Manager · Vercel Env Vars
  Rotation              : tous les secrets tournent au moins une fois par an
  Accès secrets prod    : limité aux personnes strictement nécessaires

## CI/CD Security
  SAST          : Semgrep ou CodeQL à chaque PR
  SCA           : Snyk ou Dependabot pour les dépendances
  Secrets scan  : Gitleaks ou TruffleHog dans le pipeline
  Branch protect: main protégé · PR review obligatoire · checks verts requis
  Least privilege: le runner CI n'a accès qu'à ce dont il a besoin

## WAF & Protection réseau
  Provider      : Cloudflare WAF (recommandé) · AWS WAF
  Règles OWASP  : activer le ruleset OWASP Core
  Rate limiting : configurer au niveau WAF avant que les requêtes atteignent l'app
  Bot protection: activer
  Réseau privé  : bases de données jamais exposées publiquement

## Logging & Audit
  Enregistrer   : qui · quoi · quand · depuis où (IP, user agent)
  Actions loggées :
    connexion réussie/échouée · déconnexion · changement MDP/email/rôle
    création/modification/suppression ressources sensibles
    accès données sensibles · actions admin · paiements
    tentatives accès non autorisées (403)
  Ne jamais logger : mots de passe, tokens, numéros de carte, clés API
  Format         : JSON structuré avec timestamp · request_id · user_id · action · ip
  Immuabilité    : logs d'audit append-only, non modifiables
  Rétention      : 1 an minimum · 7 ans pour logs financiers

## Monitoring & Alerting
  Erreurs 5xx          : alerter si taux > 1% sur 5min
  Erreurs 4xx          : alerter si pic (scan/attaque possible)
  Latence              : alerter si P99 > 2s
  Brute force          : alerter si > 10 tentatives login échouées/min/IP
  Nouveaux pays        : alerter si connexion depuis pays jamais vu
  Volume export        : alerter si volume inhabituellement élevé

  Outils recommandés :
    Erreurs frontend   : Sentry
    Logs centralisés   : Logtail · Datadog · AWS CloudWatch
    Uptime             : Better Uptime · UptimeRobot
    APM                : Highlight.io · Datadog

## Plan de réponse aux incidents
  P0 Critique : production down · données compromises → réponse < 15min
  P1 Élevé    : fonctionnalité majeure KO · risque sécurité → réponse < 1h
  P2 Moyen    : dégradation service · anomalie → réponse < 4h
  P3 Faible   : bug mineur → réponse < 24h

  Processus :
    1. DÉTECTER  : monitoring, alertes, signalement utilisateur
    2. CONTENIR  : isoler le système, révoquer les accès compromis
    3. ÉVALUER   : étendue de l'impact, données exposées, vecteur d'attaque
    4. NOTIFIER  : équipe → utilisateurs → CNIL si requis (72h)
    5. ÉRADIQUER : corriger la vulnérabilité
    6. RESTAURER : remettre en service, valider l'intégrité
    7. POST-MORTEM: timeline · cause racine · actions préventives

  Page de statut : status.ton-domaine.com (StatusPage ou Better Uptime)

## Dépendances
  npm audit     : --audit-level=high avant chaque déploiement
  pip-audit     : avant chaque déploiement Python
  Renovate      : mises à jour automatiques des dépendances
  Licences      : vérifier compatibilité (éviter GPL en SaaS)
