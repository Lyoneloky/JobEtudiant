# TerraBio — État complet du projet

## Contexte du projet

**Nom de l'application :** TerraBio  
**Sujet :** MISE EN PLACE D'UNE PLATEFORME INTELLIGENTE D'AIDE À L'UTILISATION RESPONSABLE DES PLANTES MÉDICINALES DU CAMEROUN  
**Type :** Projet de stage académique — DTS Génie Logiciel  
**Stagiaire :** NOAH MEKONGO Barnabé Lionel (Niveau II / L2A)  
**Institution :** Institut Africain d'Informatique (IAI-Cameroun), Yaoundé  
**Entreprise d'accueil :** Digital Generation Company SARL, Yaoundé  
**Encadrante académique :** Mme NDJATHE Germaine  
**Encadrante professionnelle :** Mme DZEUFACK Theresa  
**Période :** Juillet–Septembre 2025 — Année académique 2024-2025

**Différence vs rapport :** Le rapport préconisait React.js + Node.js + Express + PostgreSQL. Nous avons remplacé le backend par **Supabase** (PostgreSQL managé + Auth + RLS + API REST auto-générée), en gardant le même schéma relationnel.

---

## Stack technique

```
Framework    : Next.js 16.2.6 (App Router, Turbopack)
Langage      : TypeScript 5
BDD          : Supabase (PostgreSQL managé)
Auth         : Supabase Auth (GoTrue)
CSS          : Tailwind CSS 4 + styles inline (inline styles pour valeurs pixel-perfect)
Polices      : Poppins (titres, Google Fonts) + Inter / Arial (corps)
Icônes       : lucide-react 1.16.0
Carte        : Leaflet 1.9.4 + react-leaflet 5.0.0
Supabase SDK : @supabase/ssr 0.10.3 + @supabase/supabase-js 2.106.0
Node.js      : v24.14.0
```

---

## Charte graphique (rapport officiel)

```
Vert nature (primaire)  : #22c55e
Vert sombre (accent)    : #166534
Vert clair (fonds)      : #dcfce7
Beige doux (encadrés)   : #F1EFE6
Bleu confiance (info)   : #2196F3
Gris neutre (texte sec) : #616161
Fond général            : #F8FAF5
Blanc                   : #FFFFFF
Bordures                : #E8EDE4

Titres : font-family: 'Poppins', sans-serif
Corps  : font-family: "Inter", Arial, sans-serif
```

---

## Structure du projet

```
C:\Users\hp\Desktop\Soutenance_personnelle\plantes-medicinales\
├── .env.local                    ← À remplir avec les vraies clés Supabase
├── supabase/
│   └── schema.sql                ← Schéma complet (tables, RLS, données démo)
├── src/
│   ├── app/
│   │   ├── layout.tsx            ← Layout minimal (pas de Navbar globale)
│   │   ├── globals.css           ← Poppins + Inter + Tailwind + Leaflet CSS
│   │   ├── page.tsx              ← Landing page TerraBio (Navbar intégrée)
│   │   ├── plantes/
│   │   │   ├── page.tsx          ← Catalogue + recherche + filtres
│   │   │   └── [id]/
│   │   │       ├── page.tsx      ← Fiche détaillée (Server Component)
│   │   │       └── FavoriteButton.tsx  ← Bouton favori (Client Component)
│   │   ├── symptomes/
│   │   │   ├── page.tsx          ← Server Component (charge DB)
│   │   │   └── SymptomesClient.tsx  ← UI interactive (Client Component)
│   │   ├── consultation/
│   │   │   ├── page.tsx          ← Formulaire demande de conseil
│   │   │   └── confirmation/page.tsx  ← Page de succès
│   │   ├── carte/
│   │   │   ├── page.tsx          ← Server Component (charge locations DB)
│   │   │   └── CarteClient.tsx   ← Carte Leaflet (Client Component)
│   │   ├── conseils/page.tsx     ← Fil de conseils saisonniers
│   │   ├── glossaire/page.tsx    ← Glossaire médical/botanique
│   │   ├── profil/page.tsx       ← Profil utilisateur (auth requis)
│   │   ├── dashboard/page.tsx    ← Tableau de bord avec sidebar
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── admin/
│   │       ├── plantes/
│   │       │   ├── page.tsx      ← Liste CRUD des plantes
│   │       │   ├── PlantForm.tsx ← Formulaire plante (réutilisé)
│   │       │   ├── DeletePlantButton.tsx
│   │       │   ├── nouveau/page.tsx
│   │       │   └── [id]/modifier/page.tsx
│   │       ├── consultations/
│   │       │   ├── page.tsx      ← Liste consultations admin
│   │       │   └── [id]/page.tsx ← Répondre à une consultation
│   │       └── utilisateurs/page.tsx  ← Gestion users (mock pour l'instant)
│   ├── components/
│   │   ├── Navbar.tsx            ← Navbar partagée (pages non-landing)
│   │   ├── Footer.tsx            ← Footer partagé
│   │   ├── PlantCard.tsx         ← Carte plante réutilisable
│   │   └── map/
│   │       └── DynamicMap.tsx    ← Carte Leaflet (dynamic import, SSR:false)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         ← createBrowserClient (Client Components)
│   │   │   └── server.ts         ← createServerClient (Server Components)
│   │   ├── actions.ts            ← Toutes les Server Actions (mutations)
│   │   └── types.ts              ← Types TypeScript (Plant, Category, etc.)
│   └── proxy.ts                  ← Middleware auth (Next.js 16 = proxy.ts)
```

