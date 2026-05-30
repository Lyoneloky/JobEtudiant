# Sécurité — Authentification & Autorisation
# Charger si : login, JWT, sessions, MFA, OAuth, rôles, mots de passe, brute force

## JWT
  Access token  : 15min (prod) ou 1h (MVP)
  Refresh token : 7 jours max, rotation obligatoire à chaque usage
  Stockage      : httpOnly cookie uniquement — jamais localStorage
  Payload       : user_id + role + exp uniquement — jamais données sensibles
  Algorithme    : RS256 (prod) ou HS256 (MVP)
  Révocation    : table token_blacklist ou Redis pour invalider avant expiration

## MFA
  Obligatoire pour : comptes admin, actions irréversibles, données sensibles
  Méthodes         : TOTP (Authy/Google Auth) · WebAuthn/FIDO2 (recommandé) · SMS (déconseillé)
  Codes de secours : 8 codes usage unique, stockés hachés, affichés une seule fois

## Mots de passe
  Longueur min  : 12 caractères, complexité obligatoire
  Hachage       : Argon2id (priorité) ou bcrypt cost ≥ 12 — jamais MD5/SHA1/SHA256 seuls
  Sel           : 128 bits min, unique par utilisateur
  Historique    : interdire les 10 derniers mots de passe
  Compromis     : vérifier contre HaveIBeenPwned API à la création

## Sessions
  ID session    : 256 bits min, cryptographiquement aléatoire
  Invalidation  : déconnexion · changement MDP · changement de rôle
  Inactivité    : expiration après 30min
  Multi-devices : lister les sessions actives, permettre révocation unitaire

## OAuth & SSO
  Vérifier       : email_verified = true chez le provider
  State param    : obligatoire et vérifié (anti-CSRF OAuth)
  PKCE           : obligatoire sur tous les flows OAuth 2.0
  Redirect URI   : whitelist stricte, jamais de wildcard
  Token exchange : côté serveur uniquement

## Brute Force & Credential Stuffing
  Lockout        : 5 tentatives → 30min · 10 → 24h · 20 → compte suspendu
  CAPTCHA        : après 3 échecs login/inscription/reset
  IP reputation  : bloquer IPs malveillantes (AbuseIPDB)
  Alert user     : email si connexion depuis nouvel appareil ou pays inhabituel

## RBAC
  Rôles          : super_admin / owner / admin / member / viewer / guest
  Stockage       : table profiles — jamais dans le JWT
  Vérification   : côté serveur sur chaque endpoint sensible
  Principe       : moindre privilège — accorder uniquement ce qui est nécessaire

## Autorisation
  IDOR           : toujours vérifier que la ressource appartient à l'utilisateur courant
  IDs publics    : UUIDs v4 — jamais IDs séquentiels exposés
  Multi-tenancy  : vérifier organization_id sur chaque requête

## Récupération de compte
  Reset MDP      : token 256 bits, expiration 15min, usage unique
  Envoi          : email uniquement
  Pas d'indices  : "si ce compte existe, un email a été envoyé"
  Questions secrètes : interdites
