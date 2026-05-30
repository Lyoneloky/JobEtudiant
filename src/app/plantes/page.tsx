import { createClient } from '@/lib/supabase/server'
import PlantCard from '@/components/PlantCard'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Leaf, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Plant, Category } from '@/lib/types'

const PAGE_SIZE = 9

interface SearchParams { q?: string; categorie?: string; page?: string }

export default async function PlantesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params  = await searchParams
  const page    = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset  = (page - 1) * PAGE_SIZE

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  let plants: Plant[]     = []
  let categories: Category[] = []
  let totalCount = 0

  if (supabaseUrl.startsWith('http')) {
    const supabase = await createClient()

    let query = supabase
      .from('plants')
      .select('*, categories(id,name,slug)', { count: 'exact' })
      .eq('is_published', true)
      .order('name')
      .range(offset, offset + PAGE_SIZE - 1)

    if (params.q) {
      query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%,latin_name.ilike.%${params.q}%`)
    }
    if (params.categorie) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', params.categorie).single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    const [{ data: plantsData, count }, { data: catsData }] = await Promise.all([
      query,
      supabase.from('categories').select('*').order('name'),
    ])
    plants     = (plantsData as Plant[]) ?? []
    categories = (catsData  as Category[]) ?? []
    totalCount = count ?? 0
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  function pageUrl(p: number) {
    const sp = new URLSearchParams()
    if (params.q)        sp.set('q', params.q)
    if (params.categorie) sp.set('categorie', params.categorie)
    if (p > 1)           sp.set('page', String(p))
    const qs = sp.toString()
    return `/plantes${qs ? `?${qs}` : ''}`
  }

  return (
    <div style={{ fontFamily:'"Inter",Arial,sans-serif', background:'#F8FAF5', minHeight:'100vh' }}>
      <Navbar />
      <div className="tb-page">

        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:36, fontWeight:800, color:'#111', fontFamily:"'Poppins',sans-serif", marginBottom:6, letterSpacing:'-1px' }}>
            Catalogue des plantes médicinales
          </h1>
          <p style={{ fontSize:15, color:'#616161' }}>
            {totalCount} plante{totalCount !== 1 ? 's' : ''} disponible{totalCount !== 1 ? 's' : ''}
            {totalPages > 1 && ` · Page ${page} sur ${totalPages}`}
          </p>
        </div>

        {/* Filtres */}
        <form style={{ background:'#FFFFFF', borderRadius:20, border:'1px solid #E8EDE4', padding:'16px 20px', marginBottom:28, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:1, minWidth:180 }}>
            <Search style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'#9AA49A' }}/>
            <input type="text" name="q" defaultValue={params.q} placeholder="Rechercher une plante..."
              style={{ width:'100%', height:48, paddingLeft:44, paddingRight:16, border:'1.5px solid #E8EDE4', borderRadius:14, fontSize:14, outline:'none', boxSizing:'border-box' as const, background:'#F8FAF5' }}/>
          </div>
          <select name="categorie" defaultValue={params.categorie}
            style={{ height:48, padding:'0 14px', border:'1.5px solid #E8EDE4', borderRadius:14, fontSize:14, background:'#F8FAF5', cursor:'pointer', outline:'none' }}>
            <option value="">Toutes les catégories</option>
            {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
          </select>
          <button type="submit"
            style={{ height:48, padding:'0 22px', borderRadius:14, background:'#166534', color:'#FFFFFF', border:'none', fontSize:14, fontWeight:600, cursor:'pointer' }}>
            Filtrer
          </button>
          {(params.q || params.categorie) && (
            <a href="/plantes" style={{ height:48, padding:'0 18px', borderRadius:14, border:'1.5px solid #E8EDE4', color:'#616161', fontSize:14, display:'inline-flex', alignItems:'center', textDecoration:'none', background:'#FFF' }}>
              Réinitialiser
            </a>
          )}
        </form>

        {/* Résultats */}
        {plants.length > 0 ? (
          <>
            <div className="tb-grid-3">
              {plants.map(plant => <PlantCard key={plant.id} plant={plant}/>)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, marginTop:40 }}>
                {page > 1 ? (
                  <a href={pageUrl(page - 1)} style={{ height:44, padding:'0 18px', borderRadius:12, border:'1.5px solid #E8EDE4', color:'#333', fontSize:14, fontWeight:500, display:'inline-flex', alignItems:'center', gap:6, textDecoration:'none', background:'#FFF' }}>
                    <ChevronLeft style={{ width:16, height:16 }}/> Précédent
                  </a>
                ) : (
                  <span style={{ height:44, padding:'0 18px', borderRadius:12, border:'1.5px solid #E8EDE4', color:'#C0C8BE', fontSize:14, display:'inline-flex', alignItems:'center', gap:6, background:'#FAFAFA' }}>
                    <ChevronLeft style={{ width:16, height:16 }}/> Précédent
                  </span>
                )}

                <div style={{ display:'flex', gap:6 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i-1] as number) > 1) acc.push('...')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, i) => p === '...' ? (
                      <span key={`dots-${i}`} style={{ height:44, width:44, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#9AA49A' }}>…</span>
                    ) : (
                      <a key={p} href={pageUrl(p as number)} style={{ height:44, width:44, borderRadius:12, border:`1.5px solid ${p === page ? '#166534' : '#E8EDE4'}`, background:p === page ? '#166534' : '#FFF', color:p === page ? '#FFF' : '#333', fontSize:14, fontWeight:p === page ? 700 : 500, display:'inline-flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>
                        {p}
                      </a>
                    ))
                  }
                </div>

                {page < totalPages ? (
                  <a href={pageUrl(page + 1)} style={{ height:44, padding:'0 18px', borderRadius:12, border:'1.5px solid #E8EDE4', color:'#333', fontSize:14, fontWeight:500, display:'inline-flex', alignItems:'center', gap:6, textDecoration:'none', background:'#FFF' }}>
                    Suivant <ChevronRight style={{ width:16, height:16 }}/>
                  </a>
                ) : (
                  <span style={{ height:44, padding:'0 18px', borderRadius:12, border:'1.5px solid #E8EDE4', color:'#C0C8BE', fontSize:14, display:'inline-flex', alignItems:'center', gap:6, background:'#FAFAFA' }}>
                    Suivant <ChevronRight style={{ width:16, height:16 }}/>
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ width:80, height:80, background:'#dcfce7', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <Leaf style={{ width:36, height:36, color:'#166534' }}/>
            </div>
            <h2 style={{ fontSize:22, fontWeight:700, color:'#555', marginBottom:10 }}>Aucun résultat</h2>
            <p style={{ fontSize:15, color:'#888' }}>Essayez d&apos;autres mots-clés ou supprimez les filtres.</p>
            <a href="/plantes" style={{ display:'inline-flex', marginTop:20, height:44, padding:'0 22px', borderRadius:12, background:'#166534', color:'#FFF', fontSize:14, fontWeight:600, textDecoration:'none', alignItems:'center' }}>
              Réinitialiser les filtres
            </a>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
