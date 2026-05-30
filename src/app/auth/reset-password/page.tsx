'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Leaf, ArrowLeft, Mail, CheckCircle } from 'lucide-react'

const C = { primary:'#22c55e', primaryDark:'#166534', primaryLight:'#dcfce7', bg:'#F8FAF5', white:'#FFFFFF', border:'#E8EDE4', text:'#616161' }

export default function ResetPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const origin   = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?type=recovery`,
    })
    if (error) { setError("Impossible d'envoyer l'email. Vérifiez l'adresse saisie."); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:C.bg, padding:'48px 16px', fontFamily:'"Inter",Arial,sans-serif' }}>
      <div style={{ background:C.white, borderRadius:28, border:`1px solid ${C.border}`, width:'100%', maxWidth:440, padding:40, boxShadow:'0 20px 60px rgba(0,0,0,0.08)' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:64, height:64, background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`, borderRadius:18, marginBottom:14 }}>
            <Leaf style={{ width:30, height:30, color:C.white }}/>
          </div>
          <div style={{ fontSize:22, fontWeight:800, color:C.primaryDark, fontFamily:"'Poppins',sans-serif", marginBottom:4 }}>TerraBio</div>
        </div>

        {sent ? (
          /* ── Confirmation envoi ── */
          <div style={{ textAlign:'center' }}>
            <div style={{ width:72, height:72, background:C.primaryLight, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <CheckCircle style={{ width:34, height:34, color:C.primaryDark }}/>
            </div>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#111', fontFamily:"'Poppins',sans-serif", marginBottom:12 }}>Email envoyé !</h2>
            <p style={{ fontSize:14, color:C.text, lineHeight:'22px', marginBottom:28 }}>
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.<br/>
              Vérifiez votre boîte de réception (et vos spams).
            </p>
            <Link href="/auth/login" style={{ display:'inline-flex', alignItems:'center', gap:8, height:48, padding:'0 28px', borderRadius:14, background:C.primaryDark, color:C.white, fontSize:15, fontWeight:700, textDecoration:'none' }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          /* ── Formulaire email ── */
          <>
            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontSize:22, fontWeight:800, color:'#111', fontFamily:"'Poppins',sans-serif", marginBottom:6 }}>Mot de passe oublié</h1>
              <p style={{ fontSize:14, color:C.text, lineHeight:'21px' }}>
                Saisissez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
              <div>
                <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#333', marginBottom:8 }}>Adresse email</label>
                <div style={{ position:'relative' }}>
                  <Mail style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', width:17, height:17, color:'#9AA49A' }}/>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                    style={{ width:'100%', height:52, paddingLeft:46, paddingRight:16, border:`1.5px solid ${C.border}`, borderRadius:14, fontSize:15, color:'#111', background:C.bg, outline:'none', boxSizing:'border-box' as const }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ background:'#FFF0F0', border:'1px solid #FFD6D6', borderRadius:12, padding:'12px 16px', color:'#D32F2F', fontSize:14 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ height:52, borderRadius:14, background:loading?'#9CA69B':C.primaryDark, color:C.white, border:'none', fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer' }}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
            </form>

            <div style={{ textAlign:'center', marginTop:24 }}>
              <Link href="/auth/login" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:14, color:C.text, textDecoration:'none' }}>
                <ArrowLeft style={{ width:14, height:14 }}/> Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
