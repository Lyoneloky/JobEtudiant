# Sécurité — API & Validation
# Charger si : endpoints, CORS, validation des entrées, rate limiting, API keys, GraphQL

## CORS
  Whitelist stricte  : origines explicites — jamais * en production
  Méthodes           : lister uniquement celles nécessaires
  Credentials        : Access-Control-Allow-Credentials: true uniquement avec origine précise
  Preflight cache    : Access-Control-Max-Age: 600

## Validation des entrées
  Librairies    : Pydantic (Python) ou Zod (TypeScript) sur toutes les entrées
  Longueur max  : limiter chaque champ (pas de texte illimité)
  Types         : vérifier strictement (int, email, uuid, date...)
  Enum          : valider contre une whitelist
  Content-Type  : vérifier que Content-Type correspond au body reçu
  Taille payload: limiter (ex: 10MB uploads, 100KB JSON)

## Rate Limiting
  Endpoints publics    : 100 req/min/IP
  Utilisateur connecté : 30 req/min/user
  Endpoints sensibles  : 10 req/min (login, reset, paiement)
  Pagination           : max 100 items par page, toujours paginer

## Injection
  SQL      : ORM uniquement (Prisma, SQLAlchemy) — si SQL brut inévitable : requêtes paramétrées
  NoSQL    : valider et assainir tous les opérateurs
  Command  : subprocess avec liste d'args — jamais exec/shell=True avec input utilisateur
  Prompt   : sandboxer les inputs envoyés aux LLMs, ne jamais exécuter leurs outputs

## CSRF
  Tokens CSRF   : double-submit cookie ou synchronizer token
  SameSite      : Strict ou Lax sur tous les cookies sensibles
  Origin header : vérifier sur toutes les mutations (POST, PUT, DELETE, PATCH)

## SSRF
  Whitelist URL  : domaines autorisés pour requêtes serveur
  Bloquer        : 169.254.x.x (AWS metadata), 10.x.x.x, 172.16.x.x, 192.168.x.x
  DNS rebinding  : résoudre et valider l'IP après résolution DNS

## API Keys (si applicable)
  Génération    : 256 bits min, préfixe identifiable (sk_live_xxx)
  Stockage      : hachées en base — jamais en clair
  Scope         : limiter les permissions par clé
  Révocation    : endpoint de révocation immédiate

## Business Logic
  Prix          : recalculer côté serveur — jamais confiance au montant client
  Race conditions: transactions DB avec verrouillage
  Workflow      : valider que les étapes sont suivies dans l'ordre
  Idempotency   : clés d'idempotence sur opérations critiques (paiements, emails)

## GraphQL (si applicable)
  Depth limiting   : max 5 niveaux
  Introspection    : désactiver en production
  Complexity limit : calculer et limiter la complexité des queries
