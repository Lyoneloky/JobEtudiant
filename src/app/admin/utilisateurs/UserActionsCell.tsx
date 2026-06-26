'use client'

import { useState, useTransition } from 'react'
import { Shield, UserCheck, UserX, ChevronDown } from 'lucide-react'
import { approveUser, blockUser, changeUserRole } from '@/lib/actions'

const C = { primary: '#22c55e', primaryDark: '#166534', primaryLight: '#dcfce7', text: '#616161', border: '#E8EDE4', white: '#FFFFFF' }

type Props = {
  userId: string
  role: string
  approved: boolean
  isSelf: boolean
}

export default function UserActionsCell({ userId, role, approved, isSelf }: Props) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [showRoleMenu, setShowRoleMenu] = useState(false)

  function flash(type: 'ok' | 'err', msg: string) {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 3000)
  }

  function handleApprove() {
    startTransition(async () => {
      const res = await approveUser(userId)
      if (res && 'error' in res && res.error) flash('err', res.error)
      else flash('ok', 'Utilisateur approuvé')
    })
  }

  function handleBlock() {
    startTransition(async () => {
      const res = await blockUser(userId)
      if (res && 'error' in res && res.error) flash('err', res.error)
      else flash('ok', 'Utilisateur bloqué')
    })
  }

  function handleChangeRole(newRole: 'admin' | 'herboriste' | 'user') {
    setShowRoleMenu(false)
    startTransition(async () => {
      const res = await changeUserRole(userId, newRole)
      if (res && 'error' in res && res.error) flash('err', res.error)
      else flash('ok', `Rôle changé → ${newRole}`)
    })
  }

  if (isSelf) {
    return <span style={{ fontSize: 12, color: '#BDBDBD', fontStyle: 'italic' }}>(vous)</span>
  }

  const btnBase: React.CSSProperties = {
    height: 28, padding: '0 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
    cursor: isPending ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center',
    gap: 4, border: 'none', opacity: isPending ? 0.6 : 1, flexShrink: 0,
  }

  const ROLE_OPTIONS: { value: 'admin' | 'herboriste' | 'user'; label: string; color: string }[] = [
    { value: 'admin',      label: 'Administrateur', color: '#6B21A8' },
    { value: 'herboriste', label: 'Herboriste',     color: C.primaryDark },
    { value: 'user',       label: 'Utilisateur',    color: '#333' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>

      {/* Ligne 1 : Approuver / Bloquer */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {!approved ? (
          <button onClick={handleApprove} disabled={isPending}
            style={{ ...btnBase, background: C.primaryLight, color: C.primaryDark }}>
            <UserCheck style={{ width: 11, height: 11 }} /> Approuver
          </button>
        ) : (
          <button onClick={handleBlock} disabled={isPending}
            style={{ ...btnBase, background: '#FFF0F0', color: '#D32F2F' }}>
            <UserX style={{ width: 11, height: 11 }} /> Bloquer
          </button>
        )}

        {/* Bouton changer de rôle */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowRoleMenu(v => !v)} disabled={isPending}
            style={{ ...btnBase, background: role === 'admin' ? '#F3E8FF' : '#EFF6FF', color: role === 'admin' ? '#6B21A8' : '#1565C0' }}>
            <Shield style={{ width: 11, height: 11 }} />
            Rôle
            <ChevronDown style={{ width: 10, height: 10 }} />
          </button>

          {showRoleMenu && (
            <div style={{
              position: 'absolute', top: 32, left: 0, zIndex: 50,
              background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)', minWidth: 150, overflow: 'hidden',
            }}>
              {ROLE_OPTIONS.filter(o => o.value !== role).map(o => (
                <button key={o.value} onClick={() => handleChangeRole(o.value)}
                  style={{ width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: 600, color: o.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield style={{ width: 11, height: 11 }} /> {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <span style={{ fontSize: 11, fontWeight: 600, color: feedback.type === 'ok' ? C.primaryDark : '#D32F2F' }}>
          {feedback.type === 'ok' ? '✓' : '✗'} {feedback.msg}
        </span>
      )}
    </div>
  )
}
