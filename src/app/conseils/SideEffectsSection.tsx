'use client'

import { useState, useTransition } from 'react'
import { submitSideEffectReport, respondToSideEffectReport } from '@/lib/actions'
import type { SideEffectReport } from './ConseilsClient'

const C = {
  primary: '#22c55e', primaryDark: '#166534', primaryLight: '#dcfce7',
  border: '#E8EDE4', text: '#616161', white: '#FFFFFF',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `il y a ${days} jour${days > 1 ? 's' : ''}`
}

export default function SideEffectsSection({
  tipId,
  reports,
  currentUserId,
  currentUserRole,
}: {
  tipId: string
  reports: SideEffectReport[]
  currentUserId: string | null
  currentUserRole: string | null
}) {
  const [showForm,      setShowForm]      = useState(false)
  const [description,   setDescription]   = useState('')
  const [respondingTo,  setRespondingTo]  = useState<string | null>(null)
  const [responseText,  setResponseText]  = useState('')
  const [msg,           setMsg]           = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending,     startTransition]  = useTransition()

  const canRespond       = currentUserRole === 'herboriste' || currentUserRole === 'admin'
  const alreadyPending   = currentUserId
    ? reports.some(r => r.user_id === currentUserId && r.status === 'en_attente')
    : false

  function handleSubmit() {
    if (!description.trim()) return
    startTransition(async () => {
      const res = await submitSideEffectReport(tipId, description)
      if (res && !('error' in res)) {
        setMsg({ ok: true, text: "Signalement envoyé — l'herboriste vous répondra bientôt." })
        setDescription('')
        setShowForm(false)
      } else {
        setMsg({ ok: false, text: (res as { error: string })?.error ?? 'Erreur inconnue' })
      }
    })
  }

  function handleRespond(reportId: string) {
    if (!responseText.trim()) return
    startTransition(async () => {
      const res = await respondToSideEffectReport(reportId, responseText)
      if (res && !('error' in res)) {
        setMsg({ ok: true, text: 'Réponse publiée.' })
        setResponseText('')
        setRespondingTo(null)
      } else {
        setMsg({ ok: false, text: (res as { error: string })?.error ?? 'Erreur inconnue' })
      }
    })
  }

  return (
    <div style={{ marginTop: 24, borderTop: `1.5px solid ${C.border}`, paddingTop: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#92400E', fontFamily: "'Poppins',sans-serif", margin: 0 }}>
          Effets secondaires signalés
        </h4>
        {reports.length > 0 && (
          <span style={{ background: '#FEF3C7', color: '#92400E', borderRadius: 20, padding: '2px 9px', fontSize: 12, fontWeight: 700 }}>
            {reports.length}
          </span>
        )}
      </div>

      {/* Liste des signalements */}
      {reports.length === 0 ? (
        <p style={{ fontSize: 13, color: C.text, fontStyle: 'italic', marginBottom: 14 }}>
          Aucun effet secondaire signalé pour ce conseil.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {reports.map(r => (
            <div key={r.id} style={{ background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A', padding: '12px 14px' }}>

              {/* En-tête du signalement */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>
                  👤 {r.user_name ?? 'Utilisateur'}
                </span>
                <span style={{ fontSize: 11, color: '#B45309' }}>{timeAgo(r.created_at)}</span>
              </div>
              <p style={{ fontSize: 13, color: '#78350F', lineHeight: '20px', margin: 0 }}>{r.description}</p>

              {/* Réponse herboriste */}
              {r.status === 'repondu' && r.herboriste_response && (
                <div style={{ marginTop: 10, background: C.primaryLight, borderRadius: 8, padding: '10px 12px', borderLeft: `3px solid ${C.primary}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.primaryDark, marginBottom: 4 }}>
                    ✅ Réponse de {r.herboriste_name ?? "l'herboriste"}
                  </div>
                  <p style={{ fontSize: 13, color: '#166534', lineHeight: '20px', margin: 0 }}>
                    {r.herboriste_response}
                  </p>
                </div>
              )}

              {/* Badge en attente (utilisateur) */}
              {r.status === 'en_attente' && !canRespond && (
                <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F3F4F6', borderRadius: 6, padding: '3px 10px' }}>
                  <span style={{ fontSize: 10, color: '#6B7280' }}>⏳ En attente de réponse</span>
                </div>
              )}

              {/* Formulaire de réponse herboriste */}
              {r.status === 'en_attente' && canRespond && (
                <div style={{ marginTop: 10 }}>
                  {respondingTo === r.id ? (
                    <div>
                      <textarea
                        value={responseText}
                        onChange={e => setResponseText(e.target.value)}
                        placeholder="Votre réponse à ce signalement..."
                        rows={3}
                        style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${C.primary}`, borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <button
                          onClick={() => handleRespond(r.id)}
                          disabled={isPending || !responseText.trim()}
                          style={{ height: 32, padding: '0 14px', background: C.primaryDark, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', opacity: !responseText.trim() ? 0.6 : 1 }}
                        >
                          {isPending ? 'Envoi...' : 'Publier la réponse'}
                        </button>
                        <button
                          onClick={() => { setRespondingTo(null); setResponseText('') }}
                          style={{ height: 32, padding: '0 12px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingTo(r.id)}
                      style={{ height: 28, padding: '0 12px', background: C.primaryLight, color: C.primaryDark, border: `1px solid ${C.primary}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Répondre à ce signalement
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message feedback */}
      {msg && (
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: msg.ok ? C.primaryLight : '#FFF0F0', border: `1px solid ${msg.ok ? C.primary : '#FFD6D6'}`, color: msg.ok ? C.primaryDark : '#D32F2F', fontSize: 13 }}>
          {msg.text}
        </div>
      )}

      {/* Bouton signaler (utilisateur non-herboriste) */}
      {currentUserId && !canRespond && (
        alreadyPending ? (
          <p style={{ fontSize: 12, color: C.text, fontStyle: 'italic', margin: 0 }}>
            Votre signalement est en attente de réponse.
          </p>
        ) : !showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{ height: 36, padding: '0 16px', background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            ⚠️ Signaler un effet secondaire
          </button>
        ) : (
          <div style={{ background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A', padding: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>
              Décrivez l'effet secondaire rencontré :
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex : J'ai eu des nausées après la deuxième prise..."
              rows={3}
              style={{ width: '100%', padding: '8px 10px', border: '1.5px solid #FDE68A', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: C.white }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={handleSubmit}
                disabled={isPending || !description.trim()}
                style={{ height: 34, padding: '0 16px', background: '#D97706', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', opacity: !description.trim() ? 0.6 : 1 }}
              >
                {isPending ? 'Envoi...' : 'Envoyer le signalement'}
              </button>
              <button
                onClick={() => { setShowForm(false); setDescription('') }}
                style={{ height: 34, padding: '0 12px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
              >
                Annuler
              </button>
            </div>
          </div>
        )
      )}

      {!currentUserId && (
        <p style={{ fontSize: 12, color: C.text, fontStyle: 'italic', margin: 0 }}>
          <a href="/auth/login" style={{ color: C.primaryDark, fontWeight: 600 }}>Connectez-vous</a> pour signaler un effet secondaire.
        </p>
      )}
    </div>
  )
}
