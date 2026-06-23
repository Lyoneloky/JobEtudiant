import { createClient } from '@/lib/supabase/server'
import CarteClient from '@/app/carte/CarteClient'
import { MapPin } from 'lucide-react'

const C = { dark: '#166534', light: '#dcfce7', text: '#616161', border: '#E8EDE4', white: '#FFFFFF' }

const FALLBACK_LOCATIONS = [
  { id: '1', name: 'Marché Mokolo — Section herboristes', type: 'marche', latitude: 3.8721, longitude: 11.5021, address: 'Marché Mokolo', city: 'Yaoundé', region: 'Centre', description: 'Grand marché populaire avec de nombreux stands de plantes médicinales séchées et fraîches.' },
  { id: '2', name: 'Marché Central — Plantes médicinales', type: 'marche', latitude: 3.8685, longitude: 11.5174, address: 'Avenue Kennedy', city: 'Yaoundé', region: 'Centre', description: 'Section dédiée aux plantes médicinales au niveau du marché central.' },
  { id: '3', name: 'Herboristerie Mama Nature', type: 'herboristerie', latitude: 3.8802, longitude: 11.4985, address: 'Quartier Bastos', city: 'Yaoundé', region: 'Centre', description: 'Herboristerie spécialisée dans les plantes médicinales camerounaises, conseils personnalisés.' },
  { id: '4', name: 'Jardin médicinal de l\'IAI', type: 'zone_cueillette', latitude: 3.8650, longitude: 11.5102, address: 'Ngoa-Ekele', city: 'Yaoundé', region: 'Centre', description: 'Jardin botanique avec plantes médicinales endémiques du Cameroun.' },
  { id: '5', name: 'Marché Mboppi — Plantes fraîches', type: 'marche', latitude: 4.0444, longitude: 9.7040, address: 'Marché Mboppi', city: 'Douala', region: 'Littoral', description: 'Marché de Douala avec vendeurs de plantes médicinales fraîches et séchées.' },
]

export default async function AdminCartePage() {
  const supabase = await createClient()
  const { data: locations } = await supabase.from('locations').select('*').order('city')
  const data = (locations && locations.length > 0) ? locations : FALLBACK_LOCATIONS

  const stats = {
    herboristeries: data.filter(l => l.type === 'herboristerie').length,
    marches: data.filter(l => l.type === 'marche').length,
    zones: data.filter(l => l.type === 'zone_cueillette').length,
  }

  return (
    <div style={{ padding: '4px 0 60px' }}>

      {/* En-tête */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 30, padding: '0 12px', background: C.light, borderRadius: 999, marginBottom: 12 }}>
          <MapPin style={{ width: 13, height: 13, color: C.dark }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: C.dark }}>GÉOLOCALISATION</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', fontFamily: "'Poppins',sans-serif", marginBottom: 6, letterSpacing: '-0.3px' }}>
          Trouvez vos plantes près de chez vous
        </h1>
        <p style={{ fontSize: 13, color: C.text, lineHeight: '22px', maxWidth: 480 }}>
          Herboristeries, marchés locaux et zones de cueillette au Cameroun.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Herboristeries', value: stats.herboristeries, color: '#166534', bg: '#E8F5E9' },
          { label: 'Marchés', value: stats.marches, color: '#E65100', bg: '#FFF3E0' },
          { label: 'Zones de cueillette', value: stats.zones, color: '#1565C0', bg: '#E3F2FD' },
        ].map(s => (
          <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, background: s.color, borderRadius: '50%' }} />
            <span style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>{s.value}</span>
            <span style={{ fontSize: 13, color: C.text }}>{s.label}</span>
          </div>
        ))}
      </div>

      <CarteClient locations={data} />
    </div>
  )
}