---

## Pages et fonctionnalités — État complet

| Route | Type | Auth | Fonctionnalité | Données |
|---|---|---|---|---|
| `/` | Server Component | Non | Landing page TerraBio, hero, features, stats | Supabase + fallback |
| `/plantes` | Server Component | Non | Catalogue + recherche texte + filtre catégorie | Supabase |
| `/plantes/[id]` | Server Component | Non | Fiche complète (propriétés, préparation, CI, symptômes liés) | Supabase |
| `/symptomes` | Server + Client | Non | Recherche par symptôme → plantes + préparation | Supabase + fallback statique |
| `/conseils` | Client Component | Non | Fil de conseils saisonniers filtrables | Supabase + fallback statique |
| `/glossaire` | Client Component | Non | Glossaire médical/botanique, filtre A-Z + recherche | Supabase + fallback statique |
| `/carte` | Server + Client | Non | Carte Leaflet interactive (herboristeries, marchés, zones) | Supabase + fallback statique |
| `/consultation` | Client Component | Oui | Formulaire demande de conseil personnalisé | Supabase (action serveur) |
| `/consultation/confirmation` | Server Component | Non | Page succès après envoi | Statique |
| `/profil` | Client Component | Oui | Stats, édition nom d'affichage, déconnexion | Supabase |
| `/dashboard` | Client Component | Oui | Tableau de bord sidebar : stats, plantes, alertes | Supabase + données démo |
| `/auth/login` | Client Component | Non | Connexion email/password | Supabase Auth |
| `/auth/register` | Client Component | Non | Inscription + email de confirmation | Supabase Auth |
| `/admin/plantes` | Server Component | Oui | Liste CRUD des plantes avec statuts | Supabase |
| `/admin/plantes/nouveau` | Server Component | Oui | Formulaire ajout plante | Supabase action |
| `/admin/plantes/[id]/modifier` | Server Component | Oui | Formulaire édition plante | Supabase action |
| `/admin/consultations` | Server Component | Oui | Liste consultations avec stats et filtres | Supabase |
| `/admin/consultations/[id]` | Client Component | Oui | Répondre + recommander plante | Supabase action |
| `/admin/utilisateurs` | Server Component | Oui | Liste users (mock — Supabase Admin API non configuré) | Mock |

---

## Base de données Supabase — 10 tables

### Tables créées dans `supabase/schema.sql`

