'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { respondConsultation } from '@/lib/actions'
import { ArrowLeft, Send, CheckCircle, AlertTriangle, User, Calendar } from 'lucide-react'

const C = { dark: '#166534', light: '#dcfce7', text: '#616161', border: '#E8EDE4', white: '#FFFFFF', bg: '#F8FAF5', primary: '#22c55e' }

type Consultation = {
  id: string
  symptoms_description: string
  age: number | null
  duration: string | null
  current_treatments: string | null
  allergies: string | null
  status: string
  admin_response: string | null
  created_at: string
  profiles: { display_name: string | null } | null
}

type Plant = { id: string; name: string }

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  en_attente: { label: 'En attente', bg: '#FFF8E8', color: '#E65100' },
  en_cours:   { label: 'En cours',   bg: '#E3F2FD', color: '#1565C0' },
  traitee:    { label: 'Traitée',    bg: C.light,   color: C.dark    },
  fermee:     { label: 'Fermée',     bg: '#F5F5F5', color: '#616161' },
}

export default function AdminConsultationDetailPage() {
  const router  = useRouter()
  const params  = useParams()
  const id      = params.id as string

  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [plants, setPlants]             = useState<Plant[]>([])
  const [response, setResponse]         = useState('')
  const [plantId, setPlantId]           = useState('')
  const [saved, setSaved]               = useState(false)
  const [errorMsg, setErrorMsg]         = useState('')
  const [loading, setLoading]           = useState(true)
  const [isPending, startTransition]    = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }

      const [{ data: cons }, { data: pl }] = await Promise.all([
        supabase.from('consultations').select('*, profiles(display_name)').eq('id', id).single(),
        supabase.from('plants').select('id, name').eq('is_published', true).order('name'),
      ])

      if (!cons) { router.push('/admin/consultations'); return }
      setConsultation(cons as unknown as Consultation)
      setResponse(cons.admin_response ?? '')
      setPlantId(cons.plant_recommended_id ?? '')
      setPlants(pl ?? [])
      setLoading(false)
    })
  }, [id, router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    startTransition(async () => {
      const result = await respondConsultation(id, response, plantId || undefined)
      if (result && 'error' in result && result.error) {
        setErrorMsg(result.error)
      } else {
        setSaved(true)
        setTimeout(() => { setSaved(false); router.push('/admin/consultations') }, 1500)
      }
    })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: C.text }}>
        Chargement...
      </div>
    )
  }

  if (!consultation) return null

  const status = STATUS_LABELS[consultation.status] ?? STATUS_LABELS['en_attente']
  const userName = consultation.profiles?.display_name ?? 'Utilisateur anonyme'

  return (
    <div style={{ maxWidth: 800, padding: '8px 0 60px' }}>

        <Link href="/admin/consultations" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.text, textDecoration: 'none', marginBottom: 28 }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Retour aux consultations
        </Link>

        {/* En-tête */}
        <div style={{ background: `linear-gradient(135deg, ${C.dark}, #1a7a40)`, borderRadius: 22, padding: '28px 32px', marginBottom: 28, color: C.white }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: "'Poppins', sans-serif" }}>Consultation</h1>
            <span style={{ height: 28, padding: '0 12px', background: status.bg, borderRadius: 8, fontSize: 12, fontWeight: 700, color: status.color, display: 'inline-flex', alignItems: 'center' }}>
              {status.label}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User style={{ width: 14, height: 14 }} /> {userName}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar style={{ width: 14, height: 14 }} />
              {new Date(consultation.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Détails */}
        <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '24px 28px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#222', marginBottom: 16, fontFamily: "'Poppins', sans-serif" }}>Symptômes décrits</h2>
          <p style={{ fontSize: 15, color: '#333', lineHeight: '26px', margin: 0 }}>{consultation.symptoms_description}</p>

          {(consultation.age || consultation.duration || consultation.current_treatments || consultation.allergies) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
              {consultation.age && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>ÂGE</div>
                  <div style={{ fontSize: 14, color: '#333' }}>{consultation.age} ans</div>
                </div>
              )}
              {consultation.duration && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>DURÉE</div>
                  <div style={{ fontSize: 14, color: '#333' }}>{consultation.duration.replace(/_/g, ' ')}</div>
                </div>
              )}
              {consultation.current_treatments && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>TRAITEMENTS EN COURS</div>
                  <div style={{ fontSize: 14, color: '#333' }}>{consultation.current_treatments}</div>
                </div>
              )}
              {consultation.allergies && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>ALLERGIES</div>
                  <div style={{ fontSize: 14, color: '#333' }}>{consultation.allergies}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Formulaire de réponse */}
        <form onSubmit={handleSubmit} style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '24px 28px' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#222', marginBottom: 20, fontFamily: "'Poppins', sans-serif" }}>Répondre à la consultation</h2>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>
              Plante recommandée (optionnel)
            </label>
            <select
              value={plantId}
              onChange={e => setPlantId(e.target.value)}
              style={{ width: '100%', height: 50, padding: '0 16px', border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 14, color: '#333', background: C.bg, outline: 'none' }}
            >
              <option value="">— Aucune recommandation spécifique —</option>
              {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>
              Réponse <span style={{ color: '#D32F2F' }}>*</span>
            </label>
            <textarea
              required
              value={response}
              onChange={e => setResponse(e.target.value)}
              rows={6}
              placeholder="Rédigez votre conseil personnalisé basé sur les symptômes décrits..."
              style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 14, color: '#333', background: C.bg, outline: 'none', resize: 'vertical', lineHeight: '22px', boxSizing: 'border-box', fontFamily: '"Inter", Arial, sans-serif' }}
            />
          </div>

          {errorMsg && (
            <div style={{ background: '#FFF0F0', border: '1px solid #FFB3B3', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: '#D32F2F', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} /> {errorMsg}
            </div>
          )}

          {saved && (
            <div style={{ background: C.light, border: `1px solid #86efac`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: C.dark, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
              <CheckCircle style={{ width: 16, height: 16 }} /> Réponse enregistrée avec succès !
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{ height: 52, padding: '0 28px', borderRadius: 14, background: isPending ? '#9CA69B' : C.dark, color: C.white, border: 'none', fontSize: 15, fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Send style={{ width: 16, height: 16 }} />
            {isPending ? 'Envoi...' : 'Envoyer la réponse'}
          </button>
        </form>

    </div>
  )
}
