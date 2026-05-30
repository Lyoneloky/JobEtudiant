# Sécurité — RGPD & Conformité
# Charger si : cookies, consentement, données personnelles, droits utilisateurs, conformité légale

## Fondamentaux RGPD
  Consentement   : explicite, granulaire, révocable, documenté
  Finalité       : chaque donnée collectée a une finalité définie
  Minimisation   : collecter uniquement ce qui est strictement nécessaire
  Privacy by design : protection des données intégrée dès la conception

## Droits des utilisateurs (tous implémenter)
  Accès          : GET /api/account/export → toutes les données en JSON ou CSV
  Rectification  : modifier toutes les données personnelles
  Effacement     : DELETE /api/account → soft delete puis purge après 30 jours
  Portabilité    : export format standard (JSON, CSV)
  Opposition     : opt-out de chaque traitement (marketing, analytics)
  Limitation     : geler les traitements sans supprimer les données

## Durées de conservation
  Données compte      : durée de vie du compte + 30 jours après suppression
  Logs d'audit        : 1 an (RGPD) · 3 ans si litiges potentiels
  Données financières : 7 ans (obligations comptables)
  Logs techniques     : 3 mois maximum
  Emails marketing    : jusqu'au retrait du consentement

## Cookies & Tracking
  Bandeau cookies    : avant tout dépôt de cookie non strictement nécessaire
  Catégories         : nécessaires (sans consentement) · analytics · marketing · personnalisation
  Refus              : aussi simple que l'acceptation (pas de dark patterns)
  Retrait consentement: possible à tout moment
  Durée max cookies  : 13 mois (recommandation CNIL)
  Analytics RGPD-friendly : Plausible ou Fathom (pas de consentement requis)

## Sous-traitants (DPA obligatoire)
  Exiger un DPA avec chaque sous-traitant qui traite des données UE
  Liste minimale     : Supabase · Vercel · Stripe · service email · analytics
  Transferts hors UE : vérifier mécanisme légal (SCCs, Binding Corporate Rules)

## Violation de données
  Détection          : monitoring et alertes en place
  Notification CNIL  : dans les 72h si risque pour les personnes (notifications.cnil.fr)
  Notification users : si risque élevé pour leurs droits
  Registre           : documenter toutes les violations (même non notifiées)

## Emails (conformité)
  SPF    : enregistrement DNS configuré
  DKIM   : signature activée sur le domaine
  DMARC  : policy p=quarantine ou p=reject
  Unsubscribe : List-Unsubscribe header sur emails marketing

## Conformités selon le secteur
  SOC 2 Type II : SaaS B2B (Trust Services Criteria)
  PCI DSS       : si cartes bancaires — Stripe Elements = SAQ-A (le plus simple)
  HIPAA         : si données de santé USA
  HDS           : si hébergement données médicales France
  CCPA          : si utilisateurs Californie USA