| Table | Description | Données démo |
|---|---|---|
| `categories` | Familles de plantes (8 catégories) | 8 catégories |
| `plants` | Catalogue médicinal camerounais | 10 plantes complètes |
| `symptoms` | Symptômes médicaux | 29 symptômes en 7 catégories |
| `plant_symptoms` | Association M:N plante ↔ symptôme | ~40 associations |
| `favorites` | Favoris utilisateur | (vide au départ) |
| `profiles` | Profils utilisateurs (nom, rôle) | Trigger auto à l'inscription |
| `consultations` | Demandes de conseil personnalisé | (vide au départ) |
| `glossary` | Termes médicaux/botaniques | 25 termes |
| `tips` | Conseils saisonniers avec étapes | 6 conseils complets |
| `locations` | Points de vente géolocalisés | 6 locations (Yaoundé, Douala) |

### Plantes de démonstration (10 plantes camerounaises)
Goyave (feuilles), Citronnelle, Gingembre sauvage, Prunier africain, Moringa, Neem, Aloe vera, Eucalyptus, Papayer (feuilles), Basilic africain

### Trigger automatique
`handle_new_user()` — crée automatiquement un profil dans `profiles` lors de chaque inscription via `auth.users`

---

## Configuration Supabase

### Fichier `.env.local` (à remplir)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### Guard de protection (partout dans le code)
Si `.env.local` contient encore les valeurs par défaut (`your_supabase_project_url`), les pages statiques fonctionnent normalement. Les fonctions nécessitant Supabase retournent un message d'erreur clair sans crasher.

Pattern dans `src/lib/actions.ts` :
```ts
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.startsWith('http') && !url.includes('placeholder')
}
```

Pattern dans `src/lib/supabase/client.ts` et `server.ts` :
```ts
const url = rawUrl.startsWith('http') ? rawUrl : 'https://placeholder.supabase.co'
```

Pattern dans `src/app/auth/login/page.tsx` et `register/page.tsx` :
```ts
// Vérifier AVANT de faire l'appel réseau (évite l'erreur "Failed to fetch")
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
if (!supabaseUrl.startsWith('http') || supabaseUrl.includes('placeholder')) {
  setError('⚙️ Supabase non configuré...')
  return
}
```

### Étapes pour connecter Supabase
1. Créer un projet sur https://supabase.com (gratuit)
2. Settings → API → copier URL et anon key
3. Remplir `.env.local`
4. SQL Editor → coller le contenu de `supabase/schema.sql` → Run
5. `npm run dev`

---

## Server Actions (src/lib/actions.ts)

Toutes les mutations sont des Server Actions Next.js (`'use server'`) :

| Fonction | Description |
|---|---|
| `addFavorite(plantId)` | Ajouter une plante aux favoris |
| `removeFavorite(plantId)` | Retirer des favoris |
| `submitConsultation(formData)` | Soumettre demande de conseil |
| `respondConsultation(id, response, plantId?)` | Admin répond à une consultation |
| `updateProfile(displayName)` | Modifier le nom d'affichage |
| `deletePlant(plantId)` | Supprimer une plante |
| `savePlant(formData, plantId?)` | Créer ou modifier une plante |

---

## Middleware (src/proxy.ts)

**Important :** Next.js 16 renomme `middleware.ts` en `proxy.ts` et `export function middleware` en `export function proxy`.

Routes protégées (redirige vers `/auth/login` si non connecté) :
- `/dashboard/*`
- `/admin/*`

---

## Navigation (src/components/Navbar.tsx)

Liens de navigation :
- Plantes (`/plantes`)
- Symptômes (`/symptomes`)
- Conseils (`/conseils`)
- Carte (`/carte`)
- Glossaire (`/glossaire`)

Si connecté : + Tableau de bord, Admin, Déconnexion  
Si déconnecté : + Connexion, S'inscrire

**Note :** La landing page (`/`) a sa propre navbar intégrée (`LandingNavbar` dans `page.tsx`). Le dashboard a une sidebar intégrée. Les autres pages utilisent `<Navbar />` depuis `@/components/Navbar`.

---

## Particularités techniques à retenir

### Next.js 16 — Breaking changes vs versions précédentes
- `middleware.ts` → `proxy.ts` (export nommé `proxy`, pas `middleware`)
- `searchParams` dans les pages est maintenant une `Promise<{}>` (à await)
- `params` dans les pages dynamiques est aussi une `Promise<{ id: string }>` (à await)
- `cookies()` from `next/headers` est async (à await)

