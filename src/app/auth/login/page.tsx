'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Leaf, Eye, EyeOff } from 'lucide-react'

const C = {
  primary: '#22c55e',
  primaryDark: '#166534',
  primaryLight: '#dcfce7',
  bg: '#F8FAF5',
  beige: '#F1EFE6',
  white: '#FFFFFF',
  border: '#E8EDE4',
  text: '#616161',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Vérifier la configuration Supabase AVANT tout appel réseau
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    if (!supabaseUrl.startsWith('http') || supabaseUrl.includes('placeholder')) {
      setError('⚙️ Supabase non configuré. Ouvrez le fichier .env.local et remplacez les valeurs par vos identifiants Supabase réels.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email ou mot de passe incorrect.')
        setLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erreur de connexion au serveur. Vérifiez vos identifiants Supabase dans .env.local.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, padding: '48px 16px', fontFamily: '"Inter", Arial, sans-serif' }}>
      <div style={{ background: C.white, borderRadius: 28, border: `1px solid ${C.border}`, width: '100%', maxWidth: 440, padding: 40, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, borderRadius: 20, marginBottom: 16 }}>
            <Leaf style={{ width: 34, height: 34, color: C.white }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.primaryDark, fontFamily: "'Poppins', sans-serif", marginBottom: 4 }}>TerraBio</div>
          <div style={{ fontSize: 13, color: C.text, marginBottom: 16 }}>Santé naturelle · Cameroun</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6 }}>Connexion</h1>
          <p style={{ fontSize: 14, color: C.text }}>Accédez à votre espace personnel</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              style={{ width: '100%', height: 52, padding: '0 18px', border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 15, color: '#111', background: C.bg, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>Mot de passe</label>
              <Link href="/auth/reset-password" style={{ fontSize: 13, color: C.primaryDark, fontWeight: 500, textDecoration: 'none' }}>
                Mot de passe oublié ?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', height: 52, padding: '0 52px 0 18px', border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 15, color: '#111', background: C.bg, outline: 'none', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9AA49A', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FFF0F0', border: '1px solid #FFD6D6', borderRadius: 12, padding: '12px 16px', color: '#D32F2F', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ height: 56, borderRadius: 16, background: loading ? '#9CA69B' : C.primaryDark, color: C.white, border: 'none', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: C.text, marginTop: 24 }}>
          Pas encore de compte ?{' '}
          <Link href="/auth/register" style={{ color: C.primaryDark, fontWeight: 700, textDecoration: 'none' }}>
            S&apos;inscrire gratuitement
          </Link>
        </p>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/" style={{ fontSize: 13, color: C.text, textDecoration: 'none' }}>
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
