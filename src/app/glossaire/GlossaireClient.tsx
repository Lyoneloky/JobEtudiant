'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'

const C = { primary:'#22c55e', primaryDark:'#166534', primaryLight:'#dcfce7', beige:'#F1EFE6', text:'#616161', bg:'#F8FAF5', white:'#FFFFFF', border:'#E8EDE4' }

export type GlossaryTerm = { id?: string; term: string; definition: string; category: string }

const CAT_COLORS: Record<string, { bg:string; text:string }> = {
  médical:        { bg:'#EFF6FF', text:'#1565C0' },
  médecine:       { bg:'#EFF6FF', text:'#1565C0' },
  préparation:    { bg:'#FFF8E8', text:'#D4A017' },
  discipline:     { bg:C.primaryLight, text:C.primaryDark },
  phytothérapie:  { bg:C.primaryLight, text:C.primaryDark },
  botanique:      { bg:'#E8F5E8', text:'#2E7D32' },
  biochimie:      { bg:'#F3E8FF', text:'#6B21A8' },
  profession:     { bg:'#FFF3F0', text:'#E05D3A' },
  institution:    { bg:'#F0F9FF', text:'#0369A1' },
  technologie:    { bg:'#F3E8FF', text:'#6B21A8' },
  général:        { bg:C.beige,   text:'#5D4037' },
}

export default function GlossaireClient({ terms }: { terms: GlossaryTerm[] }) {
  const [search,       setSearch]       = useState('')
  const [activeLetter, setActiveLetter] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return terms.filter(t => {
      const matchSearch = !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
      const matchLetter = !activeLetter || t.term.toUpperCase().startsWith(activeLetter)
      return matchSearch && matchLetter
    })
  }, [search, activeLetter, terms])

  const availableLetters = useMemo(() => {
    const s = new Set(terms.map(t => t.term[0].toUpperCase()))
    return Array.from(s).sort()
  }, [terms])

  const grouped = useMemo(() => {
    const g: Record<string, GlossaryTerm[]> = {}
    for (const t of filtered) {
      const l = t.term[0].toUpperCase()
      if (!g[l]) g[l] = []
      g[l].push(t)
    }
    return g
  }, [filtered])

  return (
    <>
      {/* Recherche */}
      <div style={{ position:'relative', marginBottom:28 }}>
        <Search style={{ position:'absolute', left:18, top:'50%', transform:'translateY(-50%)', width:18, height:18, color:'#9AA49A' }}/>
        <input
          type="text"
          placeholder="Rechercher un terme..."
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveLetter(null) }}
          style={{ width:'100%', height:54, paddingLeft:50, paddingRight:20, borderRadius:16, border:`1.5px solid ${C.border}`, background:C.white, fontSize:15, color:'#111', outline:'none', boxSizing:'border-box' as const }}
        />
      </div>

      {/* Alphabet */}
      <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:32 }}>
        <button onClick={() => setActiveLetter(null)}
          style={{ height:36, padding:'0 12px', borderRadius:9, border:`1.5px solid ${activeLetter===null ? C.primaryDark : C.border}`, background:activeLetter===null ? C.primaryDark : C.white, color:activeLetter===null ? C.white : '#3D3D3D', fontSize:12, fontWeight:700, cursor:'pointer' }}>
          Tout
        </button>
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
          const has = availableLetters.includes(letter)
          return (
            <button key={letter} onClick={() => has ? setActiveLetter(activeLetter===letter ? null : letter) : undefined} disabled={!has}
              style={{ width:36, height:36, borderRadius:9, border:`1.5px solid ${activeLetter===letter ? C.primaryDark : C.border}`, background:activeLetter===letter ? C.primaryDark : has ? C.white : '#F4F4F4', color:activeLetter===letter ? C.white : has ? '#3D3D3D' : '#BDBDBD', fontSize:12, fontWeight:700, cursor:has ? 'pointer' : 'not-allowed' }}>
              {letter}
            </button>
          )
        })}
      </div>

      <div style={{ fontSize:13, color:C.text, marginBottom:28 }}>
        {filtered.length} terme{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
      </div>

      {/* Termes groupés */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:C.text }}>
          <div style={{ fontSize:44, marginBottom:14 }}>🔍</div>
          <div style={{ fontSize:17, fontWeight:600, marginBottom:6 }}>Aucun terme trouvé</div>
          <div style={{ fontSize:13 }}>Essayez un autre terme de recherche.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:36 }}>
          {Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([letter, items]) => (
            <div key={letter}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                <div style={{ width:48, height:48, background:C.primaryDark, borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:22, fontWeight:800, color:C.white, fontFamily:"'Poppins',sans-serif" }}>{letter}</span>
                </div>
                <div style={{ height:2, flex:1, background:C.border }}/>
                <span style={{ fontSize:12, color:C.text }}>{items.length} terme{items.length>1?'s':''}</span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {items.map((t, i) => {
                  const cat = CAT_COLORS[t.category.toLowerCase()] ?? { bg:C.beige, text:'#5D4037' }
                  return (
                    <div key={i} style={{ background:C.white, borderRadius:16, padding:'18px 22px', border:`1px solid ${C.border}` }}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
                        <span style={{ fontSize:16, fontWeight:800, color:'#111', fontFamily:"'Poppins',sans-serif", flex:1 }}>{t.term}</span>
                        <span style={{ height:24, padding:'0 10px', background:cat.bg, borderRadius:7, fontSize:11, fontWeight:600, color:cat.text, display:'inline-flex', alignItems:'center', flexShrink:0 }}>{t.category}</span>
                      </div>
                      <p style={{ fontSize:13, color:'#444', lineHeight:'21px' }}>{t.definition}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
