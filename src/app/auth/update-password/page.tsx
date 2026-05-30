'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Leaf, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'

const C = { primary:'#22c55e', primaryDark:'#166534', primaryLight:'#dcfce7', bg:'#F8FAF5', white:'#FFFFFF', border:'#E8EDE4', text:'#616161' }

export default function UpdatePasswordPage() {
  const router               = useRouter()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError("Impossible de mettre à jour le mot de passe. Le lien a peut-être expiré.")
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3
  const strengthColors = ['#E8EDE4', '#D32F2F', '#E65100', C.primary]
  const strengthLabels = ['', 'Trop court', 'Acceptable', 'Robuste']

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:C.bg, padding:'48px 16px', fontFamily:'"Inter",Arial,sans-serif' }}>
      <div style={{ background:C.white, borderRadius:28, border:`1px solid ${C.border}`, width:'100%', maxWidth:440, padding:40, boxShadow:'0 20px 60px rgba(0,0,0,0.08)' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:64, height:64, background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`, borderRadius:18, marginBottom:14 }}>
            <Leaf style={{ width:30, height:30, color:C.white }}/>
          </div>
          <div style={{ fontSize:22, fontWeight:800, color:C.primaryDark, fontFamily:"'Poppins',sans-serif" }}>TerraBio</div>
        </div>

        {success ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ width:72, height:72, background:C.primaryLight, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <CheckCircle style={{ width:34, height:34, color:C.primaryDark }}/>
            </div>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#111', fontFamily:"'Poppins',sans-serif", marginBottom:10 }}>Mot de passe mis à jour !</h2>
            <p style={{ fontSize:14, color:C.text }}>Redirection vers votre tableau de bord...</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom:28 }}>
              <h1 style={{ fontSize:22, fontWeight:800, color:'#111', fontFamily:"'Poppins',sans-serif", marginBottom:6 }}>Nouveau mot de passe</h1>
              <p style={{ fontSize:14, color:C.text }}>Choisissez un mot de passe sécurisé d&apos;au moins 8 caractères.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
              <div>
                <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#333', marginBottom:8 }}>Nouveau mot de passe</label>
                <div style={{ position:'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Minimum 8 caractères"
                    style={{ width:'100%', height:52, padding:'0 52px 0 18px', border:`1.5px solid ${C.border}`, borderRadius:14, fontSize:15, color:'#111', background:C.bg, outline:'none', boxSizing:'border-box' as const }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9AA49A', display:'flex', alignItems:'center' }}>
                    {showPwd ? <EyeOff style={{ width:18, height:18 }}/> : <Eye style={{ width:18, height:18 }}/>}
                  </button>
                </div>
                {/* Indicateur force */}
                {password.length > 0 && (
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{ flex:1, height:4, borderRadius:2, background:i <= strength ? strengthColors[strength] : '#E8EDE4', transition:'background .2s' }}/>
                      ))}
                    </div>
                    <div style={{ fontSize:12, color:strengthColors[strength], fontWeight:600 }}>{strengthLabels[strength]}</div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display:'block', fontSize:14, fontWeight:600, color:'#333', marginBottom:8 }}>Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ width:'100%', height:52, padding:'0 18px', border:`1.5px solid ${confirm && confirm !== password ? '#D32F2F' : C.border}`, borderRadius:14, fontSize:15, color:'#111', background:C.bg, outline:'none', boxSizing:'border-box' as const }}
                />
                {confirm && confirm !== password && (
                  <p style={{ fontSize:12, color:'#D32F2F', marginTop:5 }}>Les mots de passe ne correspondent pas.</p>
                )}
              </div>

              {error && (
                <div style={{ background:'#FFF0F0', border:'1px solid #FFD6D6', borderRadius:12, padding:'12px 16px', color:'#D32F2F', fontSize:14, display:'flex', gap:8, alignItems:'flex-start' }}>
                  <AlertTriangle style={{ width:16, height:16, flexShrink:0, marginTop:1 }}/> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ height:52, borderRadius:14, background:loading?'#9CA69B':C.primaryDark, color:C.white, border:'none', fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', marginTop:4 }}
              >
                {loading ? 'Mise à jour...' : 'Enregistrer le mot de passe'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
