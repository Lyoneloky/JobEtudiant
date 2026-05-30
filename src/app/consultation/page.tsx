'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { submitConsultation } from '@/lib/actions'
import { Stethoscope, AlertTriangle, ArrowLeft, Send } from 'lucide-react'

const C = { primary: '#22c55e', dark: '#166534', light: '#dcfce7', beige: '#F1EFE6', text: '#616161', border: '#E8EDE4', white: '#FFFFFF', bg: '#F8FAF5' }

const inputStyle: React.CSSProperties = { width: '100%', height: 52, padding: '0 18px', border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 15, color: '#222', background: C.bg, outline: 'none', boxSizing: 'border-box', fontFamily: '"Inter", Arial, sans-serif' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }

export default function ConsultationPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

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
    <div style={{ fontFamily: '"Inter", Arial, sans-serif', background: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px 80px' }}>

        <Link href="/symptomes" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.text, textDecoration: 'none', marginBottom: 28 }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Retour à la recherche par symptôme
        </Link>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${C.dark}, #1a7a40)`, borderRadius: 24, padding: '32px 36px', marginBottom: 32, color: C.white }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope style={{ width: 26, height: 26, color: C.white }} />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, fontFamily: "'Poppins', sans-serif" }}>Demande de consultation</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>Décrivez vos symptômes pour recevoir une recommandation personnalisée</p>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertTriangle style={{ width: 16, height: 16, color: '#FFD54F', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: '20px' }}>
              Cette consultation est fournie à titre éducatif uniquement. En cas d'urgence médicale, composez le 15 ou rendez-vous à l'hôpital le plus proche.
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '28px 32px', boxShadow: '0 4px 20px rgba(22,101,52,0.06)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#222', fontFamily: "'Poppins', sans-serif", marginBottom: 22 }}>Description des symptômes</h2>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Décrivez vos symptômes <span style={{ color: '#D32F2F' }}>*</span></label>
              <textarea
                name="symptoms"
                required
                rows={5}
                placeholder="Ex : J'ai de la fièvre depuis 2 jours, accompagnée de maux de tête et de douleurs musculaires. Je transpire beaucoup la nuit..."
                style={{ ...inputStyle, height: 'auto', padding: '14px 18px', resize: 'vertical', lineHeight: '24px' }}
              />
              <p style={{ fontSize: 12, color: C.text, marginTop: 6 }}>Soyez le plus précis possible (localisation, intensité, circonstances)</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Âge du patient</label>
                <input type="number" name="age" min="1" max="120" placeholder="Ex: 35" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Depuis combien de temps ?</label>
                <select name="duration" style={{ ...inputStyle, cursor: 'pointer', background: C.bg }}>
                  <option value="">Sélectionner</option>
                  <option value="moins_24h">Moins de 24 heures</option>
                  <option value="1_3_jours">1 à 3 jours</option>
                  <option value="1_semaine">1 semaine</option>
                  <option value="plus_semaine">Plus d'une semaine</option>
                  <option value="chronique">Chronique (mois/années)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Traitements en cours</label>
              <input
                type="text"
                name="treatments"
                placeholder="Ex : Paracétamol, Artémether... ou 'Aucun'"
                style={inputStyle}
              />
              <p style={{ fontSize: 12, color: C.text, marginTop: 6 }}>Important pour vérifier les interactions avec les plantes</p>
            </div>

            <div>
              <label style={labelStyle}>Allergies connues</label>
              <input
                type="text"
                name="allergies"
                placeholder="Ex : Allergie à l'aspirine, aux arachides... ou 'Aucune connue'"
                style={inputStyle}
              />
            </div>
          </div>

          {error && (
            <div style={{ background: '#FFF0F0', border: '1px solid #FFB3B3', borderRadius: 14, padding: '14px 18px', color: '#D32F2F', fontSize: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0 }} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={isPending}
              style={{ flex: 1, height: 56, borderRadius: 16, background: isPending ? '#9CA69B' : C.dark, color: C.white, border: 'none', fontSize: 16, fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: '"Inter", Arial, sans-serif' }}
            >
              <Send style={{ width: 18, height: 18 }} />
              {isPending ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </button>
            <Link href="/symptomes"
              style={{ height: 56, padding: '0 24px', borderRadius: 16, border: `1.5px solid ${C.border}`, color: '#555', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Annuler
            </Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  )
}
