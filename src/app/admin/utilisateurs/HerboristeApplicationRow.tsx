'use client'

import { useState, useTransition } from 'react'
import { approveHerboristeApplication, rejectHerboristeApplication } from '@/lib/actions'
import { CheckCircle, XCircle } from 'lucide-react'

const C = { primaryDark:'#166534', primaryLight:'#dcfce7', primary:'#22c55e' }

type App = { id:string; email:string; display_name:string; created_at:string }

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
}

export default function HerboristeApplicationRow({ app, isLast }: { app: App; isLast: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)
  const [err,  setErr]  = useState('')

  function handleApprove() {
    startTransition(async () => {
      const res = await approveHerboristeApplication(app.id)
      if (res && 'error' in res) setErr(res.error)
      else setDone('approved')
    })
  }

  function handleReject() {
    startTransition(async () => {
      const res = await rejectHerboristeApplication(app.id)
      if (res && 'error' in res) setErr(res.error)
      else setDone('rejected')
    })
  }

  if (done === 'approved') return (
    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1.5fr', padding:'14px 22px', borderBottom: isLast ? 'none' : '1px solid #E8EDE4', alignItems:'center', gap:8, background:'#F0FDF4' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <CheckCircle style={{ width:18, height:18, color:C.primaryDark }}/>
        <span style={{ fontSize:14, color:C.primaryDark, fontWeight:600 }}>{app.display_name} — Compte créé</span>
      </div>
      <span style={{ fontSize:13, color:'#4B7A5A' }}>{app.email}</span>
      <span style={{ fontSize:12, color:'#4B7A5A' }}>✅ Approuvé</span>
    </div>
  )

  if (done === 'rejected') return (
    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1.5fr', padding:'14px 22px', borderBottom: isLast ? 'none' : '1px solid #E8EDE4', alignItems:'center', gap:8, background:'#FFF5F5' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <XCircle style={{ width:18, height:18, color:'#D32F2F' }}/>
        <span style={{ fontSize:14, color:'#D32F2F', fontWeight:600 }}>{app.display_name} — Rejetée</span>
      </div>
      <span style={{ fontSize:13, color:'#B45309' }}>{app.email}</span>
      <span style={{ fontSize:12, color:'#D32F2F' }}>❌ Rejeté</span>
    </div>
  )

  const initial = app.display_name.charAt(0).toUpperCase()

  return (
    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1.5fr', padding:'14px 22px', borderBottom: isLast ? 'none' : '1px solid #E8EDE4', alignItems:'center', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:'50%', background:'#FEF3C7', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, color:'#92400E', flexShrink:0 }}>
          {initial}
        </div>
        <div>
          <div style={{ fontSize:14, color:'#111', fontWeight:600 }}>{app.display_name}</div>
          <div style={{ fontSize:12, color:'#616161' }}>{app.email}</div>
        </div>
      </div>
      <div style={{ fontSize:13, color:'#616161' }}>{formatDate(app.created_at)}</div>
      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
        {err && <span style={{ fontSize:12, color:'#D32F2F', width:'100%' }}>{err}</span>}
        <button onClick={handleApprove} disabled={isPending}
          style={{ height:34, padding:'0 14px', background:C.primaryDark, color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:isPending?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:6, opacity:isPending?0.6:1 }}>
          <CheckCircle style={{ width:14, height:14 }}/>
          {isPending ? '...' : 'Approuver'}
        </button>
        <button onClick={handleReject} disabled={isPending}
          style={{ height:34, padding:'0 14px', background:'#FFF0F0', color:'#D32F2F', border:'1px solid #FFB3B3', borderRadius:10, fontSize:13, fontWeight:700, cursor:isPending?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:6, opacity:isPending?0.6:1 }}>
          <XCircle style={{ width:14, height:14 }}/>
          {isPending ? '...' : 'Rejeter'}
        </button>
      </div>
    </div>
  )
}
