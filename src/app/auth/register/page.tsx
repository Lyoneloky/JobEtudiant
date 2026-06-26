'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { submitHerboristeApplication } from '@/lib/actions'
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
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState('user')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!displayName.trim()) {
      setError("Veuillez saisir votre nom complet.")
      return
    }

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
      if (role === 'herboriste') {
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
        formData.append('displayName', displayName.trim())

        const res = await submitHerboristeApplication(formData)
        if (res && 'error' in res && res.error) {
          setError(res.error)
          setLoading(false)
          return
        }

        setSuccess(true)
        setTimeout(() => router.push('/auth/login'), 6000)
        return
      }

      // Rôle standard 'user' -> création de compte directe
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            role: role,
          }
        }
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      // Fallback : Mettre à jour directement la table profiles si l'utilisateur est authentifié immédiatement
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ display_name: displayName.trim(), role: role, approved: true })
          .eq('id', data.user.id)
      }

      // Si session déjà créée → confirmation email désactivée → connexion directe
      // Les nouveaux inscrits ont le rôle 'user' → page d'accueil
      if (data.session) {
        router.push('/plantes')
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

  const backgroundStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#EAF5EE', // Teinte menthe très douce
    padding: '24px 16px',
    fontFamily: '"Inter", Arial, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  }

  const blob1: React.CSSProperties = {
    position: 'absolute',
    width: '600px',
    height: '600px',
    background: '#20a370', // Cercle vert vif net comme dans le modèle
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
    background: '#20a370', // Cercle vert vif net
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
    background: '#20a370', // Cercle sur le côté gauche du fond
    top: '40%',
    left: '-150px',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0,
  }

  if (success) {
    return (
      <div style={backgroundStyle}>
        <div style={blob1} className="animate-sway-1" />
        <div style={blob2} className="animate-sway-2" />
        <div style={blob3} className="animate-sway-1" />
        <div style={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 28,
          border: '1px solid rgba(255, 255, 255, 0.4)',
          width: '100%',
          maxWidth: 460,
          padding: 40,
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(22,101,52,0.1)',
          zIndex: 1,
        }}>
          <div style={{ width: 80, height: 80, background: C.primaryLight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 20px rgba(34,197,94,0.15)' }}>
            <Leaf style={{ width: 38, height: 38, color: C.primaryDark }} />
          </div>
          {role === 'herboriste' ? (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', fontFamily: "'Poppins', sans-serif", marginBottom: 12 }}>Demande enregistrée !</h2>
              <p style={{ fontSize: 14.5, color: '#5A6E5C', lineHeight: '22px', margin: 0 }}>
                Votre demande d&apos;inscription en tant qu&apos;<strong>herboriste</strong> a été transmise à l&apos;administrateur.<br /><br />
                Votre compte sera créé après vérification et validation de vos informations professionnelles.<br /><br />
                <span style={{ fontSize: 13, color: '#888' }}>Redirection vers la page de connexion...</span>
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', fontFamily: "'Poppins', sans-serif", marginBottom: 12 }}>Compte créé !</h2>
              <p style={{ fontSize: 15, color: '#5A6E5C', lineHeight: '24px', margin: 0 }}>
                Un email de confirmation vous a été envoyé.<br />
                Veuillez vérifier votre boîte de réception.<br />
                Redirection en cours...
              </p>
            </>
          )}
        </div>
      </div>
    )
  }


  return (
    <div style={backgroundStyle}>
      {/* Cercles de fond nets et animés (Modèle login.jpg agité comme des feuilles) */}
      <div style={blob1} className="animate-sway-1" />
      <div style={blob2} className="animate-sway-2" />
      <div style={blob3} className="animate-sway-1" />

      {/* Carte principale avec effet Glassmorphism */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 28,
        border: '1px solid rgba(255, 255, 255, 0.4)',
        width: '100%',
        maxWidth: 900,
        minHeight: 520,
        boxShadow: '0 20px 60px rgba(22,101,52,0.08)',
        overflow: 'hidden',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      }} className="grid md:grid-cols-2">

        {/* ── COLONNE DE GAUCHE : Illustration / Bienvenue (Masqué sur mobile) avec effet Glassmorphism ── */}
        <div className="hidden md:flex" style={{
          background: 'rgba(234, 246, 238, 0.5)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 520,
        }}>
          {/* Vague SVG Dégradée plus organique */}
          <svg viewBox="0 0 500 300" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '55%', zIndex: 0 }}>
            <defs>
              <linearGradient id="gradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#166534" />
                <stop offset="60%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#a3e635" />
              </linearGradient>
            </defs>
            <path d="M0,0 L500,0 L500,120 C420,150 380,50 300,180 C240,280 200,120 150,190 C100,250 50,150 0,180 Z" fill="url(#gradientGreen)" />
          </svg>

          {/* Logo & Marque */}
          <div style={{ position: 'relative', zIndex: 1, padding: '24px 24px 0 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="TerraBio" style={{ width: 36, height: 36, borderRadius: 10, border: '2px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
            <span style={{ fontSize: 16, fontWeight: 800, color: 'white', fontFamily: "'Poppins', sans-serif" }}>TerraBio</span>
          </div>

          {/* Message de Bienvenue */}
          <div style={{ position: 'relative', zIndex: 1, padding: '0 32px', textAlign: 'center', marginTop: '30px' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', fontFamily: "'Poppins', sans-serif", marginBottom: 8 }}>
              Rejoignez TerraBio !
            </h2>
            <p style={{ fontSize: 12.5, color: '#5A6E5C', lineHeight: '18px', maxWidth: '300px', margin: '0 auto' }}>
              Créez votre compte pour enregistrer vos plantes favorites, suivre vos remèdes et demander des conseils personnalisés.
            </p>
          </div>

          {/* Cercles de plantes avec émojis simples (Modèle login.jpg) */}
          <div style={{ position: 'relative', height: '140px', zIndex: 1 }}>
            {/* Bulle 1 */}
            <div style={{ position: 'absolute', bottom: '40px', left: '10%', width: '56px', height: '56px', borderRadius: '50%', background: 'white', border: '3px solid white', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
              🌿
            </div>
            {/* Bulle 2 */}
            <div style={{ position: 'absolute', bottom: '80px', left: '32%', width: '48px', height: '48px', borderRadius: '50%', background: 'white', border: '3px solid white', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              🫚
            </div>
            {/* Bulle 3 */}
            <div style={{ position: 'absolute', bottom: '15px', left: '48%', width: '46px', height: '46px', borderRadius: '50%', background: 'white', border: '3px solid white', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              🪴
            </div>
            {/* Bulle 4 */}
            <div style={{ position: 'absolute', bottom: '45px', right: '10%', width: '58px', height: '58px', borderRadius: '50%', background: 'white', border: '3px solid white', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              🍋
            </div>
          </div>

          {/* Indicateur de pagination */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: '16px' }}>
            <div style={{ width: 24, height: 6, borderRadius: 3, background: '#166534' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1' }} />
          </div>
        </div>

        {/* ── COLONNE DE DROITE : Formulaire ── */}
        <div style={{ padding: '24px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* Titre */}
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111', fontFamily: "'Poppins', sans-serif" }}>
              Créer un compte
            </h1>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Nom complet (Underlined) */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#889988', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                Nom complet
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                placeholder="Ex: Marie Dupont"
                className="w-full h-10 border-b-2 border-[#E8EDE4] focus:border-[#166534] bg-transparent text-[15px] text-gray-900 outline-none transition-colors duration-200 py-1"
              />
            </div>

            {/* Type de compte / Rôle */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#889988', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                Type de compte
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full h-10 border-b-2 border-[#E8EDE4] focus:border-[#166534] bg-transparent text-[15px] text-gray-900 outline-none transition-colors duration-200 py-1 cursor-pointer"
              >
                <option value="user" style={{ background: '#fff' }}>Utilisateur (Recherche de conseils & remèdes)</option>
                <option value="herboriste" style={{ background: '#fff' }}>Herboriste (Spécialiste des plantes)</option>
              </select>
            </div>

            {/* Email (Underlined) */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#889988', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="w-full h-10 border-b-2 border-[#E8EDE4] focus:border-[#166534] bg-transparent text-[15px] text-gray-900 outline-none transition-colors duration-200 py-1"
              />
            </div>

            {/* Mot de passe (Underlined + Toggle Icon) */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#889988', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 caractères"
                  className="w-full h-10 border-b-2 border-[#E8EDE4] focus:border-[#166534] bg-transparent text-[15px] text-gray-900 outline-none transition-colors duration-200 py-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9AA49A', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
            </div>

            {/* Confirmer le mot de passe (Underlined) */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#889988', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                Confirmer le mot de passe
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="Répétez le mot de passe"
                className="w-full h-10 border-b-2 border-[#E8EDE4] focus:border-[#166534] bg-transparent text-[15px] text-gray-900 outline-none transition-colors duration-200 py-1"
              />
            </div>

            {/* Message d'erreur */}
            {error && (
              <div style={{ background: '#FFF0F0', border: '1px solid #FFD6D6', borderRadius: 12, padding: '10px 16px', color: '#D32F2F', fontSize: 13.5 }}>
                {error}
              </div>
            )}

            {/* Bouton de validation */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-white font-semibold transition-colors duration-200"
              style={{
                background: loading ? '#9CA69B' : '#166534',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(22,101,52,0.2)',
                border: 'none',
              }}
            >
              {loading ? 'Création du compte...' : "S'inscrire gratuitement"}
            </button>
          </form>

          {/* Délimiteur */}
          <div style={{ margin: '14px 0 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: '1px', background: '#E8EDE4' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#9AA49A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ou s&apos;inscrire avec
            </span>
            <div style={{ flex: 1, height: '1px', background: '#E8EDE4' }} />
          </div>

          {/* Boutons Sociaux */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', gap: 18, background: 'white', padding: '10px 24px', borderRadius: '30px', boxShadow: '0 8px 20px rgba(0,0,0,0.04)', border: '1px solid #E8EDE4' }}>
              
              {/* Google */}
              <button
                type="button"
                onClick={() => alert(`Inscription avec Google (Simulé pour la démo)`)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Google"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                  <path fill="#4285F4" d="M23.49 12.275c0-.825-.075-1.613-.213-2.375H12v4.5h6.488a5.626 5.626 0 0 1-2.438 3.688v3.063h3.938c2.3-2.12 3.5-5.23 3.5-8.876Z"/>
                  <path fill="#FBBC05" d="M5.266 14.235A7.09 7.09 0 0 1 4.909 12c0-.79.13-1.55.357-2.264L1.24 6.621A11.968 11.968 0 0 0 0 12c0 1.92.455 3.733 1.24 5.379l4.026-3.144Z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.912l-3.938-3.063c-1.09.73-2.49 1.163-4.022 1.163-3.11 0-5.743-2.1-6.682-4.925l-4.026 3.144C3.198 21.302 7.27 24 12 24Z"/>
                </svg>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={() => alert(`Inscription avec Twitter (Simulé pour la démo)`)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Twitter"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#1DA1F2">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => alert(`Inscription avec Facebook (Simulé pour la démo)`)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Déjà membre ? Se connecter (Déplacé en bas) */}
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7B69', marginTop: 14 }}>
            Déjà membre ?{' '}
            <Link href="/auth/login" style={{ color: '#166534', fontWeight: 700, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>

          {/* Retour à l'accueil */}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link href="/" style={{ fontSize: '13px', color: '#6B7B69', textDecoration: 'none' }}>
              ← Retour à l&apos;accueil
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
