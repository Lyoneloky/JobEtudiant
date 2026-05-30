'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { removeFavorite } from '@/lib/actions'
import { Heart, Leaf, ArrowLeft, Trash2, ChevronRight } from 'lucide-react'

const C = { primary:'#22c55e', primaryDark:'#166534', primaryLight:'#dcfce7', bg:'#F8FAF5', white:'#FFFFFF', border:'#E8EDE4', text:'#616161' }

const PLANT_COLORS = [C.primaryLight,'#FFFDE8','#FFF8E8','#FFF0F0','#F0EFF0','#E8F5E8','#EFF6FF','#F3E8FF']
const PLANT_EMOJI: Record<string,string> = { Goyave:'🍃',Citronnelle:'🌿',Gingembre:'🫚',Prunier:'🌲',Moringa:'🌱',Neem:'🍀',Aloe:'🪴',Eucalyptus:'🌿',Papayer:'🍃',Basilic:'🌿' }
const plantEmoji = (n:string) => { const k=Object.keys(PLANT_EMOJI).find(k=>n.includes(k)); return k?PLANT_EMOJI[k]:'🌿' }

type FavPlant = { favoriteId: string; plant: { id:string; name:string; latin_name:string|null; description:string; properties:string[]; categories?: {name:string}|null } }

export default function FavorisPage() {
  const router  = useRouter()
  const [favorites, setFavorites] = useState<FavPlant[]>([])
  const [loading,   setLoading]   = useState(true)
  const [removing,  setRemoving]  = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const { data: favs } = await supabase
        .from('favorites')
        .select('id, plants(id, name, latin_name, description, properties, categories(name))')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })

      const mapped = (favs ?? []).map((f: any) => ({ favoriteId: f.id, plant: f.plants })).filter(f => f.plant)
      setFavorites(mapped)
      setLoading(false)
    })
  }, [router])

  function handleRemove(plantId: string, favoriteId: string) {
    setRemoving(favoriteId)
    startTransition(async () => {
      await removeFavorite(plantId)
      setFavorites(prev => prev.filter(f => f.favoriteId !== favoriteId))
      setRemoving(null)
    })
  }

  return (
    <div style={{ fontFamily:'"Inter",Arial,sans-serif', background:C.bg, minHeight:'100vh' }}>
      <Navbar />
      <div className="tb-page-sm">

        <Link href="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:14, color:C.text, textDecoration:'none', marginBottom:28 }}>
          <ArrowLeft style={{ width:16, height:16 }}/> Tableau de bord
        </Link>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
          <div style={{ width:52, height:52, background:C.primaryLight, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Heart style={{ width:26, height:26, color:C.primaryDark }}/>
          </div>
          <div>
            <h1 style={{ fontSize:30, fontWeight:800, color:'#111', fontFamily:"'Poppins',sans-serif", marginBottom:4 }}>Mes favoris</h1>
            {!loading && (
              <p style={{ fontSize:14, color:C.text }}>
                {favorites.length} plante{favorites.length !== 1 ? 's' : ''} en favori{favorites.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:C.text }}>
            <Leaf style={{ width:36, height:36, color:C.primary, margin:'0 auto 12px', display:'block' }}/>
            <p>Chargement...</p>
          </div>
        ) : favorites.length === 0 ? (
          /* ── État vide ── */
          <div style={{ textAlign:'center', padding:'60px 24px', background:C.white, borderRadius:24, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🌱</div>
            <h2 style={{ fontSize:22, fontWeight:700, color:'#333', fontFamily:"'Poppins',sans-serif", marginBottom:10 }}>
              Aucune plante en favori
            </h2>
            <p style={{ fontSize:14, color:C.text, lineHeight:'22px', marginBottom:28, maxWidth:340, margin:'0 auto 28px' }}>
              Parcourez le catalogue et cliquez sur le bouton ❤️ pour ajouter une plante à vos favoris.
            </p>
            <Link href="/plantes" style={{ display:'inline-flex', alignItems:'center', gap:8, height:48, padding:'0 28px', borderRadius:14, background:C.primaryDark, color:C.white, fontSize:15, fontWeight:700, textDecoration:'none' }}>
              <Leaf style={{ width:16, height:16 }}/> Explorer le catalogue
            </Link>
          </div>
        ) : (
          /* ── Liste des favoris ── */
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {favorites.map(({ favoriteId, plant }, i) => (
              <div key={favoriteId} style={{ background:C.white, borderRadius:20, border:`1px solid ${C.border}`, padding:'20px 22px', display:'flex', alignItems:'center', gap:16, boxShadow:'0 4px 16px rgba(22,101,52,0.05)' }}>
                {/* Emoji */}
                <div style={{ width:64, height:64, borderRadius:16, background:PLANT_COLORS[i % PLANT_COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>
                  {plantEmoji(plant.name)}
                </div>

                {/* Infos */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                    <span style={{ fontSize:17, fontWeight:700, color:'#111', fontFamily:"'Poppins',sans-serif" }}>{plant.name}</span>
                    {plant.categories?.name && (
                      <span style={{ height:22, padding:'0 8px', background:C.primaryLight, borderRadius:999, fontSize:11, fontWeight:600, color:C.primaryDark, display:'inline-flex', alignItems:'center', flexShrink:0 }}>
                        {plant.categories.name}
                      </span>
                    )}
                  </div>
                  {plant.latin_name && <div style={{ fontSize:12, color:'#9AA49A', fontStyle:'italic', marginBottom:4 }}>{plant.latin_name}</div>}
                  <p style={{ fontSize:13, color:C.text, lineHeight:'19px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const }}>{plant.description}</p>
                  {plant.properties?.slice(0, 3).length > 0 && (
                    <div style={{ display:'flex', gap:5, marginTop:8, flexWrap:'wrap' }}>
                      {plant.properties.slice(0, 3).map((p: string) => (
                        <span key={p} style={{ height:20, padding:'0 8px', background:'#F4F6F3', borderRadius:6, fontSize:11, color:'#6D756B', display:'inline-flex', alignItems:'center' }}>{p}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                  <Link href={`/plantes/${plant.id}`} style={{ height:38, padding:'0 14px', borderRadius:10, background:C.primaryDark, color:C.white, fontSize:13, fontWeight:600, display:'inline-flex', alignItems:'center', gap:5, textDecoration:'none' }}>
                    Voir <ChevronRight style={{ width:13, height:13 }}/>
                  </Link>
                  <button
                    onClick={() => handleRemove(plant.id, favoriteId)}
                    disabled={removing === favoriteId || isPending}
                    style={{ height:38, padding:'0 14px', borderRadius:10, background:'#FFF0F0', border:'1px solid #FFD6D6', color:'#D32F2F', fontSize:13, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5, opacity: removing === favoriteId ? 0.6 : 1 }}
                  >
                    <Trash2 style={{ width:13, height:13 }}/> Retirer
                  </button>
                </div>
              </div>
            ))}

            <div style={{ textAlign:'center', marginTop:8 }}>
              <Link href="/plantes" style={{ fontSize:14, color:C.primaryDark, fontWeight:600, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
                <Leaf style={{ width:14, height:14 }}/> Découvrir d&apos;autres plantes
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
