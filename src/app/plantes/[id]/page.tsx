import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FavoriteButton from './FavoriteButton'
import { Leaf, AlertTriangle, ArrowLeft, Clock, Pill, Stethoscope, BookOpen, FlaskConical, Activity } from 'lucide-react'

const C = { primary: '#22c55e', dark: '#166534', light: '#dcfce7', beige: '#F1EFE6', text: '#616161', border: '#E8EDE4', white: '#FFFFFF', bg: '#F8FAF5' }

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: plant }, { data: { user } }] = await Promise.all([
    supabase.from('plants').select('*, categories(id, name, slug)').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!plant) notFound()

  // Symptômes associés
  const { data: plantSymptoms } = await supabase
    .from('plant_symptoms')
    .select('symptoms(id, name, category)')
    .eq('plant_id', id)

  // Favoris
  let isFavorite = false
  if (user) {
    const { data: fav } = await supabase.from('favorites').select('id').eq('user_id', user.id).eq('plant_id', id).single()
    isFavorite = !!fav
  }

  // Plantes de même catégorie (suggestions)
  const { data: related } = await supabase
    .from('plants')
    .select('id, name, latin_name, properties')
    .eq('category_id', plant.category_id ?? '')
    .eq('is_published', true)
    .neq('id', id)
    .limit(3)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const symptoms = (plantSymptoms as any[])?.map((ps: any) => ps.symptoms).filter(Boolean) ?? []

  return (
    <div style={{ fontFamily: '"Inter", Arial, sans-serif', background: C.bg }}>
      <Navbar />

      <div className="tb-page-sm">
        {/* Retour */}
        <Link href="/plantes" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.text, textDecoration: 'none', marginBottom: 24 }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Retour au catalogue
        </Link>

        {/* Header */}
        <div style={{ background: C.white, borderRadius: 28, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 24, boxShadow: '0 8px 32px rgba(22,101,52,0.08)' }}>
          {/* Bannière verte */}
          <div style={{ background: `linear-gradient(135deg, ${C.dark}, #1a7a40)`, padding: '36px 40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', right: 40, bottom: -60, width: 150, height: 150, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 1 }}>
              <div>
                {plant.categories && (
                  <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999, marginBottom: 12 }}>
                    {(plant.categories as { name: string }).name}
                  </span>
                )}
                <h1 style={{ fontSize: 40, fontWeight: 800, color: C.white, margin: 0, fontFamily: "'Poppins', sans-serif", lineHeight: 1.2 }}>{plant.name}</h1>
                {plant.latin_name && <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', marginTop: 8, margin: '8px 0 0' }}>{plant.latin_name}</p>}
              </div>
              <FavoriteButton plantId={plant.id} initialFavorite={isFavorite} isLoggedIn={!!user} />
            </div>
          </div>

          {/* Propriétés badges */}
          {plant.properties && plant.properties.length > 0 && (
            <div style={{ padding: '20px 40px', background: C.light, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {plant.properties.map((prop: string) => (
                <span key={prop} style={{ height: 30, padding: '0 14px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 999, fontSize: 13, fontWeight: 600, color: C.dark, display: 'inline-flex', alignItems: 'center' }}>{prop}</span>
              ))}
            </div>
          )}
        </div>

        {/* Contenu en 2 colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          {/* Colonne principale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Description */}
            <Section icon={<BookOpen />} title="Description" color={C.dark}>
              <p style={{ fontSize: 16, color: '#333', lineHeight: '28px', margin: 0 }}>{plant.description}</p>
            </Section>

            {/* Préparation */}
            {plant.preparation && (
              <Section icon={<FlaskConical />} title="Mode de préparation" color="#1565C0">
                <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plant.preparation.split('\n').filter((s: string) => s.trim()).map((step: string, i: number) => (
                    <li key={i} style={{ fontSize: 15, color: '#333', lineHeight: '24px' }}>{step.replace(/^\d+\.\s*/, '')}</li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Usage */}
            {plant.usage && (
              <Section icon={<Pill />} title="Usages et applications" color={C.primary}>
                <p style={{ fontSize: 15, color: '#333', lineHeight: '26px', margin: 0, whiteSpace: 'pre-line' }}>{plant.usage}</p>
              </Section>
            )}

            {/* Dosage */}
            {plant.dosage && (
              <Section icon={<Clock />} title="Posologie recommandée" color="#7B1FA2">
                <div style={{ background: '#F8F0FF', borderRadius: 12, padding: '14px 18px', border: '1px solid #E1BEE7' }}>
                  <p style={{ fontSize: 15, color: '#4A148C', margin: 0, lineHeight: '24px' }}>{plant.dosage}</p>
                </div>
              </Section>
            )}

            {/* Contre-indications */}
            {plant.contraindications && (
              <div style={{ background: '#FFF8E8', border: '1.5px solid #FFE082', borderRadius: 20, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, background: '#FFF3CD', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle style={{ width: 18, height: 18, color: '#E65100' }} />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#E65100' }}>Contre-indications et précautions</span>
                </div>
                <p style={{ fontSize: 15, color: '#5D4037', lineHeight: '26px', margin: 0, whiteSpace: 'pre-line' }}>{plant.contraindications}</p>
              </div>
            )}

            {/* Avertissement général */}
            <div style={{ background: '#F5F5F5', borderRadius: 16, padding: '14px 18px', border: '1px solid #E0E0E0' }}>
              <p style={{ fontSize: 13, color: '#757575', margin: 0, lineHeight: '22px' }}>
                <strong style={{ color: '#424242' }}>⚠️ Avertissement médical :</strong> Ces informations sont fournies à titre éducatif uniquement. Elles ne se substituent pas à un avis médical professionnel. Consultez toujours un médecin ou un pharmacien avant toute utilisation thérapeutique.
              </p>
            </div>
          </div>

          {/* Colonne latérale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Symptômes */}
            {symptoms.length > 0 && (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(22,101,52,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Activity style={{ width: 18, height: 18, color: C.dark }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>Symptômes traités</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {symptoms.map((s: { id: string; name: string } | null) => s && (
                    <Link key={s.id} href={`/symptomes?selected=${encodeURIComponent(s.name)}`}
                      style={{ height: 28, padding: '0 12px', background: C.light, borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.dark, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Consultation */}
            <div style={{ background: `linear-gradient(135deg, ${C.dark}, #1a7a40)`, borderRadius: 20, padding: 22, color: C.white }}>
              <Stethoscope style={{ width: 28, height: 28, color: 'rgba(255,255,255,0.8)', marginBottom: 10 }} />
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, lineHeight: '22px' }}>Besoin d'un conseil personnalisé ?</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16, lineHeight: '20px' }}>Décrivez vos symptômes et obtenez une recommandation adaptée à votre situation.</p>
              <Link href="/consultation"
                style={{ display: 'block', textAlign: 'center', background: C.white, color: C.dark, borderRadius: 12, padding: '10px 0', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                Demander une consultation
              </Link>
            </div>

            {/* Plantes similaires */}
            {related && related.length > 0 && (
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(22,101,52,0.06)' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.dark, marginBottom: 14 }}>Plantes similaires</p>
                {(related as { id: string; name: string; latin_name: string | null; properties: string[] }[]).map(p => (
                  <Link key={p.id} href={`/plantes/${p.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.border}`, textDecoration: 'none' }}>
                    <div style={{ width: 36, height: 36, background: C.light, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Leaf style={{ width: 18, height: 18, color: C.dark }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#222' }}>{p.name}</div>
                      {p.latin_name && <div style={{ fontSize: 12, color: C.text, fontStyle: 'italic' }}>{p.latin_name}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function Section({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFFFFF', border: `1px solid #E8EDE4`, borderRadius: 20, padding: '20px 24px', boxShadow: '0 4px 16px rgba(22,101,52,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 34, height: 34, background: `${color}18`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color, display: 'flex' }}>
            {icon}
          </span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#222', fontFamily: "'Poppins', sans-serif" }}>{title}</span>
      </div>
      {children}
    </div>
  )
}
