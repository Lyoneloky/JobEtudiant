'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Activity, AlertTriangle, ChevronRight, Search, X } from 'lucide-react'

const C = { primary: '#22c55e', dark: '#166534', light: '#dcfce7', beige: '#F1EFE6', blue: '#2196F3', text: '#616161', border: '#E8EDE4', white: '#FFFFFF', bg: '#F8FAF5' }

/* ── DONNÉES STATIQUES (fallback si Supabase non configuré) ── */
const STATIC_CATEGORIES = [
  { name: 'Digestif', emoji: '🫁', color: '#E8F5E9', symptoms: ['Diarrhée','Maux de ventre','Constipation','Nausées','Vomissements','Ballonnements'] },
  { name: 'Fièvre / Infectieux', emoji: '🌡️', color: '#FFF3E0', symptoms: ['Fièvre','Paludisme','Grippe','Infections parasitaires'] },
  { name: 'Respiratoire', emoji: '🌬️', color: '#E3F2FD', symptoms: ['Toux','Rhume','Maux de gorge','Congestion nasale','Bronchite'] },
  { name: 'Douleur', emoji: '💊', color: '#FCE4EC', symptoms: ['Maux de tête','Douleurs articulaires','Douleurs musculaires','Règles douloureuses'] },
  { name: 'Peau', emoji: '🌿', color: '#F3E5F5', symptoms: ['Plaies / Coupures','Brûlures','Infections cutanées','Démangeaisons'] },
  { name: 'Bien-être', emoji: '🌙', color: '#E8EAF6', symptoms: ['Insomnie','Anxiété / Stress','Fatigue','Manque d\'appétit'] },
  { name: 'Autre', emoji: '⚕️', color: '#F9FBE7', symptoms: ['Hypertension','Diabète (soutien)','Troubles prostatiques'] },
]

