'use client'

import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Search, X } from 'lucide-react'
import SideEffectsSection from './SideEffectsSection'

const C = { primary:'#22c55e', primaryDark:'#166534', primaryLight:'#dcfce7', beige:'#F1EFE6', text:'#616161', bg:'#F8FAF5', white:'#FFFFFF', border:'#E8EDE4' }

export type SideEffectReport = {
  id: string
  tip_id: string
  user_id: string
  user_name: string | null
  description: string
  herboriste_response: string | null
  herboriste_name: string | null
  status: 'en_attente' | 'repondu'
  created_at: string
}

export type TipItem = {
  id: string
  title: string
  content: string
  season: string
  plant_name: string | null
  category: string
  ingredients: string[] | null
  steps: string[] | null
  warning: string | null
  author_name?: string | null
  side_effect_reports?: SideEffectReport[]
}

const SEASON_MAP: Record<string, string> = { all:"Toute l'année", pluies:'Saison des pluies', seche:'Saison sèche' }
const SEASON_ICONS: Record<string, string> = { all:'🌍', pluies:'🌧️', seche:'☀️' }

const CAT_COLORS: Record<string, { bg:string; text:string }> = {
  fièvre:        { bg:'#DBEAFE', text:'#1D4ED8' },
  digestif:      { bg:C.primaryLight, text:C.primaryDark },
  'bien-être':   { bg:C.primaryLight, text:C.primaryDark },
  nutrition:     { bg:'#FFF8E8', text:'#D97706' },
  peau:          { bg:'#F3E8FF', text:'#6B21A8' },
  antipaludique: { bg:'#E8F5E8', text:'#2E7D32' },
  santé:         { bg:C.primaryLight, text:C.primaryDark },
}

const PLANT_COLORS = [C.primaryLight,'#FFFDE8','#FFF8E8','#FFF0F0','#F0EFF0','#E8F5E8','#EFF6FF','#F3E8FF']
const PLANT_EMOJI: Record<string,string> = { Goyave:'🍃',Citronnelle:'🌾',Gingembre:'🫚',Moringa:'🌱',Neem:'🍀',Aloe:'🪴',Eucalyptus:'🌿',Papayer:'🍃',Basilic:'🌿',Prunier:'🌲' }
const plantEmoji = (n:string|null) => { if(!n) return '🌿'; const k=Object.keys(PLANT_EMOJI).find(k=>n.includes(k)); return k?PLANT_EMOJI[k]:'🌿' }

const FILTER_OPTIONS = ["Toutes saisons", "Toute l'année", "Saison des pluies", "Saison sèche"]

