# Sécurité — Headers HTTP & Cookies
# Charger si : next.config.js, middleware, configuration serveur, headers, cookies

## Headers HTTP obligatoires (next.config.js ou middleware.ts)

  Strict-Transport-Security    : max-age=63072000; includeSubDomains; preload
  X-Frame-Options              : DENY
  X-Content-Type-Options       : nosniff
  X-XSS-Protection             : 0  ← désactivé (CSP est plus efficace)
  Referrer-Policy              : strict-origin-when-cross-origin
  Permissions-Policy           : camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy   : same-origin
  Cross-Origin-Embedder-Policy : require-corp
  Cross-Origin-Resource-Policy : same-origin

## Content-Security-Policy (adapter par projet)
  default-src   : 'self'
  script-src    : 'self' 'nonce-{NONCE}'   ← utiliser nonce, jamais unsafe-inline
  style-src     : 'self' 'nonce-{NONCE}'
  img-src       : 'self' data: https:
  font-src      : 'self'
  connect-src   : 'self' https://ton-api.com
  frame-ancestors: 'none'
  base-uri      : 'self'
  form-action   : 'self'
  upgrade-insecure-requests: (ajouter)

  Validation CSP : tester sur https://csp-evaluator.withgoogle.com

## Cache (pages sensibles)
  Cache-Control : no-store, no-cache, must-revalidate
  Pragma        : no-cache

## Clear-Site-Data (à la déconnexion)
  Header        : Clear-Site-Data: "cache", "cookies", "storage"

## Cookies — configuration obligatoire
  Tous les cookies d'authentification :
    HttpOnly  : true  — inaccessible au JavaScript
    Secure    : true  — HTTPS uniquement
    SameSite  : Strict (ou Lax si OAuth nécessaire)
    Path      : /
    Préfixe   : __Host- recommandé (__Host-session=...)
    Domaine   : ne pas spécifier (restreint au domaine exact)
    Expiration: durée minimale nécessaire

## Vérification
  Avant chaque déploiement : https://securityheaders.com
  Score cible              : A ou A+