const STATIC_PLANT_MAP: Record<string, { name: string; latin: string; properties: string[]; preparation: string; warning: string }[]> = {
  'Diarrhée':            [{ name: 'Goyave (feuilles)', latin: 'Psidium guajava', properties: ['Anti-diarrhéique','Antibactérien'], preparation: 'Décoction de 15 feuilles dans 1L d\'eau, 20 min. Boire 3 fois/jour.', warning: 'Si la diarrhée dure plus de 48h, consultez un médecin.' }],
  'Maux de ventre':      [{ name: 'Gingembre sauvage', latin: 'Zingiber officinale', properties: ['Antispasmodique','Digestif'], preparation: 'Infusion de gingembre râpé dans eau bouillante, 10 min. 3 tasses/jour.', warning: 'Max 4g de gingembre/jour.' }],
  'Nausées':             [{ name: 'Gingembre sauvage', latin: 'Zingiber officinale', properties: ['Anti-nauséeux','Digestif'], preparation: 'Mâcher un petit morceau de gingembre frais ou infusion légère.', warning: 'Déconseillé sous anticoagulants.' }],
  'Fièvre':              [{ name: 'Gingembre sauvage', latin: 'Zingiber officinale', properties: ['Fébrifuge','Anti-inflammatoire'], preparation: 'Décoction de gingembre + citron + miel. 3 tasses/jour.', warning: 'Si fièvre > 39°C et persiste 48h, consulter d\'urgence.' }, { name: 'Neem', latin: 'Azadirachta indica', properties: ['Fébrifuge','Antipaludique'], preparation: 'Décoction de 40 feuilles dans 1L d\'eau, 20 min. 1 tasse 3x/jour.', warning: 'Contre-indiqué femmes enceintes et enfants < 5 ans.' }],
  'Paludisme':           [{ name: 'Neem', latin: 'Azadirachta indica', properties: ['Antipaludique','Fébrifuge'], preparation: 'Décoction de feuilles, 1 tasse 3x/jour pendant 5-7 jours.', warning: 'En cas de paludisme grave (accès pernicieux), urgence médicale immédiate.' }, { name: 'Citronnelle', latin: 'Cymbopogon citratus', properties: ['Antipaludique','Fébrifuge'], preparation: 'Tisane de citronnelle + gingembre. En prévention, brûler des tiges pour éloigner les moustiques.', warning: 'Complément au traitement médical uniquement.' }],
  'Grippe':              [{ name: 'Eucalyptus', latin: 'Eucalyptus globulus', properties: ['Décongestionnant','Antiseptique'], preparation: 'Inhalation vapeur avec feuilles d\'eucalyptus, 2x/jour 10 min.', warning: 'Déconseillé aux enfants < 6 ans.' }, { name: 'Gingembre sauvage', latin: 'Zingiber officinale', properties: ['Anti-grippal','Fébrifuge'], preparation: 'Décoction concentrée avec citron et miel. 3 tasses/jour.', warning: 'Max 4g de gingembre/jour.' }],
  'Toux':                [{ name: 'Eucalyptus', latin: 'Eucalyptus globulus', properties: ['Expectorant','Bronchodilatateur'], preparation: 'Bain vapeur avec feuilles d\'eucalyptus 2x/jour. Tisane : 1 tasse 3x/jour.', warning: 'Si toux persiste > 2 semaines, consulter.' }],
  'Rhume':               [{ name: 'Eucalyptus', latin: 'Eucalyptus globulus', properties: ['Décongestionnant','Antiseptique'], preparation: 'Inhalation vapeur d\'eucalyptus 2x/jour, 10-15 min.', warning: 'Ne pas appliquer l\'huile essentielle pure sur la peau.' }],
  'Maux de gorge':       [{ name: 'Eucalyptus', latin: 'Eucalyptus globulus', properties: ['Antiseptique','Anti-inflammatoire'], preparation: 'Infusion de feuilles, gargarismes 3x/jour.', warning: 'Si angine avec fièvre, consulter un médecin.' }],
  'Maux de tête':        [{ name: 'Gingembre sauvage', latin: 'Zingiber officinale', properties: ['Analgésique','Anti-inflammatoire'], preparation: 'Infusion de gingembre. Cataplasme de feuilles fraîches écrasées sur le front.', warning: 'En cas de maux de tête très intenses ou soudains, consulter.' }],
  'Douleurs articulaires':[{ name: 'Gingembre sauvage', latin: 'Zingiber officinale', properties: ['Anti-inflammatoire','Analgésique'], preparation: 'Cataplasme de gingembre râpé sur la zone douloureuse. Infusion 3x/jour.', warning: 'Max 4g/jour en interne.' }],
  'Plaies / Coupures':   [{ name: 'Aloe vera', latin: 'Aloe barbadensis miller', properties: ['Cicatrisant','Antibactérien'], preparation: 'Appliquer le gel pur directement sur la plaie propre. Renouveler 3x/jour.', warning: 'Ne pas utiliser le latex jaune. Plaie profonde = consultation médecin.' }, { name: 'Goyave (feuilles)', latin: 'Psidium guajava', properties: ['Antiseptique','Cicatrisant'], preparation: 'Décoction refroidie en bain local 2x/jour.', warning: 'Laver soigneusement avant application.' }],
  'Brûlures':            [{ name: 'Aloe vera', latin: 'Aloe barbadensis miller', properties: ['Cicatrisant','Rafraîchissant'], preparation: 'Refroidir à l\'eau froide d\'abord. Appliquer le gel frais 3-4x/jour.', warning: 'Brûlure grave (> 2 cm²) = urgence médicale.' }],
  'Infections cutanées': [{ name: 'Neem', latin: 'Azadirachta indica', properties: ['Antibactérien','Antifongique'], preparation: 'Huile de neem diluée (5 gouttes dans 10ml huile végétale). Application locale 2x/jour.', warning: 'Ne jamais appliquer l\'huile pure. Test cutané recommandé.' }],
  'Insomnie':            [{ name: 'Citronnelle', latin: 'Cymbopogon citratus', properties: ['Calmante','Sédative'], preparation: 'Tisane de 3 tiges de citronnelle, 12 min d\'infusion. Boire 30 min avant le coucher.', warning: 'Éviter en cas de grossesse.' }],
  'Anxiété / Stress':    [{ name: 'Citronnelle', latin: 'Cymbopogon citratus', properties: ['Anxiolytique','Calmante'], preparation: 'Tisane de citronnelle, 1-2 tasses/jour. Bain aromatique possible.', warning: 'Ne pas associer avec somnifères.' }],
  'Fatigue':             [{ name: 'Moringa', latin: 'Moringa oleifera', properties: ['Nutritif','Tonique'], preparation: '1 à 2 cuillères à café de poudre de moringa dans la bouillie ou sauce. 1x/jour.', warning: 'Prudence si traitement antidiabétique en cours.' }],
  'Manque d\'appétit':   [{ name: 'Moringa', latin: 'Moringa oleifera', properties: ['Nutritif','Stimulant appétit'], preparation: 'Poudre de feuilles dans les repas quotidiens.', warning: 'Éviter les racines de moringa.' }],
  'Diabète (soutien)':   [{ name: 'Moringa', latin: 'Moringa oleifera', properties: ['Hypoglycémiant'], preparation: 'Infusion de feuilles fraîches, 1 tasse matin à jeun.', warning: 'Soutien uniquement. Ne jamais remplacer le traitement médical du diabète.' }],
  'Troubles prostatiques':[{ name: 'Prunier africain', latin: 'Prunus africana', properties: ['Anti-prostate','Tonique'], preparation: 'Décoction d\'écorce séchée, 1 tasse matin et soir. Cure de 3 semaines.', warning: 'Utilisation uniquement sous supervision médicale pour problèmes prostatiques graves.' }],
  'Infections parasitaires':[{ name: 'Neem', latin: 'Azadirachta indica', properties: ['Antiparasitaire','Antibactérien'], preparation: 'Décoction de feuilles, 1 tasse 2x/jour pendant 7 jours.', warning: 'Contre-indiqué femmes enceintes.' }, { name: 'Papayer (feuilles)', latin: 'Carica papaya', properties: ['Antiparasitaire'], preparation: 'Jus de feuilles fraîches, 2 cuillères à soupe 2x/jour pendant 5 jours.', warning: 'Contre-indiqué grossesse. Goût très amer.' }],
}

