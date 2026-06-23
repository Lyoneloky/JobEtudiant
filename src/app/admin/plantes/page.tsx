import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil, Eye, EyeOff, Leaf } from 'lucide-react'
import type { Plant } from '@/lib/types'
import DeletePlantButton from './DeletePlantButton'

const C = {
  primaryDark: '#166534', primaryLight: '#dcfce7', primary: '#22c55e',
  bg: '#F8FAF5', white: '#FFFFFF', text: '#616161', border: '#E8EDE4', dark: '#111111',
}

const PLANT_COLORS = [C.primaryLight,'#FFFDE8','#FFF8E8','#FFF0F0','#F0EFF0','#E8F5E8','#EFF6FF','#F3E8FF','#FEF9EE','#F0FFF0']
const PLANT_EMOJI: Record<string,string> = { Goyave:'🍃',Citronnelle:'🌿',Gingembre:'🫚',Prunier:'🌲',Moringa:'🌱',Neem:'🍀',Aloe:'🪴',Eucalyptus:'🌿',Papayer:'🍃',Basilic:'🌿' }
function plantEmoji(n: string) { const k = Object.keys(PLANT_EMOJI).find(k => n.includes(k)); return k ? PLANT_EMOJI[k] : '🌿' }
function plantColor(i: number) { return PLANT_COLORS[i % PLANT_COLORS.length] }

export default async function AdminPlantesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: plants } = await supabase
    .from('plants')
    .select('*, categories(id, name, slug)')
    .order('created_at', { ascending: false })

  const total     = plants?.length ?? 0
  const published = plants?.filter(p => p.is_published).length ?? 0
  const drafts    = total - published

  return (
    <div style={{ padding: '4px 0 60px' }}>

      {/* ── En-tête ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: C.primaryLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Leaf style={{ width: 20, height: 20, color: C.primaryDark }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.dark, fontFamily: "'Poppins',sans-serif", margin: 0, lineHeight: '28px' }}>Gestion des plantes</h1>
            <p style={{ fontSize: 12, color: C.text, margin: 0 }}>{total} plante{total > 1 ? 's' : ''} dans le catalogue</p>
          </div>
        </div>
        <Link href="/admin/plantes/nouveau" style={{ height: 40, padding: '0 18px', background: C.primaryDark, color: C.white, borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Plus style={{ width: 15, height: 15 }} /> Nouvelle plante
        </Link>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total',      value: total,     bg: '#EFF6FF', color: '#1565C0', dot: '#1565C0' },
          { label: 'Publiées',   value: published,  bg: C.primaryLight, color: C.primaryDark, dot: C.primary },
          { label: 'Brouillons', value: drafts,     bg: '#F5F5F5', color: '#757575', dot: '#BDBDBD' },
        ].map(({ label, value, bg, color, dot }) => (
          <div key={label} style={{ background: C.white, borderRadius: 14, padding: '14px 18px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: dot, flexShrink: 0 }} />
            <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "'Poppins',sans-serif", lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: C.text }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Tableau ── */}
      <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {!plants || plants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 64, height: 64, background: C.primaryLight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Leaf style={{ width: 28, height: 28, color: C.primaryDark }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>Aucune plante dans le catalogue</p>
            <p style={{ fontSize: 13, color: C.text, marginBottom: 20 }}>Commencez par ajouter votre première plante médicinale.</p>
            <Link href="/admin/plantes/nouveau" style={{ height: 40, padding: '0 20px', background: C.primaryDark, color: C.white, borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Plus style={{ width: 15, height: 15 }} /> Ajouter la première plante
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* En-tête du tableau */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 0.7fr 100px', padding: '10px 20px', background: '#FAFBF8', borderBottom: `1px solid ${C.border}`, minWidth: 600 }}>
              {['Plante', 'Catégorie', 'Propriétés', 'Statut', 'Actions'].map((h, i) => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: i === 4 ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>

            {/* Lignes */}
            {(plants as Plant[]).map((plant, i) => (
              <div key={plant.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 0.7fr 100px', padding: '11px 20px', borderBottom: i < plants.length - 1 ? `1px solid #F5F7F4` : 'none', alignItems: 'center', minWidth: 600 }}>

                {/* Plante */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: plantColor(i), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
                    {plantEmoji(plant.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plant.name}</div>
                    {plant.latin_name && (
                      <div style={{ fontSize: 11, color: C.text, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plant.latin_name}</div>
                    )}
                  </div>
                </div>

                {/* Catégorie */}
                <div>
                  {plant.categories?.name ? (
                    <span style={{ height: 22, padding: '0 8px', background: C.primaryLight, borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.primaryDark, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                      {plant.categories.name.replace('Plantes ', '')}
                    </span>
                  ) : <span style={{ fontSize: 12, color: '#DDD' }}>—</span>}
                </div>

                {/* Propriétés */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                  {plant.properties?.slice(0, 2).map((p, pi) => (
                    <span key={pi} style={{ height: 20, padding: '0 7px', background: '#F0FDF4', border: '1px solid #86efac', borderRadius: 999, fontSize: 10, fontWeight: 600, color: '#15803d', display: 'inline-flex', alignItems: 'center' }}>
                      {p}
                    </span>
                  ))}
                  {(plant.properties?.length ?? 0) > 2 && (
                    <span style={{ height: 20, padding: '0 6px', background: '#F4F4F4', borderRadius: 999, fontSize: 10, color: C.text, display: 'inline-flex', alignItems: 'center' }}>
                      +{plant.properties.length - 2}
                    </span>
                  )}
                </div>

                {/* Statut */}
                <div>
                  {plant.is_published ? (
                    <span style={{ height: 24, padding: '0 10px', background: '#F0FDF4', border: '1px solid #86efac', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Eye style={{ width: 11, height: 11 }} /> Publié
                    </span>
                  ) : (
                    <span style={{ height: 24, padding: '0 10px', background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#9E9E9E', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <EyeOff style={{ width: 11, height: 11 }} /> Brouillon
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                  <Link href={`/plantes/${plant.id}`} title="Voir la fiche" style={{ width: 30, height: 30, borderRadius: 8, background: '#F4F8F3', border: `1px solid ${C.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: C.primaryDark, textDecoration: 'none' }}>
                    <Eye style={{ width: 13, height: 13 }} />
                  </Link>
                  <Link href={`/admin/plantes/${plant.id}/modifier`} title="Modifier" style={{ width: 30, height: 30, borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#1565C0', textDecoration: 'none' }}>
                    <Pencil style={{ width: 13, height: 13 }} />
                  </Link>
                  <DeletePlantButton plantId={plant.id} plantName={plant.name} />
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