export default function ConseilsClient({
  tips,
  currentUserId,
  currentUserRole,
}: {
  tips: TipItem[]
  currentUserId: string | null
  currentUserRole: string | null
}) {
  const [activeSeason, setActiveSeason] = useState("Toutes saisons")
  const [expandedId,   setExpandedId]   = useState<string | null>(null)
  const [search,       setSearch]       = useState('')

  const filtered = tips
    .filter(t => activeSeason === "Toutes saisons" || SEASON_MAP[t.season] === activeSeason)
    .filter(t => {
      const q = search.trim().toLowerCase()
      if (!q) return true
      return (
        t.title.toLowerCase().includes(q) ||
        (t.plant_name ?? '').toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        (t.author_name ?? '').toLowerCase().includes(q)
      )
    })

  return (
    <>
      {/* Barre de recherche */}
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9AA49A', pointerEvents: 'none', display: 'flex' }}>
          <Search style={{ width: 16, height: 16 }} />
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un conseil, une plante, une catégorie..."
          style={{ width: '100%', height: 46, paddingLeft: 42, paddingRight: search ? 40 : 16, borderRadius: 14, border: `1.5px solid ${search ? C.primaryDark : C.border}`, fontSize: 14, outline: 'none', background: C.white, boxSizing: 'border-box', fontFamily: 'inherit', color: '#111' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9AA49A', display: 'flex', alignItems: 'center', padding: 4 }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>

      {/* Filtres saison */}
      <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:32, flexWrap:'wrap' }}>
        {FILTER_OPTIONS.map(s => (
          <button key={s} onClick={() => setActiveSeason(s)} style={{ height:42, padding:'0 20px', borderRadius:999, border:`2px solid ${activeSeason===s ? C.primaryDark : C.border}`, background:activeSeason===s ? C.primaryDark : C.white, color:activeSeason===s ? C.white : '#3D3D3D', fontSize:14, fontWeight:600, cursor:'pointer' }}>
            {s === "Toutes saisons" ? "🌍 Toutes saisons" : s === "Toute l'année" ? "🌍 Toute l'année" : s === "Saison des pluies" ? "🌧️ Saison des pluies" : "☀️ Saison sèche"}
          </button>
        ))}
      </div>

      {/* Compteur */}
      <div style={{ fontSize:14, color:C.text, marginBottom:24, textAlign:'center' }}>
        {filtered.length} conseil{filtered.length > 1 ? 's' : ''} {search ? 'trouvé' : 'disponible'}{filtered.length > 1 ? 's' : ''}
        {search && <span style={{ marginLeft: 8, color: C.primaryDark, fontWeight: 600 }}>pour «&nbsp;{search}&nbsp;»</span>}
      </div>

      {/* Aucun résultat */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: C.text }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>Aucun résultat</p>
          <p style={{ fontSize: 13 }}>Essayez un autre mot-clé ou changez de filtre de saison.</p>
        </div>
      )}

      {/* Cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {filtered.map((tip, i) => {
          const isExpanded  = expandedId === tip.id
          const badge       = CAT_COLORS[tip.category.toLowerCase()] ?? { bg:C.beige, text:'#5D4037' }
          const seasonLabel = SEASON_MAP[tip.season] ?? tip.season
          const seasonIcon  = SEASON_ICONS[tip.season] ?? '🌍'
          const reports     = tip.side_effect_reports ?? []

          return (
            <div key={tip.id} style={{ background:C.white, borderRadius:22, border:`1.5px solid ${isExpanded ? C.primaryDark : C.border}`, overflow:'hidden' }}>

              {/* Header cliquable */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : tip.id)}
                style={{ padding:'20px 24px', cursor:'pointer', display:'flex', alignItems:'center', gap:16 }}
              >
                <div style={{ width:64, height:64, background:PLANT_COLORS[i % PLANT_COLORS.length], borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0 }}>
                  {plantEmoji(tip.plant_name)}
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <h3 style={{ fontSize:17, fontWeight:700, color:'#111', fontFamily:"'Poppins',sans-serif", marginBottom:6 }}>
                    {tip.title}
                  </h3>
                  <div style={{ display:'flex', gap:7, flexWrap:'wrap', alignItems:'center' }}>
                    <span style={{ height:24, padding:'0 10px', background:badge.bg, borderRadius:7, fontSize:11, fontWeight:600, color:badge.text, display:'inline-flex', alignItems:'center' }}>
                      {tip.category}
                    </span>
                    <span style={{ height:24, padding:'0 10px', background:C.beige, borderRadius:7, fontSize:11, fontWeight:500, color:'#5D4037', display:'inline-flex', alignItems:'center' }}>
                      {seasonIcon} {seasonLabel}
                    </span>
                    {tip.plant_name && (
                      <span style={{ height:24, padding:'0 10px', background:'#F4F4F4', borderRadius:7, fontSize:11, color:'#555', display:'inline-flex', alignItems:'center' }}>
                        {tip.plant_name}
                      </span>
                    )}
                    {tip.author_name && (
                      <span style={{ height:24, padding:'0 10px', background:C.primaryLight, borderRadius:7, fontSize:11, color:C.primaryDark, fontWeight:600, display:'inline-flex', alignItems:'center', gap:4 }}>
                        🌿 {tip.author_name}
                      </span>
                    )}
                    {reports.length > 0 && (
                      <span style={{ height:24, padding:'0 9px', background:'#FEF3C7', borderRadius:7, fontSize:11, color:'#92400E', fontWeight:600, display:'inline-flex', alignItems:'center', gap:3 }}>
                        ⚠️ {reports.length} signalement{reports.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ width:34, height:34, borderRadius:10, background:isExpanded ? C.primaryLight : '#F4F4F4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {isExpanded
                    ? <ChevronUp   style={{ width:17, height:17, color:C.primaryDark }}/>
                    : <ChevronDown style={{ width:17, height:17, color:'#666' }}/>
                  }
                </div>
              </div>

              {/* Contenu expansé */}
              {isExpanded && (
                <div style={{ padding:'0 24px 24px', borderTop:`1px solid ${C.border}` }}>
                  <div style={{ paddingTop:18 }}>
                    <p style={{ fontSize:14, color:'#333', lineHeight:'23px', marginBottom:20 }}>{tip.content}</p>

                    <div className="tb-grid-half" style={{ gap:20 }}>
                      {tip.ingredients && tip.ingredients.length > 0 && (
                        <div>
                          <h4 style={{ fontSize:13, fontWeight:700, color:C.primaryDark, marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>Ingrédients</h4>
                          <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:7 }}>
                            {tip.ingredients.map((ing,j) => (
                              <li key={j} style={{ display:'flex', alignItems:'flex-start', gap:9, fontSize:13, color:'#333' }}>
                                <span style={{ width:18, height:18, background:C.primaryLight, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:C.primaryDark, flexShrink:0, marginTop:1 }}>✓</span>
                                {ing}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {tip.steps && tip.steps.length > 0 && (
                        <div>
                          <h4 style={{ fontSize:13, fontWeight:700, color:C.primaryDark, marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>Préparation</h4>
                          <ol style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:7 }}>
                            {tip.steps.map((step,j) => (
                              <li key={j} style={{ display:'flex', alignItems:'flex-start', gap:9, fontSize:13, color:'#333', lineHeight:'19px' }}>
                                <span style={{ width:20, height:20, background:C.primaryDark, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:C.white, flexShrink:0 }}>{j+1}</span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>

                    {tip.warning && (
                      <div style={{ marginTop:18, background:'#FFF8E8', border:'1px solid #FDE68A', borderRadius:12, padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                        <AlertTriangle style={{ width:15, height:15, color:'#D97706', flexShrink:0, marginTop:1 }}/>
                        <span style={{ fontSize:13, color:'#92400E', lineHeight:'20px' }}>{tip.warning}</span>
                      </div>
                    )}

                    {/* Section effets secondaires */}
                    <SideEffectsSection
                      tipId={tip.id}
                      reports={reports}
                      currentUserId={currentUserId}
                      currentUserRole={currentUserRole}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
