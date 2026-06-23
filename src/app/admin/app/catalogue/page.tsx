import { createClient } from '@/lib/supabase/server'
import PlantCard from '@/components/PlantCard'
import { Leaf, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Plant, Category } from '@/lib/types'

const PAGE_SIZE = 9
interface SearchParams { q?: string; categorie?: string; page?: string }

export default async function AdminCataloguePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params  = await searchParams
  const page    = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset  = (page - 1) * PAGE_SIZE

  let plants: Plant[]      = []
  let categories: Category[] = []
  let totalCount = 0

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  if (supabaseUrl.startsWith('http')) {
    const supabase = await createClient()
    let query = supabase
      .from('plants')
      .select('*, categories(id,name,slug)', { count: 'exact' })
      .eq('is_published', true)
      .order('name')
      .range(offset, offset + PAGE_SIZE - 1)

    if (params.q)         query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%,latin_name.ilike.%${params.q}%`)
    if (params.categorie) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', params.categorie).single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    const [{ data: plantsData, count }, { data: catsData }] = await Promise.all([
      query,
      supabase.from('categories').select('*').order('name'),
    ])
    plants     = (plantsData as Plant[]) ?? []
    categories = (catsData as Category[]) ?? []
    totalCount = count ?? 0
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const BASE = '/admin/app/catalogue'

  function pageUrl(p: number) {
    const sp = new URLSearchParams()
    if (params.q)         sp.set('q', params.q)
    if (params.categorie) sp.set('categorie', params.categorie)
    if (p > 1)            sp.set('page', String(p))
    const qs = sp.toString()
    return `${BASE}${qs ? `?${qs}` : ''}`
  }

  return (
    <div style={{ padding: '4px 0 60px' }}>

      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', fontFamily: "'Poppins',sans-serif", marginBottom: 4, letterSpacing: '-0.3px' }}>
          Catalogue des plantes médicinales
        </h1>
        <p style={{ fontSize: 13, color: '#616161' }}>
          {totalCount} plante{totalCount !== 1 ? 's' : ''} disponible{totalCount !== 1 ? 's' : ''}
          {totalPages > 1 && ` · Page ${page} sur ${totalPages}`}
        </p>
      </div>

      {/* Filtres */}
      <form style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E8EDE4', padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9AA49A' }} />
          <input type="text" name="q" defaultValue={params.q} placeholder="Rechercher une plante..."
            style={{ width: '100%', height: 44, paddingLeft: 44, paddingRight: 16, border: '1.5px solid #E8EDE4', borderRadius: 12, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const, background: '#F8FAF5' }} />
        </div>
        <select name="categorie" defaultValue={params.categorie}
          style={{ height: 44, padding: '0 14px', border: '1.5px solid #E8EDE4', borderRadius: 12, fontSize: 13, background: '#F8FAF5', cursor: 'pointer', outline: 'none' }}>
          <option value="">Toutes les catégories</option>
          {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
        </select>
        <button type="submit" style={{ height: 44, padding: '0 18px', borderRadius: 12, background: '#166534', color: '#FFF', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Filtrer
        </button>
        {(params.q || params.categorie) && (
          <a href={BASE} style={{ height: 44, padding: '0 14px', borderRadius: 12, border: '1.5px solid #E8EDE4', color: '#616161', fontSize: 13, display: 'inline-flex', alignItems: 'center', textDecoration: 'none', background: '#FFF' }}>
            Réinitialiser
          </a>
        )}
      </form>

      {/* Résultats */}
      {plants.length > 0 ? (
        <>
          <div className="tb-grid-3">
            {plants.map(plant => <PlantCard key={plant.id} plant={plant} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 32 }}>
              {page > 1 ? (
                <a href={pageUrl(page - 1)} style={{ height: 40, padding: '0 16px', borderRadius: 10, border: '1.5px solid #E8EDE4', color: '#333', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: '#FFF' }}>
                  <ChevronLeft style={{ width: 15, height: 15 }} /> Précédent
                </a>
              ) : (
                <span style={{ height: 40, padding: '0 16px', borderRadius: 10, border: '1.5px solid #E8EDE4', color: '#C0C8BE', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FAFAFA' }}>
                  <ChevronLeft style={{ width: 15, height: 15 }} /> Précédent
                </span>
              )}
              <div style={{ display: 'flex', gap: 5 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => { if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...'); acc.push(p); return acc }, [])
                  .map((p, i) => p === '...' ? (
                    <span key={`dots-${i}`} style={{ height: 40, width: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#9AA49A' }}>…</span>
                  ) : (
                    <a key={p} href={pageUrl(p as number)} style={{ height: 40, width: 40, borderRadius: 10, border: `1.5px solid ${p === page ? '#166534' : '#E8EDE4'}`, background: p === page ? '#166534' : '#FFF', color: p === page ? '#FFF' : '#333', fontSize: 13, fontWeight: p === page ? 700 : 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>{p}</a>
                  ))}
              </div>
              {page < totalPages ? (
                <a href={pageUrl(page + 1)} style={{ height: 40, padding: '0 16px', borderRadius: 10, border: '1.5px solid #E8EDE4', color: '#333', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: '#FFF' }}>
                  Suivant <ChevronRight style={{ width: 15, height: 15 }} />
                </a>
              ) : (
                <span style={{ height: 40, padding: '0 16px', borderRadius: 10, border: '1.5px solid #E8EDE4', color: '#C0C8BE', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FAFAFA' }}>
                  Suivant <ChevronRight style={{ width: 15, height: 15 }} />
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Leaf style={{ width: 32, height: 32, color: '#166534' }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#555', marginBottom: 8 }}>Aucun résultat</h2>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>Essayez d&apos;autres mots-clés ou supprimez les filtres.</p>
          <a href={BASE} style={{ display: 'inline-flex', height: 40, padding: '0 20px', borderRadius: 10, background: '#166534', color: '#FFF', fontSize: 13, fontWeight: 600, textDecoration: 'none', alignItems: 'center' }}>
            Réinitialiser les filtres
          </a>
        </div>
      )}
    </div>
  )
}