### Carte Leaflet (src/components/map/DynamicMap.tsx)
- Import dynamique uniquement (`dynamic(() => import(...), { ssr: false })`)
- CSS Leaflet importé dans `globals.css` via CDN CloudFlare
- Fix icônes Leaflet dans `DynamicMap.tsx` (supprimer `_getIconUrl`, merger les URLs CDN)

### Pattern Server Component + Client Component pour les pages interactives
Exemple `/symptomes` :
```
symptomes/page.tsx      ← Server Component : charge DB, passe data en props
symptomes/SymptomesClient.tsx ← Client Component : UI interactive
```

### Données statiques de fallback
Toutes les pages qui affichent des données de la DB ont un fallback statique pour fonctionner sans Supabase :
- `/symptomes` → `STATIC_CATEGORIES` et `STATIC_PLANT_MAP`
- `/carte` → `FALLBACK_LOCATIONS`
- `/conseils` → données hardcodées dans le composant
- `/glossaire` → données hardcodées dans le composant

---

## Commandes utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Vérifier TypeScript (sans erreurs actuellement)
.\node_modules\.bin\tsc --noEmit

# Build de production
npm run build
```

---

## Problèmes connus et points à améliorer

### Résolu
- ✅ `Invalid supabaseUrl` → Guard `startsWith('http')` dans client.ts et server.ts
- ✅ `Failed to fetch` sur auth → Vérification URL avant appel réseau
- ✅ `@import` CSS order → Google Fonts avant `@import "tailwindcss"`
- ✅ `middleware.ts` déprécié → Renommé en `proxy.ts`
- ✅ Erreur TypeScript `result?.error` → `'error' in result && result.error`

### Reste à faire (non implémenté)
- ❌ **Gestion des utilisateurs admin** `/admin/utilisateurs` : actuellement des données mock. Pour une vraie implémentation, utiliser l'API Supabase Admin (service_role key côté serveur — ne jamais exposer côté client)
- ❌ **Rôles admin** : actuellement tout utilisateur connecté peut accéder à `/admin`. À implémenter : vérifier `profiles.role = 'admin'` dans le proxy
- ❌ **Images plantes** : actuellement des emojis/placeholders. À implémenter : Supabase Storage pour uploader des images réelles
- ❌ **Email de confirmation** : Supabase envoie un email mais redirige vers `localhost` en dev. À configurer dans Supabase Auth → URL Configuration
- ❌ **Fil des consultations utilisateur** : l'utilisateur peut soumettre une demande mais ne voit pas les réponses de l'admin (non implémenté dans `/dashboard`)
- ❌ **Réinitialisation de mot de passe** : non implémenté
- ❌ **Pagination** : le catalogue `/plantes` charge toutes les plantes sans pagination

---

## Fichiers importants hors projet

| Fichier | Emplacement | Description |
|---|---|---|
| `PAGE DE GARDE.docx` | `Soutenance_personnelle/` | Rapport de stage complet (source de vérité fonctionnelle) |
| `Guide_Supabase_TerraBio.docx` | `Soutenance_personnelle/` | Guide d'implémentation Supabase (9 sections, généré en session) |
| Images de référence UI | `Soutenance_personnelle/` | `b74ec595-...png` (landing), `7191e598-...png` (dashboard) |

---

## Historique des décisions importantes

| Décision | Raison |
|---|---|
| Supabase à la place de Node.js+Express | Même fonctionnalité (PostgreSQL), moins de code, Auth et RLS intégrés |
| Inline styles (pas de classes Tailwind) | Précision pixel-perfect — les valeurs exactes du rapport (76px, 84px, etc.) |
| Server Actions au lieu d'API Routes | Moins de code, type-safe, pas d'endpoint HTTP à gérer |
| `proxy.ts` au lieu de `middleware.ts` | Breaking change Next.js 16 |
| Fallback statique partout | L'app fonctionne sans Supabase pour la démo |
| Données démo camerounaises | 10 vraies plantes locales + contexte authentique pour la soutenance |
