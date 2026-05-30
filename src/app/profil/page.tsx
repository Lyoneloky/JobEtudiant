'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/lib/actions'
import { User, Heart, Leaf, LogOut, Save, CheckCircle, ArrowLeft, Stethoscope } from 'lucide-react'

const C = { dark: '#166534', light: '#dcfce7', beige: '#F1EFE6', text: '#616161', border: '#E8EDE4', white: '#FFFFFF', bg: '#F8FAF5' }
const inputStyle: React.CSSProperties = { width: '100%', height: 52, padding: '0 18px', border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 15, color: '#222', background: C.bg, outline: 'none', boxSizing: 'border-box', fontFamily: '"Inter", Arial, sans-serif' }

export default function ProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null)
  const [profile, setProfile] = useState<{ display_name: string | null }>({ display_name: null })
  const [stats, setStats] = useState({ favorites: 0, consultations: 0 })
  const [displayName, setDisplayName] = useState('')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser({ id: data.user.id, email: data.user.email ?? null })

      const [{ data: prof }, { count: favCount }, { count: consCount }] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', data.user.id).single(),
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', data.user.id),
        supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('user_id', data.user.id),
      ])
      if (prof) { setProfile(prof); setDisplayName(prof.display_name ?? '') }
      setStats({ favorites: favCount ?? 0, consultations: consCount ?? 0 })
      setLoading(false)
    })
  }, [router])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await updateProfile(displayName)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ fontFamily: '"Inter", Arial, sans-serif', background: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: C.text }}>Chargement...</div>
    </div>
  )

  const initials = (profile.display_name ?? user?.email ?? 'U').charAt(0).toUpperCase()

  return (
    <div style={{ fontFamily: '"Inter", Arial, sans-serif', background: C.bg, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px 80px' }}>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.text, textDecoration: 'none', marginBottom: 28 }}>
          <ArrowLeft style={{ width: 16, height: 16 }} /> Tableau de bord
        </Link>

        {/* En-tête */}
        <div style={{ background: `linear-gradient(135deg, ${C.dark}, #1a7a40)`, borderRadius: 24, padding: '32px 36px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, color: '#fff', fontFamily: "'Poppins', sans-serif", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: "'Poppins', sans-serif", margin: '0 0 4px' }}>
              {profile.display_name ?? 'Mon profil'}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{user?.email}</p>
            <span style={{ display: 'inline-block', height: 24, padding: '0 12px', background: 'rgba(255,255,255,0.15)', borderRadius: 999, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: 8 }}>
              Utilisateur TerraBio
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { Icon: Heart, label: 'Favoris', value: stats.favorites, color: '#D32F2F', bg: '#FFF0F0' },
            { Icon: Stethoscope, label: 'Consultations', value: stats.consultations, color: C.dark, bg: C.light },
            { Icon: Leaf, label: 'Plantes vues', value: '--', color: '#1565C0', bg: '#E3F2FD' },
          ].map(({ Icon, label, value, color, bg }) => (
            <div key={label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: '18px 20px', textAlign: 'center', boxShadow: '0 4px 16px rgba(22,101,52,0.05)' }}>
              <div style={{ width: 44, height: 44, background: bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <Icon style={{ width: 20, height: 20, color }} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#111' }}>{value}</div>
              <div style={{ fontSize: 13, color: C.text, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Modifier profil */}
        <form onSubmit={handleSave} style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '24px 28px', marginBottom: 16, boxShadow: '0 4px 20px rgba(22,101,52,0.05)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#222', fontFamily: "'Poppins', sans-serif", marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User style={{ width: 18, height: 18, color: C.dark }} /> Modifier mon profil
          </h2>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>Nom d'affichage</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Ex: Marie Dupont" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>Email</label>
            <input type="email" value={user?.email ?? ''} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
            <p style={{ fontSize: 12, color: C.text, marginTop: 6 }}>L'email ne peut pas être modifié ici.</p>
          </div>
          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.light, borderRadius: 12, padding: '10px 16px', marginBottom: 16, color: C.dark, fontSize: 14, fontWeight: 600 }}>
              <CheckCircle style={{ width: 18, height: 18 }} /> Profil mis à jour avec succès !
            </div>
          )}
          <button type="submit" disabled={isPending} style={{ height: 50, padding: '0 28px', borderRadius: 14, background: isPending ? '#9CA69B' : C.dark, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: '"Inter", Arial, sans-serif' }}>
            <Save style={{ width: 16, height: 16 }} /> {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>

        {/* Déconnexion */}
        <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(22,101,52,0.05)' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#D32F2F', marginBottom: 2 }}>Se déconnecter</div>
            <div style={{ fontSize: 13, color: C.text }}>Vous serez redirigé vers l'accueil</div>
          </div>
          <button onClick={handleSignOut} style={{ height: 42, padding: '0 20px', background: '#FFF0F0', border: '1px solid #FFB3B3', borderRadius: 12, color: '#D32F2F', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: '"Inter", Arial, sans-serif' }}>
            <LogOut style={{ width: 15, height: 15 }} /> Se déconnecter
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