interface SymptomRow { id: string; name: string; category: string }
interface PlantRow { id?: string; name: string; latin_name?: string | null; properties?: string[]; usage?: string | null; contraindications?: string | null }
interface PlantSymptomRow { symptom_id: string; plants: PlantRow | null }

interface Props {
  symptomsDb: SymptomRow[]
  plantsDb: PlantSymptomRow[]
  initialSelected?: string
}

export default function SymptomesClient({ symptomsDb, plantsDb, initialSelected }: Props) {
  const [selected, setSelected] = useState<string | null>(initialSelected ?? null)
  const [search, setSearch] = useState('')

  // Construire la map symptôme → plantes depuis la DB
  const dbPlantMap = useMemo(() => {
    const map: Record<string, PlantRow[]> = {}
    for (const row of plantsDb) {
      if (!row.plants) continue
      const symptomId = row.symptom_id
      // Trouver le nom du symptôme
      const sym = symptomsDb.find(s => s.id === symptomId)
      if (!sym) continue
      if (!map[sym.name]) map[sym.name] = []
      if (!map[sym.name].find(p => p.name === row.plants!.name)) {
        map[sym.name].push(row.plants)
      }
    }
    return map
  }, [symptomsDb, plantsDb])

  // Catégories depuis DB ou fallback statique
  const categories = useMemo(() => {
    if (symptomsDb.length === 0) return STATIC_CATEGORIES
    const cats: Record<string, string[]> = {}
    for (const s of symptomsDb) {
      if (!cats[s.category]) cats[s.category] = []
      cats[s.category].push(s.name)
    }
    const catColors = ['#E8F5E9','#FFF3E0','#E3F2FD','#FCE4EC','#F3E5F5','#E8EAF6','#F9FBE7','#E0F7FA']
    const catEmojis: Record<string, string> = { 'Digestif':'🫁','Fièvre / Infectieux':'🌡️','Respiratoire':'🌬️','Douleur':'💊','Peau':'🌿','Bien-être':'🌙','Autre':'⚕️' }
    return Object.entries(cats).map(([name, symptoms], i) => ({
      name, emoji: catEmojis[name] ?? '🌿', color: catColors[i % catColors.length], symptoms
    }))
  }, [symptomsDb])

  // Plantes suggérées pour le symptôme sélectionné
  const suggestedPlants = useMemo(() => {
    if (!selected) return []
    const fromDb = dbPlantMap[selected]
    if (fromDb && fromDb.length > 0) {
      return fromDb.map(p => ({
        name: p.name,
        latin: p.latin_name ?? '',
        properties: p.properties ?? [],
        preparation: p.usage ?? 'Consulter la fiche détaillée pour la préparation.',
        warning: p.contraindications ?? '',
        id: (p as { id?: string }).id,
      }))
    }
    // Fallback statique
    const staticPlants = STATIC_PLANT_MAP[selected] ?? []
    return staticPlants.map(p => ({ ...p, id: undefined }))
  }, [selected, dbPlantMap])

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories
    const q = search.toLowerCase()
    return categories
      .map(cat => ({ ...cat, symptoms: cat.symptoms.filter(s => s.toLowerCase().includes(q)) }))
      .filter(cat => cat.symptoms.length > 0)
  }, [categories, search])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 34, padding: '0 14px', background: C.light, borderRadius: 999, marginBottom: 16 }}>
          <Activity style={{ width: 15, height: 15, color: C.dark }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>RECHERCHE PAR SYMPTÔME</span>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: '#111', fontFamily: "'Poppins', sans-serif", lineHeight: '50px', marginBottom: 12 }}>
          Quel symptôme<br />ressentez-vous ?
        </h1>
        <p style={{ fontSize: 17, color: C.text, lineHeight: '28px', maxWidth: 560 }}>
          Cliquez sur un symptôme pour découvrir les plantes médicinales camerounaises adaptées et leurs modes de préparation.
        </p>
      </div>

      {/* Barre de recherche */}
      <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 12, marginBottom: 32, maxWidth: 480, height: 52 }}>
        <Search style={{ width: 18, height: 18, color: '#9AA49A', flexShrink: 0 }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filtrer les symptômes..."
          style={{ border: 'none', outline: 'none', fontSize: 15, color: '#222', background: 'transparent', flex: 1 }}
        />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9AA49A', display: 'flex' }}><X style={{ width: 16, height: 16 }} /></button>}
      </div>

      {/* Grille catégories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 40 }}>
        {filteredCategories.map(cat => (
          <div key={cat.name} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(22,101,52,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, background: cat.color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{cat.emoji}</div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#222', fontFamily: "'Poppins', sans-serif" }}>{cat.name}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cat.symptoms.map(sym => (
                <button
                  key={sym}
                  onClick={() => setSelected(selected === sym ? null : sym)}
                  style={{
                    height: 34, padding: '0 14px', borderRadius: 10,
                    background: selected === sym ? C.dark : C.beige,
                    color: selected === sym ? C.white : '#444',
                    border: selected === sym ? 'none' : `1px solid ${C.border}`,
                    fontSize: 13, fontWeight: selected === sym ? 600 : 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Résultats */}
      {selected && (
        <div style={{ background: C.white, borderRadius: 28, border: `1px solid ${C.border}`, padding: 32, boxShadow: '0 8px 32px rgba(22,101,52,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', fontFamily: "'Poppins', sans-serif", marginBottom: 4 }}>
                Plantes pour : <span style={{ color: C.dark }}>{selected}</span>
              </h2>
              <p style={{ fontSize: 14, color: C.text }}>{suggestedPlants.length} plante{suggestedPlants.length > 1 ? 's' : ''} recommandée{suggestedPlants.length > 1 ? 's' : ''}</p>
            </div>
            <button onClick={() => setSelected(null)} style={{ height: 36, padding: '0 16px', background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 10, fontSize: 13, color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <X style={{ width: 14, height: 14 }} /> Fermer
            </button>
          </div>

          {suggestedPlants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.text }}>
              <Activity style={{ width: 40, height: 40, color: '#D0D0D0', margin: '0 auto 12px' }} />
              <p>Aucune plante enregistrée pour ce symptôme.</p>
              <Link href="/consultation" style={{ color: C.dark, fontWeight: 600, textDecoration: 'none' }}>→ Demander une consultation personnalisée</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {suggestedPlants.map((plant, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, padding: '20px 0', borderBottom: i < suggestedPlants.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#111', fontFamily: "'Poppins', sans-serif" }}>{plant.name}</span>
                      {plant.latin && <span style={{ fontSize: 13, color: C.text, fontStyle: 'italic' }}>{plant.latin}</span>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {plant.properties.map(p => (
                        <span key={p} style={{ height: 24, padding: '0 10px', background: C.light, borderRadius: 8, fontSize: 11, fontWeight: 600, color: C.dark, display: 'inline-flex', alignItems: 'center' }}>{p}</span>
                      ))}
                    </div>
                    <div style={{ background: C.beige, borderRadius: 12, padding: '12px 16px', marginBottom: 10 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 4 }}>Préparation :</p>
                      <p style={{ fontSize: 14, color: '#333', lineHeight: '22px', margin: 0 }}>{plant.preparation}</p>
                    </div>
                    {plant.warning && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <AlertTriangle style={{ width: 14, height: 14, color: '#E65100', flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: 13, color: '#E65100', margin: 0, lineHeight: '20px' }}>{plant.warning}</p>
                      </div>
                    )}
                  </div>
                  {plant.id && (
                    <Link href={`/plantes/${plant.id}`}
                      style={{ height: 40, padding: '0 16px', background: C.dark, color: C.white, borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                      Voir la fiche <ChevronRight style={{ width: 14, height: 14 }} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CTA Consultation */}
          <div style={{ marginTop: 24, padding: '18px 24px', background: C.light, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.dark, marginBottom: 4 }}>Besoin d'un conseil personnalisé ?</p>
              <p style={{ fontSize: 13, color: C.text }}>Décrivez votre situation en détail pour une recommandation adaptée.</p>
            </div>
            <Link href="/consultation"
              style={{ height: 44, padding: '0 20px', background: C.dark, color: C.white, borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Demander une consultation <ChevronRight style={{ width: 15, height: 15 }} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
