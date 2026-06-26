'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Home, Clock } from 'lucide-react'

const C = {
  primary: '#22c55e',
  primaryDark: '#166534',
  primaryLight: '#dcfce7',
  bg: '#EAF5EE',
  white: '#FFFFFF',
  border: '#E8EDE4',
  text: '#616161',
}

export default function PendingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch {
      setLoading(false)
    }
  }

  const backgroundStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: C.bg,
    padding: '24px 16px',
    fontFamily: '"Inter", Arial, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  }

  const blob1: React.CSSProperties = {
    position: 'absolute',
    width: '600px',
    height: '600px',
    background: '#20a370',
    top: '-250px',
    right: '-250px',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0,
  }

  const blob2: React.CSSProperties = {
    position: 'absolute',
    width: '500px',
    height: '500px',
    background: '#20a370',
    bottom: '-250px',
    left: '-250px',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0,
  }

  const blob3: React.CSSProperties = {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: '#20a370',
    top: '40%',
    left: '-150px',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0,
  }

  return (
    <div style={backgroundStyle}>
      <div style={blob1} className="animate-sway-1" />
      <div style={blob2} className="animate-sway-2" />
      <div style={blob3} className="animate-sway-1" />

      {/* Card principale */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 28,
        border: '1px solid rgba(255, 255, 255, 0.4)',
        width: '100%',
        maxWidth: 480,
        padding: '40px 32px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(22,101,52,0.1)',
        zIndex: 1,
      }}>
        {/* Icône animée */}
        <div style={{
          width: 80,
          height: 80,
          background: C.primaryLight,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 20px rgba(34,197,94,0.15)',
          position: 'relative'
        }}>
          <Clock style={{ width: 38, height: 38, color: C.primaryDark }} />
          <span style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 16 }}>⏳</span>
        </div>

        {/* Titre */}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', fontFamily: "'Poppins', sans-serif", marginBottom: 12 }}>
          Compte en attente de validation
        </h2>

        {/* Description */}
        <p style={{ fontSize: 14.5, color: '#5A6E5C', lineHeight: '22px', marginBottom: 28 }}>
          Votre demande d&apos;inscription en tant qu&apos;<strong>herboriste</strong> a bien été enregistrée.<br />
          Pour des raisons de sécurité, un administrateur doit confirmer votre profil professionnel avant que vous ne puissiez accéder à la plateforme.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleSignOut}
            disabled={loading}
            style={{
              height: 48,
              borderRadius: 14,
              background: '#FFF0F0',
              border: '1.5px solid #FFB3B3',
              color: '#D32F2F',
              fontSize: 14.5,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              fontFamily: '"Inter", Arial, sans-serif'
            }}
          >
            <LogOut style={{ width: 16, height: 16 }} />
            {loading ? 'Déconnexion...' : 'Se déconnecter'}
          </button>

          <Link href="/" style={{
            height: 48,
            borderRadius: 14,
            background: C.primaryDark,
            color: '#fff',
            fontSize: 14.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(22,101,52,0.15)',
            width: '100%',
            fontFamily: '"Inter", Arial, sans-serif'
          }}>
            <Home style={{ width: 16, height: 16 }} />
            Retourner à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
