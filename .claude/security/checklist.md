# Sécurité — Règles Absolues & Checklist Production
# Charger si : avant un commit majeur, avant un déploiement, revue de code sécurité

## RÈGLES ABSOLUES — JAMAIS FAIRE
  ✗ Clé API ou secret dans le code source ou les commentaires
  ✗ dangerouslySetInnerHTML sans DOMPurify
  ✗ SQL brut avec interpolation de variables utilisateur
  ✗ Mot de passe en clair ou haché avec MD5/SHA1
  ✗ Token JWT dans localStorage ou URL
  ✗ eval() avec données utilisateur
  ✗ Désactiver la vérification SSL/TLS (verify=False)
  ✗ IDs séquentiels exposés dans les URLs
  ✗ Stack trace exposée en production
  ✗ Déploiement sans tests de sécurité verts
  ✗ Accès base de données de prod depuis le frontend
  ✗ Confiance au Content-Type ou extension pour valider un fichier
  ✗ Logger des mots de passe, tokens ou PAN même partiellement
  ✗ Webhook sans vérification de signature
  ✗ CORS avec wildcard (*) en production
  ✗ Debug mode activé en production
  ✗ Mêmes clés API entre environnement dev et prod

## CHECKLIST AVANT CHAQUE DÉPLOIEMENT EN PRODUCTION
  [ ] npm audit --audit-level=high → 0 vulnérabilité high/critical
  [ ] pip-audit → 0 vulnérabilité (si backend Python)
  [ ] Variables d'env prod configurées et différentes du dev
  [ ] Debug mode désactivé
  [ ] Les logs ne contiennent pas de données sensibles
  [ ] Headers HTTP vérifiés sur securityheaders.com → score A ou A+
  [ ] HTTPS et HSTS actifs
  [ ] RLS activé sur toutes les tables Supabase
  [ ] Endpoints sensibles protégés par JWT vérifié
  [ ] Rate limiting actif sur les endpoints publics
  [ ] Backup fonctionnel et restauration testée
  [ ] Monitoring et alertes configurés
  [ ] Pas de secrets dans le code (scan gitleaks)
  [ ] CORS configuré avec whitelist stricte

## CHECKLIST SÉCURITÉ PAR TYPE DE TÂCHE

  Auth / Login :
    [ ] Brute force protection active
    [ ] Refresh token rotation implémentée
    [ ] Sessions invalidées à la déconnexion

  Endpoint API :
    [ ] JWT vérifié côté serveur
    [ ] Ownership de la ressource vérifié
    [ ] Input validé avec Pydantic ou Zod
    [ ] Rate limiting configuré

  Upload de fichier :
    [ ] Type MIME validé avec magic bytes
    [ ] Taille limitée
    [ ] Nom de fichier nettoyé
    [ ] Stocké hors webroot

  Paiement :
    [ ] Montant recalculé côté serveur
    [ ] Signature webhook vérifiée
    [ ] Idempotency key utilisée
    [ ] Statut vérifié avant activation

  Nouvelle table DB :
    [ ] RLS activé
    [ ] Colonne user_id ou organization_id présente
    [ ] UUID comme identifiant public
    [ ] Soft delete avec deleted_at
