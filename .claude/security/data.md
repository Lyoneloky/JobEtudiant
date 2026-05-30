# Sécurité — Données, Chiffrement & Uploads
# Charger si : chiffrement, stockage, uploads de fichiers, RLS, données sensibles

## Chiffrement en transit
  TLS 1.3       : version minimum (1.2 toléré) — 1.0/1.1 désactivés
  Certificats   : Let's Encrypt, renouvellement automatique
  HSTS          : max-age=63072000; includeSubDomains; preload
  Cipher suites : désactiver RC4, DES, 3DES, MD5, SHA1

## Chiffrement au repos
  Base de données   : chiffrement natif Supabase/PostgreSQL activé
  Fichiers uploadés : S3 SSE-S3 ou SSE-KMS
  Backups           : chiffrés avec clé distincte de la production
  PII haute sensibilité : chiffrement au niveau champ (AES-256-GCM) avant stockage

## Gestion des clés
  Rotation      : toutes les clés tournent au moins une fois par an
  Stockage      : Doppler · HashiCorp Vault · AWS Secrets Manager — jamais dans le code
  Séparation    : clé chiffrement ≠ clé signature ≠ clé session
  Clé compromise: procédure de rotation d'urgence documentée et testée

## Isolation des données
  Chaque table      : colonne organization_id ET/OU user_id
  RLS Supabase      : activé sur TOUTES les tables sans exception
  Test obligatoire  : deux comptes distincts ne voient jamais les données de l'autre
  Soft delete       : deleted_at timestamp — jamais supprimer physiquement (audit trail)
  IDs               : UUIDs v4 uniquement — jamais IDs séquentiels exposés

## Upload de fichiers
  Type MIME     : valider avec magic bytes côté serveur — jamais confiance à l'extension
  Taille max    : PDF 50MB · image 5MB · définir par type
  Nom fichier   : nettoyer (supprimer ../, caractères spéciaux, espaces)
  Stockage      : jamais dans le dossier public web — S3 privé ou hors webroot
  Virus scan    : ClamAV ou service cloud avant acceptation
  Exécution     : jamais exécuter un fichier uploadé
  Accès         : URLs signées temporaires (S3 presigned URLs)
  Métadonnées   : supprimer les EXIF des images (vie privée)

## Données sensibles — règles d'affichage
  Masquage UI   : xxxx-xxxx-xxxx-1234 pour cartes, email partiel
  Cache HTTP    : Cache-Control: no-store sur pages avec données sensibles
  Logs          : jamais logger passwords, tokens, PAN, numéros de carte
  Erreurs       : messages génériques en production (pas de stack traces)

## Backups
  Fréquence     : quotidien minimum
  Test restore  : tester la restauration chaque mois
  Localisation  : région géographique différente (disaster recovery)
  Rétention     : 30 jours minimum · 1 an pour données financières
  PITR          : activer Point-in-Time Recovery sur Supabase/PostgreSQL
