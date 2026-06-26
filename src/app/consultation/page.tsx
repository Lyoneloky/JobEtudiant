'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { submitConsultation } from '@/lib/actions'
import { createClient } from '@/lib/supabase/client'
import { Stethoscope, AlertTriangle, ArrowLeft, Send, ChevronRight, CheckCircle } from 'lucide-react'

const C = { primary:'#22c55e', dark:'#166534', light:'#dcfce7', text:'#616161', border:'#E8EDE4', white:'#FFFFFF', bg:'#F8FAF5' }

const inputStyle: React.CSSProperties = {
  width:'100%', height:52, padding:'0 18px',
  border:`1.5px solid ${C.border}`, borderRadius:14,
  fontSize:15, color:'#222', background:C.bg,
  outline:'none', boxSizing:'border-box', fontFamily:'"Inter",Arial,sans-serif',
}
const labelStyle: React.CSSProperties = {
  display:'block', fontSize:14, fontWeight:600, color:'#333', marginBottom:8,
}

type Herboriste = { id: string; display_name: string | null }

export default function ConsultationPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error,     setError]     = useState('')
  const [step,      setStep]      = useState<'select' | 'form'>('select')
  const [herboristes, setHerboristes] = useState<Herboriste[]>([])
  const [loadingH,    setLoadingH]    = useState(true)
  const [selected,    setSelected]    = useState<Herboriste | null>(null)

  // Charger les herboristes approuvés
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('id, display_name')
      .eq('role', 'herboriste')
      .eq('approved', true)
      .then(({ data }) => {
        setHerboristes((data as Herboriste[]) ?? [])
        setLoadingH(false)
      })
  }, [])

  function handleSelect(h: Herboriste) {
    setSelected(h)
    setStep('form')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await submitConsultation(formData)
      if (result && 'error' in result && result.error) {
        if (result.error.includes('authentifié') || result.error.includes('connecté')) {
          router.push('/auth/login?redirect=/consultation')
        } else {
          setError(result.error)
        }
      } else {
        router.push('/consultation/confirmation')
      }
    })
  }

  return (
    <div style={{ fontFamily:'"Inter",Arial,sans-serif', background:C.bg, minHeight:'100vh' }}>
      <Navbar />
      <div style={{ maxWidth:700, margin:'0 auto', padding:'40px 24px 80px' }}>

        {/* Fil d'Ariane */}
        {step === 'select' ? (
          <Link href="/symptomes" style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:14, color:C.text, textDecoration:'none', marginBottom:28 }}>
            <ArrowLeft style={{ width:16, height:16 }}/> Retour à la recherche par symptôme
          </Link>
        ) : (
          <button onClick={() => setStep('select')} style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:14, color:C.text, background:'none', border:'none', cursor:'pointer', marginBottom:28, padding:0 }}>
            <ArrowLeft style={{ width:16, height:16 }}/> Changer d&apos;herboriste
          </button>
        )}

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${C.dark},#1a7a40)`, borderRadius:24, padding:'28px 32px', marginBottom:32, color:C.white }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
            <div style={{ width:52, height:52, background:'rgba(255,255,255,0.15)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Stethoscope style={{ width:26, height:26, color:C.white }}/>
            </div>
            <div>
              <h1 style={{ fontSize:26, fontWeight:800, margin:0, fontFamily:"'Poppins',sans-serif" }}>
                {step === 'select' ? 'Choisir un herboriste' : 'Demande de consultation'}
              </h1>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.8)', margin:'4px 0 0' }}>
                {step === 'select'
                  ? 'Sélectionnez l\'herboriste à qui vous souhaitez envoyer votre consultation'
                  : `Consultation envoyée à ${selected?.display_name ?? 'l\'herboriste'}`
                }
              </p>
            </div>
          </div>

          {/* Stepper */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background: step==='select' ? C.white : C.primary, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {step === 'form'
                  ? <CheckCircle style={{ width:14, height:14, color:C.dark }}/>
                  : <span style={{ fontSize:11, fontWeight:700, color:C.dark }}>1</span>
                }
              </div>
              <span style={{ fontSize:12, color: step==='select' ? C.white : 'rgba(255,255,255,0.7)', fontWeight: step==='select' ? 700 : 400 }}>Herboriste</span>
            </div>
            <ChevronRight style={{ width:14, height:14, color:'rgba(255,255,255,0.5)' }}/>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background: step==='form' ? C.white : 'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:11, fontWeight:700, color:C.dark }}>2</span>
              </div>
              <span style={{ fontSize:12, color: step==='form' ? C.white : 'rgba(255,255,255,0.5)', fontWeight: step==='form' ? 700 : 400 }}>Formulaire</span>
            </div>
          </div>
        </div>

        {/* ── ÉTAPE 1 : Sélection herboriste ─────── */}
        {step === 'select' && (
          <div>
            {loadingH ? (
              <div style={{ textAlign:'center', padding:'48px 0', color:C.text }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🌿</div>
                <p style={{ fontSize:14 }}>Chargement des herboristes...</p>
              </div>
            ) : herboristes.length === 0 ? (
              <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.border}`, padding:'40px 32px', textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🌱</div>
                <h2 style={{ fontSize:18, fontWeight:700, color:'#111', marginBottom:8 }}>Aucun herboriste disponible</h2>
                <p style={{ fontSize:14, color:C.text, lineHeight:'22px', marginBottom:20 }}>
                  Il n&apos;y a pas encore d&apos;herboriste certifié sur la plateforme.<br/>
                  Revenez bientôt ou utilisez la recherche par symptôme.
                </p>
                <Link href="/symptomes" style={{ height:44, padding:'0 24px', background:C.dark, color:C.white, borderRadius:12, fontSize:14, fontWeight:600, textDecoration:'none', display:'inline-flex', alignItems:'center' }}>
                  Rechercher par symptôme
                </Link>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {herboristes.map(h => {
                  const name    = h.display_name ?? 'Herboriste'
                  const initial = name.charAt(0).toUpperCase()
                  return (
                    <button
                      key={h.id}
                      onClick={() => handleSelect(h)}
                      style={{ background:C.white, borderRadius:18, border:`1.5px solid ${C.border}`, padding:'20px 24px', display:'flex', alignItems:'center', gap:16, cursor:'pointer', textAlign:'left', width:'100%', transition:'border-color .15s, box-shadow .15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.dark; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(22,101,52,0.10)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                    >
                      {/* Avatar */}
                      <div style={{ width:56, height:56, borderRadius:'50%', background:`linear-gradient(135deg,${C.primary},${C.dark})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontSize:22, fontWeight:800, color:C.white }}>{initial}</span>
                      </div>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:17, fontWeight:700, color:'#111', fontFamily:"'Poppins',sans-serif", marginBottom:4 }}>{name}</div>
                        <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.light, borderRadius:20, padding:'3px 10px' }}>
                          <span style={{ fontSize:11, color:C.dark }}>🌿</span>
                          <span style={{ fontSize:11, fontWeight:600, color:C.dark }}>Herboriste certifié TerraBio</span>
                        </div>
                      </div>
                      {/* Flèche */}
                      <div style={{ width:36, height:36, borderRadius:10, background:C.light, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <ChevronRight style={{ width:18, height:18, color:C.dark }}/>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ÉTAPE 2 : Formulaire ─────────────── */}
        {step === 'form' && selected && (
          <>
            {/* Bannière herboriste sélectionné */}
            <div style={{ background:C.light, borderRadius:14, border:`1px solid ${C.primary}`, padding:'14px 18px', marginBottom:24, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:42, height:42, borderRadius:'50%', background:`linear-gradient(135deg,${C.primary},${C.dark})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:16, fontWeight:800, color:C.white }}>{(selected.display_name ?? 'H').charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.dark }}>
                  Consultation envoyée à {selected.display_name ?? 'Herboriste'}
                </div>
                <div style={{ fontSize:12, color:'#4b7a5a' }}>Il recevra votre demande et vous répondra prochainement</div>
              </div>
            </div>

            {/* Avertissement */}
            <div style={{ background:'rgba(22,101,52,0.06)', borderRadius:14, padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start', marginBottom:24 }}>
              <AlertTriangle style={{ width:16, height:16, color:'#D97706', flexShrink:0, marginTop:1 }}/>
              <p style={{ fontSize:13, color:'#555', margin:0, lineHeight:'20px' }}>
                Cette consultation est fournie à titre éducatif uniquement. En cas d&apos;urgence médicale, composez le 15.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:24 }}>
              {/* Champ caché herboriste_id */}
              <input type="hidden" name="herboriste_id" value={selected.id} />

              <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.border}`, padding:'28px 32px', boxShadow:'0 4px 20px rgba(22,101,52,0.06)' }}>
                <h2 style={{ fontSize:18, fontWeight:700, color:'#222', fontFamily:"'Poppins',sans-serif", marginBottom:22 }}>Description des symptômes</h2>

                <div style={{ marginBottom:20 }}>
                  <label style={labelStyle}>Décrivez vos symptômes <span style={{ color:'#D32F2F' }}>*</span></label>
                  <textarea
                    name="symptoms" required rows={5}
                    placeholder="Ex : J'ai de la fièvre depuis 2 jours, accompagnée de maux de tête et de douleurs musculaires..."
                    style={{ ...inputStyle, height:'auto', padding:'14px 18px', resize:'vertical', lineHeight:'24px' }}
                  />
                  <p style={{ fontSize:12, color:C.text, marginTop:6 }}>Soyez le plus précis possible (localisation, intensité, circonstances)</p>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                  <div>
                    <label style={labelStyle}>Âge du patient</label>
                    <input type="number" name="age" min="1" max="120" placeholder="Ex: 35" style={inputStyle}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Depuis combien de temps ?</label>
                    <select name="duration" style={{ ...inputStyle, cursor:'pointer', background:C.bg }}>
                      <option value="">Sélectionner</option>
                      <option value="moins_24h">Moins de 24 heures</option>
                      <option value="1_3_jours">1 à 3 jours</option>
                      <option value="1_semaine">1 semaine</option>
                      <option value="plus_semaine">Plus d&apos;une semaine</option>
                      <option value="chronique">Chronique (mois/années)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom:20 }}>
                  <label style={labelStyle}>Traitements en cours</label>
                  <input type="text" name="treatments" placeholder="Ex : Paracétamol, Artémether... ou 'Aucun'" style={inputStyle}/>
                  <p style={{ fontSize:12, color:C.text, marginTop:6 }}>Important pour vérifier les interactions avec les plantes</p>
                </div>

                <div>
                  <label style={labelStyle}>Allergies connues</label>
                  <input type="text" name="allergies" placeholder="Ex : Allergie à l'aspirine... ou 'Aucune connue'" style={inputStyle}/>
                </div>
              </div>

              {error && (
                <div style={{ background:'#FFF0F0', border:'1px solid #FFB3B3', borderRadius:14, padding:'14px 18px', color:'#D32F2F', fontSize:14, display:'flex', gap:10, alignItems:'flex-start' }}>
                  <AlertTriangle style={{ width:18, height:18, flexShrink:0 }}/>{error}
                </div>
              )}

              <div style={{ display:'flex', gap:12 }}>
                <button
                  type="submit" disabled={isPending}
                  style={{ flex:1, height:56, borderRadius:16, background:isPending ? '#9CA69B' : C.dark, color:C.white, border:'none', fontSize:16, fontWeight:700, cursor:isPending ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontFamily:'"Inter",Arial,sans-serif' }}
                >
                  <Send style={{ width:18, height:18 }}/>
                  {isPending ? 'Envoi en cours...' : 'Envoyer ma demande'}
                </button>
                <button type="button" onClick={() => setStep('select')}
                  style={{ height:56, padding:'0 24px', borderRadius:16, border:`1.5px solid ${C.border}`, color:'#555', fontSize:15, fontWeight:600, background:C.white, cursor:'pointer' }}>
                  Retour
                </button>
              </div>
            </form>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
