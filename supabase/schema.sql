-- ============================================================
-- TerraBio — Schéma complet Supabase
-- Plateforme d'aide à l'utilisation responsable des plantes
-- médicinales du Cameroun
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLES PRINCIPALES
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plants (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  latin_name      TEXT,
  description     TEXT NOT NULL,
  properties      TEXT[] DEFAULT '{}',
  usage           TEXT,
  contraindications TEXT,
  dosage          TEXT,
  preparation     TEXT,
  image_url       TEXT,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_published    BOOLEAN DEFAULT true,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS symptoms (
  id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name     TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plant_symptoms (
  plant_id   UUID REFERENCES plants(id) ON DELETE CASCADE,
  symptom_id UUID REFERENCES symptoms(id) ON DELETE CASCADE,
  PRIMARY KEY (plant_id, symptom_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plant_id   UUID REFERENCES plants(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plant_id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  role         TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'herboriste')),
  approved     BOOLEAN DEFAULT true,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultations (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symptoms_description  TEXT NOT NULL,
  age                   INTEGER,
  duration              TEXT,
  current_treatments    TEXT,
  allergies             TEXT,
  status                TEXT DEFAULT 'en_attente'
                          CHECK (status IN ('en_attente','en_cours','traitee','fermee')),
  admin_response        TEXT,
  plant_recommended_id  UUID REFERENCES plants(id) ON DELETE SET NULL,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS glossary (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  term       TEXT NOT NULL,
  definition TEXT NOT NULL,
  category   TEXT DEFAULT 'général',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tips (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  season     TEXT DEFAULT 'all' CHECK (season IN ('all','pluies','seche')),
  plant_name TEXT,
  category   TEXT DEFAULT 'santé',
  ingredients TEXT[],
  steps      TEXT[],
  warning    TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('herboristerie','marche','zone_cueillette')),
  latitude    DECIMAL(10,7),
  longitude   DECIMAL(10,7),
  address     TEXT,
  city        TEXT,
  region      TEXT,
  description TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- FONCTION : créer profil automatiquement à l'inscription
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_approved BOOLEAN;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  v_approved := CASE WHEN v_role = 'herboriste' THEN FALSE ELSE TRUE END;

  INSERT INTO public.profiles (id, display_name, role, approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name'),
    v_role,
    v_approved
  )
  ON CONFLICT (id) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      role = EXCLUDED.role,
      approved = CASE WHEN EXCLUDED.role = 'herboriste' THEN FALSE ELSE TRUE END,
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms      ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips          ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations     ENABLE ROW LEVEL SECURITY;

-- Categories : lecture publique
CREATE POLICY "categories_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_write" ON categories FOR ALL USING (auth.uid() IS NOT NULL);

-- Plants : lecture publique des plantes publiées
CREATE POLICY "plants_read_published" ON plants FOR SELECT
  USING (is_published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "plants_write" ON plants FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "plants_update" ON plants FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "plants_delete" ON plants FOR DELETE USING (auth.uid() IS NOT NULL);

-- Symptoms : lecture publique
CREATE POLICY "symptoms_read" ON symptoms FOR SELECT USING (true);
CREATE POLICY "symptoms_write" ON symptoms FOR ALL USING (auth.uid() IS NOT NULL);

-- Plant symptoms : lecture publique
CREATE POLICY "plant_symptoms_read" ON plant_symptoms FOR SELECT USING (true);
CREATE POLICY "plant_symptoms_write" ON plant_symptoms FOR ALL USING (auth.uid() IS NOT NULL);

-- Favorites : utilisateur gère ses propres favoris
CREATE POLICY "favorites_own" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Profiles : chaque utilisateur voit/modifie son profil
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Consultations : utilisateur voit les siennes, admin voit toutes
CREATE POLICY "consultations_user" ON consultations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "consultations_insert" ON consultations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "consultations_admin_update" ON consultations
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Glossary, Tips, Locations : lecture publique
CREATE POLICY "glossary_read" ON glossary FOR SELECT USING (true);
CREATE POLICY "glossary_write" ON glossary FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "tips_read" ON tips FOR SELECT USING (true);
CREATE POLICY "tips_write" ON tips FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "locations_read" ON locations FOR SELECT USING (true);
CREATE POLICY "locations_write" ON locations FOR ALL USING (auth.uid() IS NOT NULL);

-- ────────────────────────────────────────────────────────────
-- DONNÉES DE RÉFÉRENCE — CATÉGORIES
-- ────────────────────────────────────────────────────────────

INSERT INTO categories (name, slug) VALUES
  ('Plantes digestives',          'digestives'),
  ('Plantes fébrifuges',          'febrifuges'),
  ('Plantes anti-inflammatoires', 'anti-inflammatoires'),
  ('Plantes calmantes',           'calmantes'),
  ('Plantes toniques',            'toniques'),
  ('Plantes antiparasitaires',    'antiparasitaires'),
  ('Plantes respiratoires',       'respiratoires'),
  ('Plantes cicatrisantes',       'cicatrisantes')
ON CONFLICT (slug) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- DONNÉES — PLANTES MÉDICINALES CAMEROUNAISES
-- ────────────────────────────────────────────────────────────

WITH cat AS (SELECT id, slug FROM categories)
INSERT INTO plants
  (name, latin_name, description, properties, usage, preparation, contraindications, dosage, category_id, is_published)
SELECT * FROM (VALUES

  ('Goyave (feuilles)',
   'Psidium guajava',
   'Arbre fruitier dont les feuilles sont parmi les plus utilisées en médecine traditionnelle camerounaise. Riches en tanins, flavonoïdes et huiles essentielles, elles sont particulièrement efficaces contre les troubles digestifs.',
   ARRAY['Anti-diarrhéique','Antibactérien','Antioxydant','Anti-diabétique','Antispasmodique'],
   'Infusion des feuilles fraîches ou séchées contre la diarrhée et les maux de ventre. Décoction des feuilles comme bain pour les plaies infectées. Macération pour les gingivites.',
   E'1. Cueillir 10 à 15 jeunes feuilles fraîches\n2. Laver soigneusement à l''eau propre\n3. Faire bouillir dans 1 litre d''eau pendant 15 minutes\n4. Laisser refroidir et filtrer\n5. Boire 2 à 3 tasses par jour',
   'Déconseillé aux femmes enceintes en grande quantité. Peut interagir avec les médicaments antidiabétiques. Éviter chez les enfants de moins de 2 ans.',
   '2 à 3 tasses par jour, pendant 3 à 5 jours. Ne pas dépasser 7 jours sans avis médical.',
   (SELECT id FROM cat WHERE slug = 'digestives'),
   true),

  ('Citronnelle',
   'Cymbopogon citratus',
   'Graminée aromatique aux feuilles longues et étroites, très répandue dans toute l''Afrique centrale. Son huile essentielle est riche en citral, aux puissantes propriétés anxiolytiques, antifongiques et insectifuges.',
   ARRAY['Calmante','Anxiolytique','Antifongique','Digestive','Insectifuge','Anti-fièvre'],
   'Tisane pour calmer l''anxiété et favoriser le sommeil. Bain de vapeur pour les voies respiratoires. Application cutanée diluée comme répulsif naturel contre les moustiques.',
   E'1. Couper 3 à 4 tiges fraîches de citronnelle\n2. Écraser légèrement les tiges pour libérer l''arôme\n3. Porter 500 ml d''eau à ébullition\n4. Infuser 10 minutes hors du feu\n5. Filtrer, ajouter du miel si souhaité\n6. Boire chaud le soir avant le coucher',
   'Éviter en cas de grossesse (peut stimuler les contractions). Huile essentielle à diluer avant application. Ne pas donner aux enfants de moins de 6 ans.',
   '1 à 2 tasses le soir. En usage externe, diluer 2-3 gouttes d''HE dans 10 ml d''huile végétale.',
   (SELECT id FROM cat WHERE slug = 'calmantes'),
   true),

  ('Gingembre sauvage',
   'Zingiber officinale',
   'Le gingembre sauvage, abondant dans les zones humides du Cameroun, est un rhizome aux multiples vertus médicinales reconnus par la pharmacopée africaine et l''OMS. Il est utilisé depuis des siècles contre la fièvre, les nausées et les douleurs articulaires.',
   ARRAY['Anti-inflammatoire','Anti-fièvre','Anti-nauséeux','Digestif','Antioxydant','Stimulant'],
   'Décoction du rhizome frais contre la fièvre et les douleurs. Infusion pour les nausées et le mal des transports. Cataplasme écrasé pour les douleurs articulaires externes.',
   E'1. Peler et couper 20g de rhizome frais en fines tranches\n2. Porter à ébullition dans 500 ml d''eau\n3. Laisser frémir 20 minutes\n4. Filtrer et ajouter du citron et du miel\n5. Boire chaud 2 à 3 fois par jour pendant la maladie',
   'Déconseillé avec les anticoagulants (fluidifie le sang). Prudence au-delà de 4g/jour. Éviter en cas de calculs biliaires. Limiter pendant la grossesse aux doses culinaires.',
   'Infusion : 1 à 2g de rhizome frais. Décoction : 2 à 4g. Dose maximale : 4g/jour. Cure de 1 à 2 semaines.',
   (SELECT id FROM cat WHERE slug = 'anti-inflammatoires'),
   true),

  ('Prunier africain',
   'Prunus africana',
   'Arbre endémique des forêts d''altitude du Cameroun, classé espèce menacée. Son écorce est utilisée dans la médecine traditionnelle pour les troubles prostatiques et comme tonique général. Reconnu par l''OMS.',
   ARRAY['Prostate','Tonique','Anti-inflammatoire','Antifongique','Antiparasitaire'],
   'Décoction de l''écorce séchée pour les troubles prostatiques et les difficultés urinaires. Tonique général en cure. Bain pour les infections fongiques cutanées.',
   E'1. Prendre 30g d''écorce séchée et fragmentée\n2. Faire bouillir dans 1 litre d''eau pendant 30 minutes\n3. Laisser refroidir et filtrer\n4. Boire 1 tasse matin et soir pendant 3 semaines',
   'Usage uniquement sous supervision médicale pour les troubles prostatiques graves. Peut interférer avec les médicaments anti-androgènes. Espèce protégée : prélever avec parcimonie.',
   '1 tasse (200 ml) matin et soir. Cure de 3 semaines maximum. Consulter un médecin avant utilisation prolongée.',
   (SELECT id FROM cat WHERE slug = 'toniques'),
   true),

  ('Moringa',
   'Moringa oleifera',
   'Surnommé "l''arbre de vie" au Cameroun, le moringa est reconnu par l''ONU pour ses exceptionnelles qualités nutritives. Ses feuilles contiennent 7 fois plus de vitamine C que l''orange et 4 fois plus de calcium que le lait.',
   ARRAY['Nutritif','Antioxydant','Anti-inflammatoire','Immunostimulant','Hypoglycémiant'],
   'Poudre de feuilles séchées ajoutée aux repas comme complément nutritionnel. Tisane de feuilles fraîches pour renforcer l''immunité. Huile des graines pour usage alimentaire et cosmétique.',
   E'1. Cueillir des feuilles fraîches et saines\n2. Laver, puis sécher à l''ombre (jamais au soleil direct)\n3. Réduire en poudre\n4. Ajouter 1 cuillère à café à la bouillie ou à la sauce\n5. Consommer quotidiennement',
   'Éviter les graines en grande quantité (effet abortif potentiel). Les racines ne sont pas recommandées en usage thérapeutique. Modérer si traitement hypoglycémiant en cours.',
   '1 à 2 cuillères à café de poudre par jour dans les aliments. Tisane : 1 à 2 tasses par jour.',
   (SELECT id FROM cat WHERE slug = 'toniques'),
   true),

  ('Neem',
   'Azadirachta indica',
   'L''arbre neem, importé d''Asie mais naturalisé au Cameroun, est une pharmacie à lui seul. Chaque partie de l''arbre (feuilles, écorce, graines, huile) possède des propriétés médicinales variées, en particulier contre le paludisme.',
   ARRAY['Antipaludique','Antibactérien','Antifongique','Antiparasitaire','Antiviral','Insectifuge'],
   'Décoction des feuilles comme fébrifuge antipaludique. Bain de vapeur pour les voies respiratoires. Huile de neem diluée pour les affections cutanées et comme répulsif.',
   E'1. Prendre une poignée de feuilles de neem fraiches (30-40 feuilles)\n2. Laver soigneusement\n3. Faire bouillir dans 1 litre d''eau pendant 20 minutes\n4. Laisser refroidir et filtrer\n5. Boire 1 tasse 3 fois par jour pendant 5 jours (paludisme)',
   'Contre-indiqué pendant la grossesse (propriétés abortives). Ne pas donner aux enfants de moins de 5 ans per os. Huile pure à diluer impérativement. En cas de paludisme grave, consulter d''urgence un médecin.',
   '1 tasse (150 ml) 3 fois par jour. Traitement : 5 à 7 jours. Ne pas dépasser 2 semaines.',
   (SELECT id FROM cat WHERE slug = 'antiparasitaires'),
   true),

  ('Aloe vera',
   'Aloe barbadensis miller',
   'Plante succulente largement cultivée au Cameroun pour ses feuilles charnues contenant un gel aux propriétés cicatrisantes, hydratantes et laxatives remarquables. L''une des plantes médicinales les plus documentées scientifiquement.',
   ARRAY['Cicatrisant','Hydratant','Laxatif','Anti-inflammatoire','Antifongique'],
   'Gel des feuilles appliqué directement sur les brûlures, coupures et irritations cutanées. Jus de gel dilué pour les troubles digestifs. Masque capillaire hydratant.',
   E'1. Couper une feuille épaisse près de la base\n2. Laisser s''écouler le latex jaune-vert (aloïne) - toxique, ne pas utiliser\n3. Peler la face verte de la feuille\n4. Récupérer le gel transparent\n5. Appliquer directement sur la zone concernée\n6. Conserver au réfrigérateur maximum 3 jours',
   'Le latex jaune (aloïne) est toxique et laxatif puissant - ne jamais l''utiliser. Le gel interne peut interagir avec les médicaments antidiabétiques et diurétiques. Éviter l''ingestion pendant la grossesse.',
   'Usage externe : 2 à 3 fois par jour. Usage interne : 2 cuillères à soupe de gel pur maximum par jour. Ne pas dépasser 10 jours.',
   (SELECT id FROM cat WHERE slug = 'cicatrisantes'),
   true),

  ('Eucalyptus',
   'Eucalyptus globulus',
   'Arbre à croissance rapide très répandu au Cameroun, notamment dans les zones tempérées de l''Ouest. Ses feuilles riches en cinéole (eucalyptol) sont particulièrement efficaces contre les affections respiratoires.',
   ARRAY['Expectorant','Antiseptique','Décongestionnant','Anti-grippal','Bronchodilatateur'],
   'Inhalation de vapeur pour les rhinites, sinusites et bronchites. Infusion pour les maux de gorge. Cataplasme chauffé sur la poitrine pour les congestions.',
   E'Inhalation :\n1. Porter 1 litre d''eau à ébullition\n2. Ajouter une poignée de feuilles d''eucalyptus\n3. Se pencher au-dessus du récipient, tête couverte d''une serviette\n4. Inhaler la vapeur 10-15 minutes\n5. Répéter 2 fois par jour',
   'Huile essentielle déconseillée aux enfants de moins de 6 ans et femmes enceintes. Ne pas appliquer near les yeux ou les muqueuses. Peut interagir avec certains médicaments hépatiques.',
   'Inhalation : 2 fois par jour, 10-15 minutes. Infusion : 1 tasse 3 fois par jour. Cure de 5 à 7 jours.',
   (SELECT id FROM cat WHERE slug = 'respiratoires'),
   true),

  ('Papayer (feuilles)',
   'Carica papaya',
   'Le papayer est omniprésent au Cameroun. Si le fruit est connu de tous, ses feuilles sont utilisées en médecine traditionnelle contre le paludisme, la dengue et pour améliorer la numération plaquettaire.',
   ARRAY['Antipaludique','Antidengue','Anti-inflammatoire','Digestif','Antioxydant'],
   'Décoction des feuilles comme antipaludique et pour augmenter les plaquettes sanguines (dengue). Jus de feuilles fraîches (très amer). Wrapping des feuilles sur les douleurs articulaires.',
   E'1. Prendre 5 à 7 feuilles fraîches de papayer\n2. Laver soigneusement\n3. Broyer ou piler pour extraire le jus\n4. Filtrer (le jus est très amer)\n5. Boire 2 cuillères à soupe 2 fois par jour\nOU décoction : faire bouillir 3 feuilles dans 500 ml d''eau pendant 15 minutes',
   'Contre-indiqué pendant la grossesse (propriétés abortives). Ne pas utiliser avec des anticoagulants. En cas de dengue grave, consulter un médecin en urgence. Éviter les quantités excessives.',
   '2 cuillères à soupe de jus 2 fois par jour. Décoction : 1 tasse 2 fois par jour. Cure de 5 jours maximum.',
   (SELECT id FROM cat WHERE slug = 'antiparasitaires'),
   true),

  ('Basilic africain',
   'Ocimum gratissimum',
   'Plante aromatique répandue au Cameroun, différente du basilic européen. Utilisée en cuisine et en médecine traditionnelle pour ses propriétés antibactériennes, digestives et contre les parasites intestinaux.',
   ARRAY['Antibactérien','Digestif','Antiparasitaire','Anti-fièvre','Antispasmodique'],
   'Tisane des feuilles fraîches ou séchées pour les troubles digestifs et la fièvre. Fumigation pour les céphalées. Application locale pour les infections cutanées bénignes.',
   E'1. Laver une poignée de feuilles de basilic africain\n2. Porter 500 ml d''eau à ébullition\n3. Infuser les feuilles 10 minutes hors du feu\n4. Filtrer et boire chaud\n5. Ajouter du miel pour améliorer le goût',
   'Utilisation modérée conseillée. Éviter de grandes quantités en cas de grossesse. Les huiles essentielles sont à utiliser diluées uniquement.',
   '1 à 2 tasses par jour après les repas. Cure de 5 à 7 jours.',
   (SELECT id FROM cat WHERE slug = 'digestives'),
   true)

) AS v(name, latin_name, description, properties, usage, preparation, contraindications, dosage, category_id, is_published)
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- DONNÉES — SYMPTÔMES
-- ────────────────────────────────────────────────────────────

INSERT INTO symptoms (name, category) VALUES
  -- Digestif
  ('Diarrhée',              'Digestif'),
  ('Maux de ventre',        'Digestif'),
  ('Constipation',          'Digestif'),
  ('Nausées',               'Digestif'),
  ('Vomissements',          'Digestif'),
  ('Ballonnements',         'Digestif'),
  -- Fièvre / Infectieux
  ('Fièvre',                'Fièvre / Infectieux'),
  ('Paludisme',             'Fièvre / Infectieux'),
  ('Grippe',                'Fièvre / Infectieux'),
  ('Infections parasitaires','Fièvre / Infectieux'),
  -- Respiratoire
  ('Toux',                  'Respiratoire'),
  ('Rhume',                 'Respiratoire'),
  ('Maux de gorge',         'Respiratoire'),
  ('Congestion nasale',     'Respiratoire'),
  ('Bronchite',             'Respiratoire'),
  -- Douleur
  ('Maux de tête',          'Douleur'),
  ('Douleurs articulaires', 'Douleur'),
  ('Douleurs musculaires',  'Douleur'),
  ('Règles douloureuses',   'Douleur'),
  -- Peau
  ('Plaies / Coupures',     'Peau'),
  ('Brûlures',              'Peau'),
  ('Infections cutanées',   'Peau'),
  ('Démangeaisons',         'Peau'),
  -- Bien-être
  ('Insomnie',              'Bien-être'),
  ('Anxiété / Stress',      'Bien-être'),
  ('Fatigue',               'Bien-être'),
  ('Manque d''appétit',     'Bien-être'),
  -- Autre
  ('Hypertension',          'Autre'),
  ('Diabète (soutien)',     'Autre'),
  ('Troubles prostatiques', 'Autre')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- ASSOCIATIONS PLANTE ↔ SYMPTÔME
-- ────────────────────────────────────────────────────────────

INSERT INTO plant_symptoms (plant_id, symptom_id)
SELECT p.id, s.id FROM plants p, symptoms s WHERE
  (p.name = 'Goyave (feuilles)'  AND s.name IN ('Diarrhée','Maux de ventre','Infections cutanées','Plaies / Coupures')) OR
  (p.name = 'Citronnelle'        AND s.name IN ('Insomnie','Anxiété / Stress','Fièvre','Maux de ventre','Paludisme')) OR
  (p.name = 'Gingembre sauvage'  AND s.name IN ('Nausées','Maux de ventre','Fièvre','Douleurs articulaires','Maux de tête','Grippe','Vomissements')) OR
  (p.name = 'Moringa'            AND s.name IN ('Fatigue','Manque d''appétit','Diabète (soutien)')) OR
  (p.name = 'Neem'               AND s.name IN ('Paludisme','Fièvre','Infections cutanées','Démangeaisons','Infections parasitaires')) OR
  (p.name = 'Aloe vera'          AND s.name IN ('Brûlures','Plaies / Coupures','Infections cutanées','Constipation')) OR
  (p.name = 'Eucalyptus'         AND s.name IN ('Toux','Rhume','Maux de gorge','Congestion nasale','Bronchite','Grippe')) OR
  (p.name = 'Papayer (feuilles)' AND s.name IN ('Paludisme','Fièvre','Maux de ventre','Infections parasitaires')) OR
  (p.name = 'Prunier africain'   AND s.name IN ('Troubles prostatiques','Fatigue')) OR
  (p.name = 'Basilic africain'   AND s.name IN ('Fièvre','Maux de ventre','Infections parasitaires','Diarrhée'))
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- DONNÉES — GLOSSAIRE
-- ────────────────────────────────────────────────────────────

INSERT INTO glossary (term, definition, category) VALUES
  ('Autosoin',       'Ensemble de pratiques par lesquelles une personne prend en charge sa propre santé sans intervention directe d''un professionnel médical, en utilisant des remèdes simples comme les plantes médicinales.', 'médical'),
  ('Contre-indication', 'Situation ou condition médicale dans laquelle un traitement ou un remède ne doit pas être utilisé car il peut être dangereux.', 'médical'),
  ('Décoction',      'Méthode d''extraction consistant à faire bouillir une plante dans de l''eau pendant 10 à 30 minutes pour en extraire les principes actifs. Convient aux parties dures : racines, écorces, graines.', 'préparation'),
  ('Infusion',       'Méthode d''extraction consistant à verser de l''eau bouillante sur une plante et à laisser macérer 5 à 15 minutes hors du feu. Convient aux parties fragiles : feuilles, fleurs, tiges.', 'préparation'),
  ('Macération',     'Trempage d''une plante dans un liquide froid (eau, huile, alcool) pendant plusieurs heures à plusieurs jours pour en extraire les principes actifs sans chaleur.', 'préparation'),
  ('Teinture mère',  'Extrait liquide obtenu par macération d''une plante fraîche dans l''alcool éthylique. Concentrée et longue conservation, utilisée en phytothérapie.', 'préparation'),
  ('Cataplasme',     'Application externe d''une préparation à base de plantes (fraîches pilées ou en décoction) directement sur la peau pour un effet local anti-inflammatoire ou cicatrisant.', 'préparation'),
  ('Phytothérapie',  'Branche de la médecine qui utilise les extraits de plantes et les principes actifs végétaux à des fins thérapeutiques. Reconnue par l''OMS comme médecine traditionnelle.', 'discipline'),
  ('Posologie',      'Quantité et fréquence avec lesquelles un médicament ou un remède doit être administré pour être efficace et sûr.', 'médical'),
  ('Pharmacopée',    'Collection officielle répertoriant les substances médicinales reconnues, leurs propriétés, compositions et modes d''utilisation. La pharmacopée africaine recense les plantes médicinales du continent.', 'discipline'),
  ('Plante médicinale', 'Espèce végétale dont une ou plusieurs parties (feuilles, racines, écorce, graines) contiennent des substances bénéfiques pour la santé humaine.', 'botanique'),
  ('Principe actif', 'Substance chimique présente dans une plante qui est responsable de l''effet thérapeutique observé.', 'biochimie'),
  ('Alcaloïde',      'Composé organique azoté d''origine végétale possédant des propriétés physiologiques puissantes. Ex : la quinine est un alcaloïde du quinquina.', 'biochimie'),
  ('Flavonoïde',     'Famille de composés phénoliques végétaux aux propriétés antioxydantes, anti-inflammatoires et immunostimulantes. Présents dans la plupart des fruits et légumes.', 'biochimie'),
  ('Tanin',          'Composé polyphénolique végétal aux propriétés astringentes et antibactériennes. Abondants dans les feuilles de goyave et les écorces.', 'biochimie'),
  ('Huile essentielle','Extrait aromatique concentré obtenu par distillation à la vapeur d''eau d''une plante. Très puissante, elle s''utilise toujours diluée.', 'préparation'),
  ('Herboriste',     'Personne spécialisée dans la connaissance, la culture, la récolte et la vente des plantes médicinales. En Afrique, ils sont souvent dépositaires de savoirs ancestraux.', 'profession'),
  ('Fébrifuge',      'Substance qui fait baisser la fièvre. De nombreuses plantes camerounaises comme le neem et le gingembre ont des propriétés fébrifuges.', 'médical'),
  ('Antipaludique',  'Médicament ou remède utilisé pour traiter ou prévenir le paludisme, maladie causée par le parasite Plasmodium transmis par les moustiques.', 'médical'),
  ('Toxicité',       'Capacité d''une substance à causer des effets nocifs sur l''organisme. Certaines plantes médicinales sont toxiques à forte dose ou pour certaines populations.', 'médical'),
  ('OMS',            'Organisation Mondiale de la Santé. Reconnait la médecine traditionnelle et encourage la documentation des plantes médicinales selon des critères scientifiques.', 'institution'),
  ('Médecine traditionnelle', 'Ensemble de pratiques, savoirs et remèdes basés sur les plantes et les croyances culturelles, transmis de génération en génération pour traiter les maladies.', 'discipline'),
  ('Interaction médicamenteuse', 'Modification des effets d''un médicament par une autre substance (médicament ou plante). Ex : le millepertuis diminue l''efficacité de nombreux médicaments.', 'médical'),
  ('Antioxydant',    'Substance qui neutralise les radicaux libres responsables du vieillissement cellulaire. Nombreuses plantes camerounaises (moringa, goyave) sont riches en antioxydants.', 'biochimie'),
  ('Ethnobotanique', 'Science qui étudie les relations entre les plantes et les différentes cultures humaines, notamment leurs usages médicinaux, alimentaires et rituels.', 'discipline')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- DONNÉES — CONSEILS ET REMÈDES
-- ────────────────────────────────────────────────────────────

INSERT INTO tips (title, content, season, plant_name, category, ingredients, steps, warning) VALUES
  ('Tisane de gingembre contre la fièvre et le rhume',
   'Le gingembre est le remède de référence des familles camerounaises contre les états grippaux. Sa combinaison avec le citron et le miel décuple ses propriétés anti-inflammatoires et immunostimulantes.',
   'pluies', 'Gingembre sauvage', 'fièvre',
   ARRAY['30g de gingembre frais','1 citron (jus)','2 cuillères à café de miel','500 ml d''eau','1 bâton de cannelle (optionnel)'],
   ARRAY['Peler et râper le gingembre frais','Porter l''eau à ébullition avec le gingembre et la cannelle','Laisser frémir 15 minutes','Filtrer la décoction','Ajouter le jus de citron et le miel hors du feu','Boire chaud, 3 tasses par jour'],
   'Ne pas dépasser 4g de gingembre par jour. Déconseillé aux personnes sous anticoagulants.'),

  ('Décoction de feuilles de goyave contre la diarrhée',
   'Les feuilles de goyave contiennent des tanins et des flavonoïdes qui ralentissent les contractions intestinales et combattent les bactéries responsables de la diarrhée. Efficacité prouvée scientifiquement.',
   'all', 'Goyave (feuilles)', 'digestif',
   ARRAY['15 jeunes feuilles de goyave','1 litre d''eau propre','Sel de réhydratation (optionnel)'],
   ARRAY['Laver soigneusement les feuilles à l''eau propre','Porter l''eau à ébullition','Ajouter les feuilles et laisser bouillir 20 minutes','Laisser refroidir et filtrer avec un linge propre','Boire 1 tasse (200ml) toutes les 4 heures'],
   'Si la diarrhée persiste plus de 48h ou s''accompagne de sang, consulter un médecin. Surveiller la déshydratation, surtout chez les enfants.'),

  ('Tisane de citronnelle pour le sommeil',
   'La citronnelle possède des propriétés sédatives douces qui favorisent la détente et améliorent la qualité du sommeil sans créer de dépendance.',
   'all', 'Citronnelle', 'bien-être',
   ARRAY['3 tiges de citronnelle fraîche','500 ml d''eau','1 cuillère de miel','Quelques feuilles de menthe (optionnel)'],
   ARRAY['Couper les tiges en tronçons de 5cm','Écraser légèrement pour libérer l''arôme','Porter l''eau à ébullition','Verser sur la citronnelle et infuser 12 minutes','Filtrer, ajouter le miel','Boire 30 minutes avant le coucher'],
   'Éviter en cas de grossesse. Ne pas associer avec des somnifères.'),

  ('Moringa — nutrition et immunité',
   'Le moringa est considéré par l''ONU comme une solution contre la malnutrition. Sa richesse en vitamines, minéraux et protéines en fait un complément alimentaire exceptionnel pour toute la famille.',
   'seche', 'Moringa', 'nutrition',
   ARRAY['Feuilles de moringa fraiches ou en poudre','1 à 2 cuillères à café de poudre de moringa'],
   ARRAY['Récolter les jeunes feuilles le matin','Laver et sécher à l''ombre 2 à 3 jours','Réduire en poudre fine','Ajouter à la bouillie, au riz ou aux sauces','Consommer quotidiennement'],
   'Éviter les racines de moringa (toxiques). Prudence si traitement antidiabétique ou antihypertenseur.'),

  ('Bain à l''Aloe vera pour les brûlures légères',
   'Le gel d''Aloe vera est le remède naturel le plus efficace contre les brûlures légères et les irritations cutanées. Son action cicatrisante et rafraîchissante est quasi immédiate.',
   'all', 'Aloe vera', 'peau',
   ARRAY['1 grande feuille d''Aloe vera','Eau froide propre'],
   ARRAY['Couper la feuille à la base','Laisser s''écouler le latex jaune-vert (2-3 minutes)','Peler la peau verte','Extraire le gel transparent avec une cuillère','Appliquer directement sur la brûlure refroidie','Renouveler 3 à 4 fois par jour'],
   'Toujours refroidir la brûlure à l''eau froide avant d''appliquer le gel. Ne jamais appliquer sur une brûlure grave. Le latex jaune est toxique, ne pas l''utiliser.'),

  ('Décoction de neem contre le paludisme (prévention)',
   'Les feuilles de neem contiennent de la nimbolide, une substance aux propriétés antiparasitaires reconnues. Utilisées en prévention lors de la saison des pluies au Cameroun.',
   'pluies', 'Neem', 'antipaludique',
   ARRAY['Une poignée de feuilles de neem fraiches (40-50 feuilles)','1 litre d''eau'],
   ARRAY['Laver les feuilles soigneusement','Porter l''eau à ébullition','Ajouter les feuilles et faire bouillir 25 minutes','Laisser refroidir totalement','Filtrer avec un linge propre','Boire 1 tasse le matin à jeun'],
   'En prévention uniquement. En cas de paludisme avéré, consulter immédiatement un médecin. Contre-indiqué femmes enceintes, enfants < 5 ans.')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- DONNÉES — GÉOLOCALISATION (Yaoundé)
-- ────────────────────────────────────────────────────────────

INSERT INTO locations (name, type, latitude, longitude, address, city, region, description) VALUES
  ('Marché Mokolo — Section herboristes', 'marche',       3.8721, 11.5021, 'Marché Mokolo', 'Yaoundé', 'Centre', 'Grand marché populaire avec de nombreux stands de plantes médicinales séchées et fraîches.'),
  ('Marché Central — Plantes médicinales','marche',       3.8685, 11.5174, 'Avenue Kennedy',  'Yaoundé', 'Centre', 'Section dédiée aux plantes médicinales au niveau du marché central.'),
  ('Herboristerie Mama Nature',          'herboristerie', 3.8802, 11.4985, 'Quartier Bastos', 'Yaoundé', 'Centre', 'Herboristerie spécialisée dans les plantes médicinales camerounaises, conseils personnalisés.'),
  ('Jardin médicinal de l''IAI',         'zone_cueillette',3.8650,11.5102,'Ngoa-Ekele',      'Yaoundé', 'Centre', 'Jardin botanique avec plantes médicinales endémiques du Cameroun, visite sur rendez-vous.'),
  ('Marché Mboppi — Plantes fraîches',  'marche',        4.0444, 9.7040,  'Marché Mboppi',   'Douala',  'Littoral','Marché de Douala avec vendeurs de plantes médicinales fraîches et séchées.'),
  ('Marché de Bafoussam',               'marche',        5.4781, 10.4179, 'Centre-ville',    'Bafoussam','Ouest', 'Marché avec forte tradition de médecine traditionnelle, région riche en plantes endémiques.')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- TABLE : herboriste_applications (Demandes d'inscription herboristes en attente)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS herboriste_applications (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email        TEXT NOT NULL UNIQUE,
  password     TEXT NOT NULL,
  display_name TEXT NOT NULL,
  status       TEXT DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'approuve', 'rejete')),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE herboriste_applications ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- AJOUT AUTEUR AUX CONSEILS (herboriste qui publie)
-- ────────────────────────────────────────────────────────────

ALTER TABLE tips ADD COLUMN IF NOT EXISTS author_id   uuid REFERENCES profiles(id);
ALTER TABLE tips ADD COLUMN IF NOT EXISTS author_name text;

-- ────────────────────────────────────────────────────────────
-- TABLE : side_effect_reports (Signalements d'effets secondaires)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS side_effect_reports (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id              uuid REFERENCES tips(id) ON DELETE CASCADE NOT NULL,
  user_id             uuid REFERENCES profiles(id) NOT NULL,
  user_name           text DEFAULT 'Utilisateur',
  description         text NOT NULL,
  herboriste_response text,
  herboriste_id       uuid REFERENCES profiles(id),
  herboriste_name     text,
  status              text DEFAULT 'en_attente'
                        CHECK (status IN ('en_attente', 'repondu')),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE side_effect_reports ENABLE ROW LEVEL SECURITY;

-- Tous les utilisateurs connectés peuvent lire les signalements
CREATE POLICY "reports_read"   ON side_effect_reports
  FOR SELECT TO authenticated USING (true);

-- Un utilisateur ne peut signaler qu'en son nom
CREATE POLICY "reports_insert" ON side_effect_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Herboristes et admins peuvent répondre (UPDATE)
CREATE POLICY "reports_update" ON side_effect_reports
  FOR UPDATE TO authenticated USING (true);

