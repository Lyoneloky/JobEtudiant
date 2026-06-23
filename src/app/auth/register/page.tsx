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

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    // Vérifier la configuration Supabase AVANT tout appel réseau
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    if (!supabaseUrl.startsWith('http') || supabaseUrl.includes('placeholder')) {
      setError('⚙️ Supabase non configuré. Ouvrez le fichier .env.local et remplacez les valeurs par vos identifiants Supabase réels (NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY).')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      // Si session déjà créée → confirmation email désactivée → connexion directe
      if (data.session) {
        router.push('/dashboard')
        router.refresh()
        return
      }
      // Sinon → confirmation email requise
      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch {
      setError('Erreur de connexion au serveur. Vérifiez vos identifiants Supabase dans .env.local.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, padding: '48px 16px', fontFamily: '"Inter", Arial, sans-serif' }}>
        <div style={{ background: C.white, borderRadius: 28, border: `1px solid ${C.border}`, width: '100%', maxWidth: 440, padding: 40, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 80, height: 80, background: C.primaryLight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Leaf style={{ width: 38, height: 38, color: C.primaryDark }} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', fontFamily: "'Poppins', sans-serif", marginBottom: 10 }}>Compte créé !</h2>
          <p style={{ fontSize: 15, color: C.text, lineHeight: '24px' }}>Vérifiez votre email pour confirmer votre inscription. Redirection vers la connexion...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, padding: '48px 16px', fontFamily: '"Inter", Arial, sans-serif' }}>
      <div style={{ background: C.white, borderRadius: 28, border: `1px solid ${C.border}`, width: '100%', maxWidth: 440, padding: 40, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/logo.png" alt="TerraBio" style={{ width: 72, height: 72, borderRadius: 20, marginBottom: 16 }} />
          <div style={{ fontSize: 26, fontWeight: 800, color: C.primaryDark, fontFamily: "'Poppins', sans-serif", marginBottom: 4 }}>TerraBio</div>
          <div style={{ fontSize: 13, color: C.text, marginBottom: 16 }}>Santé naturelle · Cameroun</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6 }}>Créer un compte</h1>
          <p style={{ fontSize: 14, color: C.text }}>Rejoignez la plateforme TerraBio — Accès gratuit</p>
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
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Minimum 6 caractères"
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

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8 }}>Confirmer le mot de passe</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="Répétez le mot de passe"
              style={{ width: '100%', height: 52, padding: '0 18px', border: `1.5px solid ${C.border}`, borderRadius: 14, fontSize: 15, color: '#111', background: C.bg, outline: 'none', boxSizing: 'border-box' }}
            />
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
            {loading ? 'Création...' : 'Créer mon compte gratuitement'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: C.text, marginTop: 24 }}>
          Déjà un compte ?{' '}
          <Link href="/auth/login" style={{ color: C.primaryDark, fontWeight: 700, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </p>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/" style={{ fontSize: 13, color: C.text, textDecoration: 'none' }}>
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
