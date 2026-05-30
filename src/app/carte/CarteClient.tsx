'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { MapPin, ChevronRight } from 'lucide-react'

const DynamicMap = dynamic(() => import('@/components/map/DynamicMap'), { ssr: false, loading: () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E8F5E9', borderRadius: 20, fontSize: 15, color: '#616161' }}>
    Chargement de la carte...
  </div>
) })

const C = { dark: '#166534', light: '#dcfce7', text: '#616161', border: '#E8EDE4', white: '#FFFFFF' }
const TYPE_LABELS: Record<string, string> = { herboristerie: 'Herboristerie', marche: 'Marché', zone_cueillette: 'Zone de cueillette' }
const TYPE_COLORS: Record<string, string> = { herboristerie: '#166534', marche: '#E65100', zone_cueillette: '#1565C0' }

interface Location {
  id: string; name: string; type: string; latitude: number | null;
  longitude: number | null; address: string | null; city: string | null;
  region: string | null; description: string | null;
}

export default function CarteClient({ locations }: { locations: Location[] }) {
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Location | null>(null)

  const filtered = filter === 'all' ? locations : locations.filter(l => l.type === filter)
  const types = ['all', 'herboristerie', 'marche', 'zone_cueillette']

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, minHeight: 560 }}>
      {/* Liste latérale */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Filtres */}
        <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '12px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ height: 30, padding: '0 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filter === t ? C.dark : '#F5F5F5', color: filter === t ? '#fff' : '#555', transition: 'all 0.15s' }}>
              {t === 'all' ? 'Tous' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 460 }}>
          {filtered.map(loc => (
            <button key={loc.id} onClick={() => setSelected(selected?.id === loc.id ? null : loc)}
              style={{ background: selected?.id === loc.id ? C.light : C.white, border: `1.5px solid ${selected?.id === loc.id ? C.dark : C.border}`, borderRadius: 16, padding: '14px 16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', boxShadow: selected?.id === loc.id ? '0 4px 16px rgba(22,101,52,0.15)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ width: 8, height: 8, background: TYPE_COLORS[loc.type] ?? C.dark, borderRadius: '50%', display: 'inline-block', marginRight: 8 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: TYPE_COLORS[loc.type] ?? C.dark }}>{TYPE_LABELS[loc.type] ?? loc.type}</span>
                </div>
                <ChevronRight style={{ width: 14, height: 14, color: '#9AA49A' }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4 }}>{loc.name}</div>
              <div style={{ fontSize: 13, color: C.text }}>
                {loc.city ?? ''}{loc.region ? ` · ${loc.region}` : ''}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Carte */}
      <div style={{ position: 'relative' }}>
        <div style={{ height: 520, borderRadius: 20, overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(22,101,52,0.08)' }}>
          <DynamicMap locations={filtered} />
        </div>

        {/* Détail sélectionné */}
        {selected && (
          <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, background: C.white, borderRadius: 16, padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: TYPE_COLORS[selected.type] + '20', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin style={{ width: 18, height: 18, color: TYPE_COLORS[selected.type] }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 2 }}>{selected.name}</div>
              {selected.address && <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>📍 {selected.address}{selected.city ? `, ${selected.city}` : ''}</div>}
              {selected.description && <div style={{ fontSize: 13, color: '#444', lineHeight: '20px' }}>{selected.description}</div>}
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9AA49A', flexShrink: 0 }}>×</button>
          </div>
        )}
      </div>
    </div>
  )
}
